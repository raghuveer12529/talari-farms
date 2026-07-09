/* eslint-disable jsx-a11y/alt-text */
import * as React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

const GREEN = '#1B5E20';
const LIGHT = '#E8F2E9';
const GREY = '#6b7280';
const BORDER = '#d7ded8';

export interface InvoicePdfData {
  company: {
    companyName: string;
    address?: string | null;
    gstin?: string | null;
    pan?: string | null;
    email?: string | null;
    phone?: string | null;
    logoUrl?: string | null;
    bankName?: string | null;
    bankAccountName?: string | null;
    bankAccountNo?: string | null;
    bankIfsc?: string | null;
  };
  invoice: {
    number: string;
    date: string;
    dueDate?: string | null;
    placeOfSupply?: string | null;
    isInterState: boolean;
    subtotal: number;
    discountTotal: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    grandTotal: number;
    amountInWords: string;
    notes?: string | null;
    terms?: string | null;
    status: string;
  };
  billTo: { companyName?: string; address?: string; gstin?: string; phone?: string; email?: string };
  shipTo: { companyName?: string; address?: string };
  items: {
    description: string;
    hsnCode?: string | null;
    quantity: number;
    unit: string;
    rate: number;
    discount: number;
    gstRate: number;
    amount: number;
  }[];
}

function money(n: number): string {
  return 'Rs. ' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

const s = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: 'Helvetica', color: '#1a1a1a' },
  row: { flexDirection: 'row' },
  spaceBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  logo: { width: 46, height: 46, marginRight: 10, borderRadius: 6 },
  companyName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: GREEN },
  small: { fontSize: 8, color: GREY, marginTop: 2 },
  titleBox: { alignItems: 'flex-end' },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: GREEN, letterSpacing: 1 },
  metaLabel: { fontSize: 8, color: GREY },
  metaValue: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  partyWrap: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 14 },
  partyBox: { flex: 1, backgroundColor: LIGHT, borderRadius: 6, padding: 10 },
  partyLabel: { fontSize: 7, color: GREEN, fontFamily: 'Helvetica-Bold', letterSpacing: 1, marginBottom: 3 },
  partyName: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  tableHead: { flexDirection: 'row', backgroundColor: GREEN, color: '#fff', paddingVertical: 6, paddingHorizontal: 6, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  th: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#fff' },
  tr: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: BORDER },
  cDesc: { width: '32%' },
  cHsn: { width: '10%' },
  cQty: { width: '13%', textAlign: 'right' },
  cRate: { width: '13%', textAlign: 'right' },
  cGst: { width: '10%', textAlign: 'right' },
  cAmt: { width: '22%', textAlign: 'right' },
  totalsWrap: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  totalsBox: { width: '46%' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  grandRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: GREEN, color: '#fff', padding: 6, borderRadius: 4, marginTop: 4 },
  grandText: { color: '#fff', fontFamily: 'Helvetica-Bold', fontSize: 11 },
  words: { marginTop: 10, fontSize: 9, fontStyle: 'italic' },
  section: { marginTop: 12 },
  sectionLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: GREEN, marginBottom: 3 },
  bankBox: { marginTop: 12, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 10 },
  footer: { position: 'absolute', bottom: 24, left: 32, right: 32, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  signBox: { marginTop: 30, alignItems: 'flex-end' },
});

export function InvoiceDocument({ data }: { data: InvoicePdfData }) {
  const { company, invoice, billTo, shipTo, items } = data;

  return (
    <Document title={`Invoice ${invoice.number}`}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={[s.row, { alignItems: 'flex-start', maxWidth: '60%' }]}>
            {company.logoUrl ? <Image src={company.logoUrl} style={s.logo} /> : null}
            <View>
              <Text style={s.companyName}>{company.companyName}</Text>
              {company.address ? <Text style={s.small}>{company.address}</Text> : null}
              {company.gstin ? <Text style={s.small}>GSTIN: {company.gstin}</Text> : null}
              {company.phone ? <Text style={s.small}>{company.phone}{company.email ? `  ·  ${company.email}` : ''}</Text> : null}
            </View>
          </View>
          <View style={s.titleBox}>
            <Text style={s.title}>TAX INVOICE</Text>
            <View style={{ marginTop: 6, alignItems: 'flex-end' }}>
              <Text style={s.metaLabel}>Invoice No.</Text>
              <Text style={s.metaValue}>{invoice.number}</Text>
              <Text style={[s.metaLabel, { marginTop: 3 }]}>Date</Text>
              <Text style={s.metaValue}>{invoice.date}</Text>
              {invoice.dueDate ? (
                <>
                  <Text style={[s.metaLabel, { marginTop: 3 }]}>Due date</Text>
                  <Text style={s.metaValue}>{invoice.dueDate}</Text>
                </>
              ) : null}
            </View>
          </View>
        </View>

        {/* Parties */}
        <View style={s.partyWrap}>
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>BILL TO</Text>
            <Text style={s.partyName}>{billTo.companyName}</Text>
            {billTo.address ? <Text style={s.small}>{billTo.address}</Text> : null}
            {billTo.gstin ? <Text style={s.small}>GSTIN: {billTo.gstin}</Text> : null}
            {billTo.phone ? <Text style={s.small}>{billTo.phone}</Text> : null}
          </View>
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>SHIP TO</Text>
            <Text style={s.partyName}>{shipTo.companyName}</Text>
            {shipTo.address ? <Text style={s.small}>{shipTo.address}</Text> : null}
            {invoice.placeOfSupply ? <Text style={s.small}>Place of supply: {invoice.placeOfSupply}</Text> : null}
          </View>
        </View>

        {/* Items table */}
        <View style={s.tableHead}>
          <Text style={[s.th, s.cDesc]}>Description</Text>
          <Text style={[s.th, s.cHsn]}>HSN</Text>
          <Text style={[s.th, s.cQty]}>Qty</Text>
          <Text style={[s.th, s.cRate]}>Rate</Text>
          <Text style={[s.th, s.cGst]}>GST%</Text>
          <Text style={[s.th, s.cAmt]}>Amount</Text>
        </View>
        {items.map((item, i) => (
          <View key={i} style={s.tr}>
            <Text style={s.cDesc}>{item.description}</Text>
            <Text style={s.cHsn}>{item.hsnCode ?? '-'}</Text>
            <Text style={s.cQty}>{item.quantity} {item.unit}</Text>
            <Text style={s.cRate}>{money(item.rate)}</Text>
            <Text style={s.cGst}>{item.gstRate}%</Text>
            <Text style={s.cAmt}>{money(item.amount)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totalsWrap}>
          <View style={s.totalsBox}>
            <View style={s.totalRow}><Text style={{ color: GREY }}>Subtotal</Text><Text>{money(invoice.subtotal)}</Text></View>
            {invoice.discountTotal > 0 ? (
              <View style={s.totalRow}><Text style={{ color: GREY }}>Discount</Text><Text>- {money(invoice.discountTotal)}</Text></View>
            ) : null}
            <View style={s.totalRow}><Text style={{ color: GREY }}>Taxable value</Text><Text>{money(invoice.taxableValue)}</Text></View>
            {invoice.isInterState ? (
              <View style={s.totalRow}><Text style={{ color: GREY }}>IGST</Text><Text>{money(invoice.igst)}</Text></View>
            ) : (
              <>
                <View style={s.totalRow}><Text style={{ color: GREY }}>CGST</Text><Text>{money(invoice.cgst)}</Text></View>
                <View style={s.totalRow}><Text style={{ color: GREY }}>SGST</Text><Text>{money(invoice.sgst)}</Text></View>
              </>
            )}
            <View style={s.grandRow}>
              <Text style={s.grandText}>Grand Total</Text>
              <Text style={s.grandText}>{money(invoice.grandTotal)}</Text>
            </View>
          </View>
        </View>

        <Text style={s.words}>{invoice.amountInWords}</Text>

        {/* Bank details */}
        {(company.bankName || company.bankAccountNo) && (
          <View style={s.bankBox}>
            <Text style={s.sectionLabel}>BANK DETAILS</Text>
            <View style={s.spaceBetween}>
              <Text style={s.small}>Bank: {company.bankName}</Text>
              <Text style={s.small}>A/C Name: {company.bankAccountName}</Text>
            </View>
            <View style={s.spaceBetween}>
              <Text style={s.small}>A/C No: {company.bankAccountNo}</Text>
              <Text style={s.small}>IFSC: {company.bankIfsc}</Text>
            </View>
          </View>
        )}

        {/* Terms */}
        {invoice.terms ? (
          <View style={s.section}>
            <Text style={s.sectionLabel}>TERMS & CONDITIONS</Text>
            <Text style={s.small}>{invoice.terms}</Text>
          </View>
        ) : null}

        {/* Signature */}
        <View style={s.signBox}>
          <Text style={{ fontSize: 9 }}>For {company.companyName}</Text>
          <Text style={[s.small, { marginTop: 24 }]}>Authorised Signatory</Text>
        </View>

        {/* Footer with page numbers */}
        <View style={s.footer} fixed>
          <Text style={s.small}>This is a computer-generated invoice.</Text>
          <Text style={s.small} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
