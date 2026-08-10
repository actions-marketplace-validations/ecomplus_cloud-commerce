import assert from 'node:assert';
import test, { describe } from 'node:test';
import parseStatusToBling from '../lib/integration/parsers/status-to-bling.js';

const appData = {};

// C4 — pedido pago e DEVOLVIDO precisa virar "cancelado" no Bling (como no tiny-erp).
// Bug: cai no fall-through e retorna ['aprovado', 'em aberto'] → estoque não
// retorna, financeiro segue como venda válida, NF não é cancelada.
//
// C5 (round-trip que regride "entregue" para "nf emitida" em contas Bling padrão)
// é tratado no import — ver tests/guard-fulfillment-transition.test.mjs.
describe('C4 — pedido devolvido deve ser cancelado no Bling', () => {
  test('paid + returned não pode virar "aprovado"', () => {
    const statuses = parseStatusToBling({
      financial_status: { current: 'paid' },
      fulfillment_status: { current: 'returned' },
    }, appData);
    assert.ok(
      statuses.includes('cancelado'),
      `esperava incluir 'cancelado', veio ${JSON.stringify(statuses)}`,
    );
  });
});
