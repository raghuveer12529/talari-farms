
import { PrismaClient, InterestType, ExpenseCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Loan Data...");

    // 1. Ensure Partners exist
    const partners = [];
    for (let i = 1; i <= 3; i++) {
        const email = `partner${i}@talari.com`;
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: `Partner ${i}`,
                    password: 'password123', // Dummy
                    role: 'PARTNER'
                }
            });
            console.log(`Created ${user.name}`);
        } else {
            console.log(`Found ${user.name}`);
        }
        partners.push(user);
    }

    // 2. Create a Loan Expense
    try {
        const principal = 150000;
        const rate = 10.5;
        const tenure = 24; // months
        // Simple Interest for easy check: (150000 * 10.5 * 2) / 100 = 31500
        const interest = (principal * rate * (tenure / 12)) / 100;
        const total = principal + interest;

        const expense = await prisma.expense.create({
            data: {
                title: "Tractor Loan Test",
                amount: total, // Liability amount
                category: 'LOAN',
                date: new Date(),
                notes: "Seed data verification",
                loan: {
                    create: {
                        principalAmount: principal,
                        interestRate: rate,
                        tenureMonths: tenure,
                        interestType: 'SIMPLE',
                        interestAmount: interest,
                        totalPayable: total,
                        startDate: new Date(),
                        splits: {
                            create: partners.map(p => ({
                                partnerId: p.id,
                                amount: total / 3
                            }))
                        }
                    }
                }
            },
            include: { loan: { include: { splits: true } } }
        });
        console.log("Created Loan Expense:", expense.id);
    } catch (e) {
        console.error("Error creating loan:", e);
    }

    console.log("Seeding complete.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
