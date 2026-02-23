import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';

// GET - Fetch single partner
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if ((session?.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        const partner = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        expenses: true,
                        loanSplits: true,
                        expensePayments: true,
                    }
                }
            }
        });

        if (!partner || partner.role !== 'PARTNER') {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
        }

        return NextResponse.json(partner);
    } catch (error) {
        console.error('Error fetching partner:', error);
        return NextResponse.json({ error: 'Failed to fetch partner' }, { status: 500 });
    }
}

// PUT - Update partner
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if ((session?.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, email, password } = body;

        // Check if partner exists
        const existingPartner = await prisma.user.findUnique({
            where: { id }
        });

        if (!existingPartner || existingPartner.role !== 'PARTNER') {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== existingPartner.email) {
            const emailTaken = await prisma.user.findUnique({
                where: { email }
            });

            if (emailTaken) {
                return NextResponse.json(
                    { error: 'Email already exists' },
                    { status: 400 }
                );
            }
        }

        // Prepare update data
        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update partner
        const partner = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        });

        return NextResponse.json(partner);
    } catch (error) {
        console.error('Error updating partner:', error);
        return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
    }
}

// DELETE - Remove partner
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if ((session?.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        // Check if partner exists
        const partner = await prisma.user.findUnique({
            where: { id }
        });

        if (!partner || partner.role !== 'PARTNER') {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
        }

        // Delete partner (cascade will handle related records)
        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Partner deleted successfully' });
    } catch (error) {
        console.error('Error deleting partner:', error);
        return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
    }
}
