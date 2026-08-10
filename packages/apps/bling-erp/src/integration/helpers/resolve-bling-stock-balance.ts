/*
Retorna o saldo FÍSICO do depósito `estoqueId` a partir do `depositos[]` de
`/estoques/saldos`. Espelha o que a importação lê (`saldo` || `saldoFisico`),
para que a exportação compare a quantidade da loja contra a MESMA base — e não
contra `saldoVirtualTotal` (virtual, somado de todos os depósitos), que gera
movimentação redundante ou deixa de corrigir o físico em lojas com reserva ou
múltiplos depósitos. Devolve `undefined` quando o depósito não está na lista.
*/
const resolveBlingStockBalance = (
  depositos: Array<Record<string, any>> | undefined,
  estoqueId: string | number | undefined,
): number | undefined => {
  if (!Array.isArray(depositos)) return undefined;
  const deposit = depositos.find((d) => String(d?.id) === String(estoqueId));
  if (!deposit) return undefined;
  const saldo = typeof deposit.saldo === 'number'
    ? deposit.saldo
    : Number(deposit.saldoFisico);
  return Number.isNaN(saldo) ? undefined : saldo;
};

export default resolveBlingStockBalance;
