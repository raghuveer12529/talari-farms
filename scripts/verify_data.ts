
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Verifying Expense Query...");
        const expenses = await prisma.expense.findMany({
            include: {
                paidBy: { select: { name: true, email: true } },
                loan: { include: { splits: { include: { partner: { select: { name: true } } } } } }
            },
            orderBy: { date: 'desc' },
        });
        console.log(`Successfully fetched ${expenses.length} expenses.`);
        if (expenses.length > 0) {
            console.log("Sample Expense:", JSON.stringify(expenses[0], null, 2));
        }

        console.log("Verifying Aggregations...");
        const summary = await prisma.expense.groupBy({
            by: ['paidByPartnerId'],
            _sum: { amount: true },
        });
        console.log("Summary aggregated:", summary);

        const loanSplits = await prisma.loanSplit.groupBy({
            by: ['partnerId'],
            _sum: { amount: true }
        });
        console.log("Loan Splits aggregated:", loanSplits);

    } catch (error) {
        console.error("Verification Failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
