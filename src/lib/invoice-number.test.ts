import { describe, it, expect, vi } from 'vitest';
import { nextDocNumber } from './invoice-number';

/** Build a fake transaction client with an in-memory counter store. */
function fakeTx(initial: Record<string, number> = {}) {
  const store = { ...initial };
  return {
    counter: {
      upsert: vi.fn(async ({ where, create }: { where: { id: string }; create: { value: number } }) => {
        const id = where.id;
        store[id] = (store[id] ?? 0) + 1 || create.value;
        return { id, value: store[id] };
      }),
    },
  } as never;
}

describe('nextDocNumber', () => {
  it('formats as PREFIX/FY/0001 zero-padded', async () => {
    const n = await nextDocNumber('TF', 'invoice', new Date(2026, 5, 30), fakeTx());
    expect(n).toBe('TF/26-27/0001');
  });

  it('increments the sequence within the same FY', async () => {
    const tx = fakeTx();
    const a = await nextDocNumber('TF', 'invoice', new Date(2026, 5, 1), tx);
    const b = await nextDocNumber('TF', 'invoice', new Date(2026, 6, 1), tx);
    const c = await nextDocNumber('TF', 'invoice', new Date(2026, 7, 1), tx);
    expect([a, b, c]).toEqual(['TF/26-27/0001', 'TF/26-27/0002', 'TF/26-27/0003']);
  });

  it('uses separate counters per FY and per document type', async () => {
    const tx = fakeTx();
    const inv2627 = await nextDocNumber('TF', 'invoice', new Date(2026, 5, 1), tx);
    const inv2526 = await nextDocNumber('TF', 'invoice', new Date(2026, 1, 1), tx); // Feb 2026 -> 25-26
    const receipt = await nextDocNumber('RCPT', 'receipt', new Date(2026, 5, 1), tx);
    expect(inv2627).toBe('TF/26-27/0001');
    expect(inv2526).toBe('TF/25-26/0001');
    expect(receipt).toBe('RCPT/26-27/0001');
  });

  it('pads sequences beyond 4 digits gracefully', async () => {
    const tx = fakeTx({ 'invoice-26-27': 1233 });
    const n = await nextDocNumber('TF', 'invoice', new Date(2026, 5, 1), tx);
    expect(n).toBe('TF/26-27/1234');
  });
});
