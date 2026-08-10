import assert from 'node:assert';
import test, { describe } from 'node:test';
import resolveBlingStockBalance from '../lib/integration/helpers/resolve-bling-stock-balance.js';

// C6 — comparar contra o saldo FÍSICO do depósito usado, não saldoVirtualTotal.
describe('C6 — saldo físico do depósito do Bling', () => {
  const depositos = [
    { id: 10, saldoFisico: 12, saldoVirtual: 8 },
    { id: 20, saldoFisico: 5, saldoVirtual: 5 },
  ];

  test('usa saldoFisico do depósito escolhido', () => {
    assert.strictEqual(resolveBlingStockBalance(depositos, 10), 12);
    assert.strictEqual(resolveBlingStockBalance(depositos, 20), 5);
  });

  test('não usa saldoVirtual (evita movimentação redundante com reserva)', () => {
    // físico 12, virtual 8; a base tem que ser o físico (12), não 8.
    assert.notStrictEqual(resolveBlingStockBalance(depositos, 10), 8);
  });

  test('prefere `saldo` numérico quando presente', () => {
    assert.strictEqual(resolveBlingStockBalance([{ id: 10, saldo: 7, saldoFisico: 12 }], 10), 7);
  });

  test('casa id como string ou número', () => {
    assert.strictEqual(resolveBlingStockBalance(depositos, '10'), 12);
  });

  test('depósito ausente devolve undefined', () => {
    assert.strictEqual(resolveBlingStockBalance(depositos, 99), undefined);
    assert.strictEqual(resolveBlingStockBalance(undefined, 10), undefined);
  });
});
