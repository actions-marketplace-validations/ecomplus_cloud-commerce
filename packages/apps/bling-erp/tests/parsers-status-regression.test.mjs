import assert from 'node:assert';
import test, { describe } from 'node:test';
import parseStatusToBling from '../lib/integration/parsers/status-to-bling.js';
import parseStatusFromBling from '../lib/integration/parsers/status-from-bling.js';

const appData = {};

// Situações PADRÃO de uma conta Bling Vendas — não há "Enviado"/"Entregue"/"Faturado".
const DEFAULT_BLING_SITUACOES = [
  'em aberto', 'em andamento', 'atendido', 'cancelado',
  'verificado', 'em digitação', 'venda agenciada',
];

// Emula a orquestração: escolhe a 1ª situação candidata que de fato existe na conta.
const pickSituacao = (candidates, situacoes = DEFAULT_BLING_SITUACOES) =>
  candidates.find((c) => situacoes.includes(c)) ?? candidates[candidates.length - 1];

// C4 — pedido pago e DEVOLVIDO precisa virar "cancelado" no Bling (como no tiny-erp).
// Bug: cai no fall-through e retorna ['aprovado', 'em aberto'] → estoque não
// retorna, financeiro segue como venda válida, NF não é cancelada.
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

// C5 — round-trip de status não pode REGREDIR num Bling com situações padrão.
// delivered/shipped só têm 'atendido' como situação existente, e 'atendido' volta
// como invoice_issued. O conserto certo é em import-order-from-bling (bloquear
// transição para trás), não no parser — por isso fica marcado como `todo`.
describe('C5 — round-trip de status não pode regredir (conta Bling padrão)', () => {
  for (const ecomStatus of ['shipped', 'delivered']) {
    test(`${ecomStatus} não regride para um estado anterior`,
      { todo: 'Corrigir em import-order-from-bling: guardar contra transição para trás' },
      () => {
        const candidates = parseStatusToBling({
          financial_status: { current: 'paid' },
          fulfillment_status: { current: ecomStatus },
        }, appData);
        const situacao = pickSituacao(candidates);
        const back = parseStatusFromBling(situacao, appData);
        assert.strictEqual(
          back.fulfillmentStatus, ecomStatus,
          `${ecomStatus} → "${situacao}" → ${back.fulfillmentStatus}`,
        );
      });
  }
});
