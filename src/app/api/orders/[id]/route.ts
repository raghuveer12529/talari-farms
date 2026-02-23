import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { sendOrderPackedEmail, sendOrderShippedEmail } from '@/lib/orderEmails';

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { status } = body;

        // Get current order to check for duplicate status
        const currentOrder = await prisma.order.findUnique({
            where: { id: params.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!currentOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Prevent duplicate status changes
        if (currentOrder.status === status) {
            return NextResponse.json({
                error: 'Order already has this status',
                order: currentOrder
            }, { status: 400 });
        }

        // Update order status and create history record
        const order = await prisma.order.update({
            where: { id: params.id },
            data: {
                status,
                statusHistory: {
                    create: {
                        oldStatus: currentOrder.status,
                        newStatus: status,
                        changedBy: session.user?.id || null,
                    }
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                statusHistory: {
                    orderBy: { changedAt: 'desc' }
                }
            }
        });

        // Send appropriate email based on new status (don't block on email failure)
        if (status === 'PACKED') {
            sendOrderPackedEmail(order).catch(err => {
                console.error('Failed to send order packed email:', err);
            });
        } else if (status === 'SHIPPED') {
            sendOrderShippedEmail(order).catch(err => {
                console.error('Failed to send order shipped email:', err);
            });
        }
        // DELIVERED and CANCELLED don't send emails in MVP

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
