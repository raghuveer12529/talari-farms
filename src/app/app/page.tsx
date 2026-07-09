import Link from 'next/link';
import {
  TrendingUp,
  IndianRupee,
  Clock,
  Boxes,
  Users,
  FileText,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/erp/PageHeader';
import { StatCard } from '@/components/erp/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InvoiceStatusBadge } from '@/components/erp/InvoiceStatusBadge';
import { MonthlyRevenueChart, TopProductsChart } from '@/components/erp/DashboardCharts';
import { prisma } from '@/lib/prisma';
import { getStockMap } from '@/lib/stock';
import { formatINR, formatDate, formatNumber } from '@/lib/format';
import { toNum } from '@/lib/serialize';

export const metadata = { title: 'Dashboard | Talari Farms ERP' };

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export default async function DashboardPage() {
  const [invoices, products, stockMap, customerCount, latestCustomers] = await Promise.all([
    prisma.invoice.findMany({
      where: { status: { not: 'CANCELLED' } },
      include: { payments: { select: { amount: true } }, items: true, customer: { select: { companyName: true } } },
      orderBy: { date: 'desc' },
    }),
    prisma.product.findMany({ select: { id: true, name: true, costPrice: true, unit: true, lowStockThreshold: true } }),
    getStockMap(),
    prisma.customer.count(),
    prisma.customer.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, companyName: true, createdAt: true, industry: true } }),
  ]);

  // KPIs
  const totalRevenue = invoices.reduce((s, i) => s + toNum(i.grandTotal), 0);
  const totalReceived = invoices.reduce((s, i) => s + i.payments.reduce((a, p) => a + toNum(p.amount), 0), 0);
  const pendingPayments = Math.max(0, totalRevenue - totalReceived);

  const today = new Date();
  const todaySales = invoices
    .filter((i) => {
      const d = new Date(i.date);
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
    })
    .reduce((s, i) => s + toNum(i.grandTotal), 0);

  const inventoryValue = products.reduce((s, p) => s + (stockMap[p.id]?.current ?? 0) * toNum(p.costPrice), 0);

  // Monthly revenue (last 6 months)
  const months: { label: string; key: string; value: number }[] = [];
  for (let k = 5; k >= 0; k--) {
    const d = new Date(today.getFullYear(), today.getMonth() - k, 1);
    months.push({ label: d.toLocaleDateString('en-IN', { month: 'short' }), key: monthKey(d), value: 0 });
  }
  for (const inv of invoices) {
    const key = monthKey(new Date(inv.date));
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.value += toNum(inv.grandTotal);
  }

  // Top products by invoiced amount
  const productTotals = new Map<string, number>();
  for (const inv of invoices) {
    for (const item of inv.items) {
      productTotals.set(item.description, (productTotals.get(item.description) ?? 0) + toNum(item.amount));
    }
  }
  const topProducts = [...productTotals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Lists
  const recentSales = invoices.slice(0, 5);
  const pendingInvoices = invoices
    .map((i) => ({ ...i, balance: toNum(i.grandTotal) - i.payments.reduce((a, p) => a + toNum(p.amount), 0) }))
    .filter((i) => i.balance > 0.01)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);
  const lowStock = products
    .filter((p) => p.lowStockThreshold > 0 && (stockMap[p.id]?.current ?? 0) <= p.lowStockThreshold)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your Gac Fruit business.">
        <Button asChild variant="outline">
          <Link href="/app/customers/new"><Plus className="size-4" /> Customer</Link>
        </Button>
        <Button asChild>
          <Link href="/app/invoices/new"><Plus className="size-4" /> Invoice</Link>
        </Button>
      </PageHeader>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Revenue" value={formatINR(totalRevenue)} icon={TrendingUp} accent="primary" />
        <StatCard label="Today's Sales" value={formatINR(todaySales)} icon={IndianRupee} accent="emerald" />
        <StatCard label="Pending Payments" value={formatINR(pendingPayments)} icon={Clock} accent="amber" />
        <StatCard label="Inventory Value" value={formatINR(inventoryValue)} icon={Boxes} accent="sky" />
        <StatCard label="Customers" value={String(customerCount)} icon={Users} accent="primary" />
        <StatCard label="Invoices" value={String(invoices.length)} icon={FileText} accent="rose" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Monthly revenue</CardTitle></CardHeader>
          <CardContent><MonthlyRevenueChart data={months.map(({ label, value }) => ({ label, value }))} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top products</CardTitle></CardHeader>
          <CardContent><TopProductsChart data={topProducts} /></CardContent>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent sales</CardTitle>
            <Link href="/app/invoices" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <Empty>No invoices yet.</Empty>
            ) : (
              <div className="divide-y divide-border">
                {recentSales.map((inv) => (
                  <Link key={inv.id} href={`/app/invoices/${inv.id}`} className="flex items-center justify-between py-3 hover:bg-muted/40">
                    <div>
                      <div className="font-semibold text-foreground">{inv.number}</div>
                      <div className="text-xs text-muted-foreground">{inv.customer.companyName} · {formatDate(inv.date)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <InvoiceStatusBadge status={inv.status} />
                      <span className="font-semibold tabular-nums">{formatINR(toNum(inv.grandTotal))}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Pending payments</CardTitle>
            <Link href="/app/payments" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {pendingInvoices.length === 0 ? (
              <Empty>All caught up — no outstanding balances.</Empty>
            ) : (
              <div className="divide-y divide-border">
                {pendingInvoices.map((inv) => (
                  <Link key={inv.id} href={`/app/invoices/${inv.id}`} className="flex items-center justify-between py-3 hover:bg-muted/40">
                    <div>
                      <div className="font-semibold text-foreground">{inv.number}</div>
                      <div className="text-xs text-muted-foreground">{inv.customer.companyName}</div>
                    </div>
                    <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{formatINR(inv.balance)}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">Low stock alert {lowStock.length > 0 && <AlertTriangle className="size-4 text-amber-500" />}</CardTitle>
            <Link href="/app/inventory" className="text-xs font-medium text-primary hover:underline">Inventory</Link>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <Empty>Stock levels are healthy.</Empty>
            ) : (
              <div className="divide-y divide-border">
                {lowStock.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <span className="font-medium text-foreground">{p.name}</span>
                    <Badge variant="warning">
                      {formatNumber(stockMap[p.id]?.current ?? 0)} {p.unit} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Latest customers</CardTitle>
            <Link href="/app/customers" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {latestCustomers.length === 0 ? (
              <Empty>No customers yet.</Empty>
            ) : (
              <div className="divide-y divide-border">
                {latestCustomers.map((c) => (
                  <Link key={c.id} href={`/app/customers/${c.id}`} className="flex items-center justify-between py-3 hover:bg-muted/40">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {c.companyName.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{c.companyName}</div>
                        {c.industry && <div className="text-xs text-muted-foreground">{c.industry}</div>}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>;
}
