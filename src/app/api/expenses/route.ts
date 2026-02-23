import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;

    if (role !== 'ADMIN' && role !== 'PARTNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const expenses = await prisma.expense.findMany({
            include: {
                paidBy: { select: { name: true, email: true } },
                // @ts-ignore - Prisma type inference issue for nested relations
                loan: { include: { splits: { include: { partner: { select: { name: true } } } } } }
            },
            orderBy: { date: 'desc' },
        });

        const summary = await prisma.expense.groupBy({
            by: ['paidByPartnerId'],
            _sum: { amount: true },
        });

        // Augment summary with partner names
        const partners = await prisma.user.findMany({
            where: { role: 'PARTNER' },
            select: { id: true, name: true },
        });

        const partnerSummaries = partners.map(p => ({
            id: p.id,
            name: p.name,
            total: summary.find(s => s.paidByPartnerId === p.id)?._sum?.amount || 0
        }));

        const grandTotal = summary.reduce((acc, curr) => acc + (curr._sum.amount || 0), 0);

        // Calculate loan liabilities
        // @ts-ignore - Prisma client type for loanSplit might be missing in IDE context
        const loanSplits = await prisma.loanSplit.groupBy({
            by: ['partnerId'],
            _sum: { amount: true }
        });

        const loanLiability = partners.map(p => ({
            id: p.id,
            name: p.name,
            liability: (loanSplits as any[]).find(ls => ls.partnerId === p.id)?._sum?.amount || 0
        }));

        const totalLoanLiability = (loanSplits as any[]).reduce((acc, curr) => acc + (curr._sum.amount || 0), 0);

        return NextResponse.json({ expenses, partnerSummaries, grandTotal, loanLiability, totalLoanLiability });
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== 'ADMIN' && role !== 'PARTNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Prepare basic expense data
        const expenseData: any = {
            title: body.title,
            amount: parseFloat(body.amount),
            category: body.category,
            date: new Date(body.date),
            notes: body.notes,
        };

        if (body.paidByPartnerId) {
            expenseData.paidByPartnerId = body.paidByPartnerId;
        }

        // If it's a LOAN, we need extensive handling
        if (body.category === 'LOAN') {
            const { principalAmount, interestRate, tenureMonths, interestType, startDate, splits } = body.loanDetails;

            const p = parseFloat(principalAmount);
            const r = parseFloat(interestRate);
            const t = parseInt(tenureMonths);
            let interest = 0;

            if (interestType === 'SIMPLE') {
                // PTR/100 where T is in years. tenureMonths is months.
                // Formula: (P * R * (T/12)) / 100
                interest = (p * r * (t / 12)) / 100;
            } else if (interestType === 'COMPOUND') {
                // A = P(1 + r/n)^(nt) - P
                // Assuming annually compounded for simplicity unless specified otherwise in requirements. 
                // "Use standard compound interest formula based on tenure"
                // Let's assume n=1 (annually) or n=12 (monthly). Banks usually do monthly reducing but standard CI is annually.
                // Let's stick to simplest CI: A = P * (1 + R/100)^(T/12) - P
                const amountWithInterest = p * Math.pow((1 + r / 100), (t / 12));
                interest = amountWithInterest - p;
            }

            const totalPayable = p + interest;

            // Validate splits
            const totalSplit = splits.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);

            // Allow small float error
            if (Math.abs(totalSplit - totalPayable) > 1) {
                return NextResponse.json({ error: `Split total (${totalSplit.toFixed(2)}) must match Total Payable (${totalPayable.toFixed(2)})` }, { status: 400 });
            }

            // Create Expense with nested Loan and Splits
            const expense = await prisma.expense.create({
                data: {
                    ...expenseData,
                    amount: totalPayable, // For Expense table, let's track the total liability as the amount? 
                    // Or should amount be Principal? 
                    // User requirement: "How much loan was taken... How much interest... Total liability"
                    // If we put Total Payable in expense.amount, grandTotal calculations might double count if we pay it back later via LOAN_EMI.
                    // But for now, let's stick to Total Payable as the "Existing Liability" created.
                    // Wait, usually Expense Amount = Principal received. 
                    // But let's follow the user context: "Loans must be tracked as part of farm expenses".
                    // If we treat it as an expense, it's money OUT? No, incoming loan is money IN, liability is OUT.
                    // But here we are just tracking "Expenses". 
                    // Let's interpret: Expense Record acts as the "Liability Record". 
                    // So Amount should probably be Reference Amount (Principal) or Total Liability?
                    // Let's use Principal as the Expense Amount (what we "spent" / received to spend) OR Total Liability.
                    // Let's decide: Expense.amount = Principal (Base value). Loan.totalPayable = Liability.
                    // BUT, if I put Principal in Expense.amount, then "Grand Total" of expenses will behave like we spent that money.
                    // Which is true, we probably spent the loan money.
                    // Let's use Principal for Expense.amount.

                    loan: {
                        create: {
                            principalAmount: p,
                            interestRate: r,
                            tenureMonths: t,
                            interestType: interestType,
                            interestAmount: interest,
                            totalPayable: totalPayable,
                            startDate: new Date(startDate),
                            splits: {
                                create: splits.map((s: any) => ({
                                    partnerId: s.partnerId,
                                    amount: parseFloat(s.amount)
                                }))
                            }
                        }
                    }
                },
                include: { loan: { include: { splits: true } } }
            });

            return NextResponse.json(expense);

        } else {
            // Regular Expense

            // Ensure paidByPartnerId is present for regular expenses if required by logic,
            // but schema allows nullable. Let's keep existing behavior validation if needed.
            if (!expenseData.paidByPartnerId) {
                // It might be okay to have generic expenses, but let's assume regular expenses need a payer?
                // The previous code didn't strictly validate it besides schema. 
                // Let's assume it's fine.
            }

            const expense = await prisma.expense.create({
                data: expenseData,
            });
            return NextResponse.json(expense);
        }

    } catch (error) {
        console.error("Error creating expense:", error);
        return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
    }
}
