'use server';

import { PaymentSource, ExpenseCategory } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export type AddExpenseState = {
    errors?: {
        title?: string[];
        amount?: string[];
        paymentSource?: string[];
        paidByPartnerId?: string[];
        category?: string[];
        _form?: string[];
    };
    message?: string;
};

export async function addExpense(prevState: AddExpenseState, formData: FormData): Promise<AddExpenseState> {
    const title = formData.get('title') as string;
    const amountStr = formData.get('amount') as string;
    const category = formData.get('category') as ExpenseCategory;
    const notes = formData.get('notes') as string | null;

    // Parse numeric amount
    const amount = parseFloat(amountStr);

    // Parse Split Details (JSON string from frontend)
    // Structure: { wallet: number, partners: { [partnerId: string]: number } }
    const splitDetailsStr = formData.get('splitDetails') as string;
    let splitDetails = { wallet: 0, partners: {} as Record<string, number> };

    // If we are getting the old form data (e.g. from a simple form submitted without JS or fallback),
    // we might receive paymentSource directly. However, we are moving to the new form found in AddExpenseForm.
    // For backward compatibility or direct calls:
    const legacyPaymentSource = formData.get('paymentSource') as PaymentSource;
    const legacyPaidBy = formData.get('paidByPartnerId') as string;

    if (!splitDetailsStr) {
        // Fallback for simple addition if JSON missing
        splitDetails.wallet = legacyPaymentSource === 'FARM_WALLET' ? amount : 0;
        if (legacyPaymentSource === 'PARTNER' && legacyPaidBy) {
            splitDetails.partners[legacyPaidBy] = amount;
        }
    } else {
        try {
            splitDetails = JSON.parse(splitDetailsStr);
        } catch (e) {
            return { errors: { _form: ['Invalid payment split data'] } };
        }
    }

    // Validation
    if (!title || title.length < 3) return { errors: { title: ['Title must be at least 3 characters'] } };
    if (isNaN(amount) || amount <= 0) return { errors: { amount: ['Amount must be a positive number'] } };

    // Validate Total Split matches Amount
    const totalPartnerPay = Object.values(splitDetails.partners).reduce((sum, val) => sum + (val || 0), 0);
    const totalPay = splitDetails.wallet + totalPartnerPay;

    // Allow small float diff
    if (Math.abs(totalPay - amount) > 0.1) {
        return { errors: { _form: [`Payment mismatch: Total ${totalPay} != Expense ${amount}`] } };
    }

    // Validate Wallet Balance if checking
    if (splitDetails.wallet > 0) {
        const balance = await getFarmWalletBalance();
        if (balance < splitDetails.wallet) {
            return { errors: { _form: [`Insufficient Farm Wallet Balance. Available: ₹${balance}`] } };
        }
    }

    try {
        // Determine primary source for summary
        let primarySource: PaymentSource = 'MIXED';
        if (splitDetails.wallet > 0.1 && totalPartnerPay < 0.1) primarySource = 'FARM_WALLET';
        else if (splitDetails.wallet < 0.1 && totalPartnerPay > 0.1) primarySource = 'PARTNER';

        // Create Expense
        const expense = await prisma.expense.create({
            data: {
                title,
                amount,
                paymentSource: primarySource,
                category,
                notes,
            },
        });

        // Create ExpensePayments
        const paymentsData = [];

        // 1. Wallet Payment
        if (splitDetails.wallet > 0) {
            paymentsData.push({
                expenseId: expense.id,
                amount: splitDetails.wallet,
                source: 'FARM_WALLET' as PaymentSource,
                partnerId: null
            });
        }

        // 2. Partner Payments
        for (const [partnerId, pAmount] of Object.entries(splitDetails.partners)) {
            if ((pAmount as number) > 0) {
                paymentsData.push({
                    expenseId: expense.id,
                    amount: pAmount as number,
                    source: 'PARTNER' as PaymentSource,
                    partnerId: partnerId
                });
            }
        }

        if (paymentsData.length > 0) {
            await prisma.expensePayment.createMany({
                data: paymentsData
            });
        }

        revalidatePath('/admin/expenses');
        revalidatePath('/admin/dashboard');
        return { message: 'Expense added successfully' };
    } catch (error) {
        console.error('Error adding expense:', error);
        return { errors: { _form: ['Failed to save expense'] } };
    }
}

export async function getExpenses() {
    return await prisma.expense.findMany({
        orderBy: { date: 'desc' },
        include: {
            payments: {
                include: { partner: true }
            },
            paidBy: true // Include legacy relation for display if needed
        },
    });
}

// FARM WALLET LOGIC using ExpensePayment
export async function getFarmWalletBalance() {
    let totalInflow = 0;

    // Try to get loans, but don't fail if Loan table doesn't exist
    try {
        const loans = await prisma.loan.findMany({
            where: { status: 'ACTIVE' },
        });
        totalInflow = loans.reduce((sum, loan) => sum + loan.principalAmount, 0);
    } catch (error) {
        console.warn('Could not fetch loans (table may not exist):', error);
        totalInflow = 0;
    }

    // Sum of all payments made FROM WALLET
    const walletPayments = await prisma.expensePayment.aggregate({
        where: { source: 'FARM_WALLET' },
        _sum: { amount: true }
    });

    const totalOutflow = walletPayments._sum.amount || 0;

    return totalInflow - totalOutflow;
}

// PARTNER SETTLEMENT LOGIC using ExpensePayment
export async function getPartnerSettlements() {
    const partners = await prisma.user.findMany({
        where: { role: 'PARTNER' },
    });

    // Get all payments made BY PARTNERS
    const partnerPayments = await prisma.expensePayment.findMany({
        where: { source: 'PARTNER' },
        include: { partner: true }
    });

    const settlements = partners.map(partner => {
        // 1. Total Paid by this partner
        const totalPaid = partnerPayments
            .filter(p => p.partnerId === partner.id)
            .reduce((sum, p) => sum + p.amount, 0);

        // 2. Share of Total Partner-Funded Expenses
        // Note: We only split Partner-funded amounts. Wallet-funded amounts assume equal ownership usage.
        const totalPartnerFunded = partnerPayments.reduce((sum, p) => sum + p.amount, 0);
        const myShare = totalPartnerFunded / 3;

        const netBalance = totalPaid - myShare;

        return {
            partnerName: partner.name,
            totalPaid,
            totalShare: myShare,
            netBalance,
        };
    });

    return settlements;
}
