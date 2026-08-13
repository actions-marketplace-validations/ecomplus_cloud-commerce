/*
Marca as escritas do próprio app na Store API para que o polling de eventos
(`check-store-events.ts` consulta com `flag!=_skip`) nunca as devolva como
evento, evitando o loop importação -> evento -> exportação de volta ao Bling.
Mesmo valor de `EVENT_SKIP_FLAG` em `@cloudcommerce/firebase/src/const.ts`,
que não é exportado para os apps.
*/
const skipEventHeaders: Record<string, string> = {
  'X-Event-Flag': '_skip',
};

export default skipEventHeaders;
