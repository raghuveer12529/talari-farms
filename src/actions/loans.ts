'use server';

import { LoanStatus, InterestType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export type AddLoanState = {
    errors?: {
        name?: string[];
        principalAmount?: string[];
        interestRate?: string[];
        tenure?: string[];
        startDate?: string[];
        _form?: string[];
    };
    message?: string;
};

export async function addLoan(prevState: AddLoanState, formData: FormData): Promise<AddLoanState> {
    const name = formData.get('name') as string;
    const principalStr = formData.get('principalAmount') as string;
    const rateStr = formData.get('interestRate') as string;
    const tenureStr = formData.get('tenureMonths') as string;
    const type = formData.get('interestType') as InterestType;
    const dateStr = formData.get('startDate') as string;

    const principal = parseFloat(principalStr);
    const rate = parseFloat(rateStr);
    const tenure = parseInt(tenureStr);
    const startDate = new Date(dateStr);

    if (!name) return { errors: { name: ['Name is required'] } };
    if (isNaN(principal) || principal <= 0) return { errors: { principalAmount: ['Invalid amount'] } };

    // Calculate Interest (Simple MVP calc)
    // Simple Interest: P * R * T / 100
    // Monthly rate? Usually annual. "Annual rate in percentage".
    // Time in years = tenure / 12.
    let interestAmount = 0;
    if (type === 'SIMPLE') {
        interestAmount = (principal * rate * (tenure / 12)) / 100;
    } else {
        // Compound Not implemented for MVP yet or simple annual compound
        interestAmount = (principal * Math.pow((1 + rate / 100), tenure / 12)) - principal;
    }

    const totalPayable = principal + interestAmount;

    try {
        const loan = await prisma.loan.create({
            data: {
                name,
                principalAmount: principal,
                interestRate: rate,
                tenureMonths: tenure,
                interestType: type,
                interestAmount,
                totalPayable,
                startDate,
                status: 'ACTIVE',
            },
        });

        // Create splits? "Loan repayment responsibility is equally split".
        // We can store splits for display, or derive them.
        // Let's create them for record keeping if needed, or just skip as it's default.
        // The schema has LoanSplit[], let's populate it.
        const partners = await prisma.user.findMany({ where: { role: 'PARTNER' } });
        if (partners.length > 0) {
            const splitAmount = totalPayable / partners.length;
            await prisma.loanSplit.createMany({
                data: partners.map(p => ({
                    loanId: loan.id,
                    partnerId: p.id,
                    amount: splitAmount
                }))
            });
        }

        revalidatePath('/admin/loans');
        revalidatePath('/admin/dashboard');
        return { message: 'Loan added successfully' };
    } catch (error) {
        console.error('Error adding loan:', error);
        return { errors: { _form: ['Failed to add loan'] } };
    }
}

export async function getLoans() {
    return await prisma.loan.findMany({
        orderBy: { startDate: 'desc' },
        include: { splits: { include: { partner: true } } }
    });
}
