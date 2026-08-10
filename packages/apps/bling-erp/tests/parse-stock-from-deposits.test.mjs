import assert from 'node:assert';
import test, { describe } from 'node:test';
import parseStockFromDeposits from '../lib/integration/helpers/parse-stock-from-deposits.js';

// C6 — import e export precisam usar EXATAMENTE a mesma base de estoque.
// Com reserva: saldoVirtual; sem reserva: saldo/saldoFisico; filtra pelo
// depósito configurado ou soma todos.
describe('C6 — parseStockFromDeposits (base única import/export)', () => {
  const item = {
    depositos: [
      { id: 10, saldoFisico: 12, saldoVirtual: 8 },
      { id: 20, saldoFisico: 5, saldoVirtual: 5 },
    ],
  };

  test('sem reserva usa o saldo físico do depósito configurado', () => {
    assert.strictEqual(parseStockFromDeposits(item, 10, false), 12);
    assert.strictEqual(parseStockFromDeposits(item, 20, false), 5);
  });

  test('com reserva usa o saldo virtual do depósito configurado', () => {
    assert.strictEqual(parseStockFromDeposits(item, 10, true), 8);
  });

  test('sem depósito configurado soma TODOS os depósitos', () => {
    assert.strictEqual(parseStockFromDeposits(item, undefined, false), 17); // 12 + 5
    assert.strictEqual(parseStockFromDeposits(item, undefined, true), 13); // 8 + 5
  });

  test('prefere `saldo` numérico a `saldoFisico`', () => {
    assert.strictEqual(parseStockFromDeposits({ depositos: [{ id: 10, saldo: 7, saldoFisico: 12 }] }, 10, false), 7);
  });

  test('casa id como string ou número', () => {
    assert.strictEqual(parseStockFromDeposits(item, '10', false), 12);
  });

  test('sem depositos válidos devolve 0', () => {
    assert.strictEqual(parseStockFromDeposits({}, 10, false), 0);
    assert.strictEqual(parseStockFromDeposits(undefined, 10, false), 0);
  });
});
