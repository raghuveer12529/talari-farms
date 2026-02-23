import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                orders: {
                    select: {
                        total: true,
                        createdAt: true,
                    },
                },
            },
        });

        const usersWithStats = users.map(user => {
            const totalOrders = user.orders.length;
            const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
            const lastOrderDate = user.orders.length > 0
                ? user.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
                : null;

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                totalOrders,
                totalSpent,
                lastOrderDate,
            };
        });

        return NextResponse.json(usersWithStats);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
