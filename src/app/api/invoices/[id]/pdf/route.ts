import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getCompanySettings } from '@/lib/settings';
import { hasErpAccess, type Role } from '@/lib/permissions';
import { formatDate } from '@/lib/format';
import { toNum } from '@/lib/serialize';
import { InvoiceDocument, type InvoicePdfData } from '@/components/erp/pdf/InvoiceDocument';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Party {
  companyName?: string;
  address?: string;
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !hasErpAccess(session.user.role as Role)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = await params;
  const [invoice, company] = await Promise.all([
    prisma.invoice.findUnique({ where: { id }, include: { items: true } }),
    getCompanySettings(),
  ]);
  if (!invoice) return new Response('Not found', { status: 404 });

  const billTo = (invoice.billTo ?? {}) as Party;
  const shipTo = (invoice.shipTo ?? {}) as Party;

  const data: InvoicePdfData = {
    company: {
      companyName: company.companyName,
      address: company.address,
      gstin: company.gstin,
      pan: company.pan,
      email: company.email,
      phone: company.phone,
      logoUrl: company.logoUrl,
      bankName: company.bankName,
      bankAccountName: company.bankAccountName,
      bankAccountNo: company.bankAccountNo,
      bankIfsc: company.bankIfsc,
    },
    invoice: {
      number: invoice.number,
      date: formatDate(invoice.date),
      dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : null,
      placeOfSupply: invoice.placeOfSupply,
      isInterState: invoice.isInterState,
      subtotal: toNum(invoice.subtotal),
      discountTotal: toNum(invoice.discountTotal),
      taxableValue: toNum(invoice.taxableValue),
      cgst: toNum(invoice.cgst),
      sgst: toNum(invoice.sgst),
      igst: toNum(invoice.igst),
      grandTotal: toNum(invoice.grandTotal),
      amountInWords: invoice.amountInWords,
      notes: invoice.notes,
      terms: invoice.terms,
      status: invoice.status,
    },
    billTo,
    shipTo,
    items: invoice.items.map((i) => ({
      description: i.description,
      hsnCode: i.hsnCode,
      quantity: i.quantity,
      unit: i.unit,
      rate: toNum(i.rate),
      discount: i.discount,
      gstRate: i.gstRate,
      amount: toNum(i.amount),
    })),
  };

  const element = React.createElement(InvoiceDocument, { data }) as unknown as Parameters<
    typeof renderToBuffer
  >[0];
  const buffer = await renderToBuffer(element);

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.number.replace(/\//g, '-')}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
