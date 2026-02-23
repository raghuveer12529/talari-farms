import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { getFarmWalletBalance, getPartnerSettlements } from '@/actions/expenses';

export async function GET() {
    const session = await auth();

    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [productCount, orderCount, orderTotal, settlements, latestOrder] = await Promise.all([
            prisma.product.count(),
            prisma.order.count(),
            prisma.order.aggregate({ _sum: { total: true } }),
            getPartnerSettlements().catch(() => []),
            prisma.order.findFirst({
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true }
            })
        ]);

        // Try to get wallet balance, but don't fail if Loan table doesn't exist
        let walletBalance = 0;
        try {
            walletBalance = await getFarmWalletBalance();
        } catch (error) {
            console.warn('Could not fetch wallet balance:', error);
        }

        return NextResponse.json({
            productCount,
            orderCount,
            orderTotal: orderTotal._sum.total || 0,
            walletBalance,
            settlements,
            userName: session.user?.name || 'Admin',
            latestOrderTime: latestOrder?.createdAt.toISOString() || null,
        });
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}
