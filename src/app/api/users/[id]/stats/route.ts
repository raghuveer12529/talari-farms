import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id: userId } = await params;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                orders: {
                    include: {
                        items: {
                            include: {
                                product: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const totalOrders = user.orders.length;
        const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
        const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        const firstOrderDate = totalOrders > 0 ? user.orders[totalOrders - 1].createdAt : null;
        const lastOrderDate = totalOrders > 0 ? user.orders[0].createdAt : null;

        const lastOrder = totalOrders > 0 ? user.orders[0] : null;

        const stats = {
            totalOrders,
            totalSpent,
            avgOrderValue,
            firstOrderDate,
            lastOrderDate,
            lastOrder: lastOrder ? {
                id: lastOrder.id,
                createdAt: lastOrder.createdAt,
                total: lastOrder.total,
                status: lastOrder.status,
                items: lastOrder.items.map(item => ({
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            } : null
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Failed to fetch user stats:', error);
        return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
    }
}
