/*
Autorização do callback público do Bling. Falha FECHADA: sem um token
configurado (via env `BLINGERP_CALLBACK_TOKEN` ou `callback_token` do app),
a requisição é rejeitada. Um callback público sem verificação aceita um POST
forjado que dispara importação de pedidos/produtos na loja.
*/
export default (
  configuredToken: string | undefined,
  queryToken: unknown,
): boolean => {
  if (!configuredToken) return false;
  return queryToken === configuredToken;
};
