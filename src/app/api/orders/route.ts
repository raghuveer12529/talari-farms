import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { sendOrderPlacedEmail } from '@/lib/orderEmails';

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const orders = await prisma.order.findMany({
            include: {
                items: { include: { product: true } },
                statusHistory: {
                    orderBy: { changedAt: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, customerName, customerEmail, customerPhone, address, total } = body;

        const session = await auth();
        const userId = session?.user?.id;

        const order = await prisma.order.create({
            data: {
                userId,
                customerName,
                customerEmail,
                customerPhone,
                address,
                total: parseFloat(total),
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
                statusHistory: {
                    create: {
                        oldStatus: null,
                        newStatus: 'PLACED',
                        changedBy: userId || null,
                    }
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        // Send order confirmation email (don't block on email failure)
        sendOrderPlacedEmail(order).catch(err => {
            console.error('Failed to send order confirmation email:', err);
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
