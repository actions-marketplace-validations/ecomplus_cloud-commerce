import assert from 'node:assert';
import test, { describe } from 'node:test';
import isCallbackAuthorized from '../lib/bling-auth/is-callback-authorized.js';

// C2 — o callback público do Bling deve falhar FECHADO. Sem token configurado,
// um POST forjado dispararia importação de pedidos/produtos na loja.
describe('C2 — autorização do callback Bling (fail-closed)', () => {
  test('sem token configurado rejeita, mesmo sem ?token=', () => {
    assert.strictEqual(isCallbackAuthorized(undefined, undefined), false);
    assert.strictEqual(isCallbackAuthorized('', undefined), false);
  });

  test('sem token configurado rejeita mesmo com ?token= qualquer', () => {
    assert.strictEqual(isCallbackAuthorized(undefined, 'qualquer'), false);
  });

  test('token configurado exige match exato', () => {
    assert.strictEqual(isCallbackAuthorized('segredo', 'errado'), false);
    assert.strictEqual(isCallbackAuthorized('segredo', undefined), false);
    assert.strictEqual(isCallbackAuthorized('segredo', 'segredo'), true);
  });
});
