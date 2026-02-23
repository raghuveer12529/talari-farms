import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';

// GET - Fetch all partners with their stats
export async function GET() {
    try {
        const session = await auth();

        // Only admins can view partners
        if ((session?.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const partners = await prisma.user.findMany({
            where: { role: 'PARTNER' },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                _count: {
                    select: {
                        expenses: true,
                        loanSplits: true,
                        expensePayments: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(partners);
    } catch (error) {
        console.error('Error fetching partners:', error);
        return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
    }
}

// POST - Create new partner
export async function POST(request: Request) {
    try {
        const session = await auth();

        // Only admins can create partners
        if ((session?.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { name, email, password } = body;

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create partner
        const partner = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'PARTNER'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        return NextResponse.json(partner, { status: 201 });
    } catch (error) {
        console.error('Error creating partner:', error);
        return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
    }
}
