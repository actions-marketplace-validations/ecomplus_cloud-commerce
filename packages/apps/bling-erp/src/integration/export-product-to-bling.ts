import type { Products } from '@cloudcommerce/types';
import type Bling from '../bling-auth/client';
import { URLSearchParams } from 'url';
import ecomUtils from '@ecomplus/utils';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';
import { createBlingClient } from '../bling-auth/client';
import parseProduct from './parsers/product-to-bling';
import parseStockFromDeposits from './helpers/parse-stock-from-deposits';

const getBlingStockBalances = (bling: Bling, blingProductId: string | number) => {
  const params = new URLSearchParams({ 'idsProdutos[]': String(blingProductId) });
  return bling.get(`/estoques/saldos?${params.toString()}`)
    .then(({ data }) => data?.data?.[0] as Record<string, any> | undefined)
    .catch((err: any) => {
      logger.warn(`Failed listing Bling stock balances: ${err.message}`);
      return undefined;
    });
};

const exportProductToBling = async (
  apiDoc: Record<string, any>,
  queueEntry: Record<string, any>,
  appData: Record<string, any>,
  canCreateNew?: boolean,
) => {
  const productId = queueEntry.nextId;
  logger.info(`>> Export product to Bling ${productId}`);
  const blingStore = appData.bling_store;
  const blingDeposit = appData.bling_deposit;
  let product: Products;
  if (productId === apiDoc._id) {
    product = apiDoc as Products;
  } else {
    try {
      product = (await api.get(`products/${productId}`)).data;
    } catch (err: any) {
      const status = err.statusCode || err.response?.status;
      if (status >= 400 && status < 500) {
        const error: any = new Error(`O produto ${productId} não existe (:${status})`);
        error.isConfigError = true;
        return error;
      }
      throw err;
    }
  }

  const metafields = (product.metafields || []) as Array<Record<string, any>>;
  const metafieldCodigo = metafields.find(({ field }) => field === 'bling:codigo');
  const metafieldId = metafields.find(({ field }) => field === 'bling:id');
  const blingProductCode = metafieldCodigo?.value || product.sku;
  let blingProductId: string | number | undefined = metafieldId?.value;

  const bling = createBlingClient(appData);
  const urlParams: Record<string, string> = { codigo: String(blingProductCode) };
  if (blingStore) {
    urlParams.idLoja = String(blingStore);
  }
  const params = new URLSearchParams(urlParams);
  const searchEndpoint = `/produtos?${params.toString()}`;

  const findBlingProducts = async () => {
    const endpoint = blingProductId ? `/produtos/${blingProductId}` : searchEndpoint;
    try {
      return (await bling.get(endpoint)).data.data;
    } catch (err: any) {
      if (err.response?.status !== 404) {
        throw err;
      }
      if (blingProductId) {
        return (await bling.get(searchEndpoint)).data.data;
      }
      return null;
    }
  };

  const blingProducts = await findBlingProducts();
  let originalBlingProduct: Record<string, any> | undefined;
  // Resposta de detalhe (`/produtos/{id}`) já é o documento completo
  let isDetailLoaded = false;
  if (Array.isArray(blingProducts) && blingProducts.length) {
    originalBlingProduct = blingProducts.find(({ codigo }) => product.sku === String(codigo));
    if (!blingProductId && originalBlingProduct) {
      blingProductId = originalBlingProduct.id;
    }
    if (!canCreateNew && !originalBlingProduct) {
      logger.info(`${productId} not found on Bling and cannot create new`);
      return null;
    }
  } else if (blingProducts && !Array.isArray(blingProducts)) {
    originalBlingProduct = blingProducts;
    blingProductId = blingProducts.id;
    isDetailLoaded = true;
  }

  let response: any = null;
  let bodyBlingProduct: Record<string, any> | undefined;
  if (canCreateNew || appData.export_quantity || !blingStore) {
    /*
    Listing endpoints return a summarized product, without `variacoes`. The full
    document is required to send each variation with its Bling ID, otherwise the
    update is rejected as if the variations were being created again. Skipped
    when the detail response was already loaded (simple product would repeat an
    identical GET on every exportation).
    */
    if (blingProductId && !isDetailLoaded && !originalBlingProduct?.variacoes) {
      originalBlingProduct = await bling.get(`/produtos/${blingProductId}`)
        .then(({ data }) => data.data)
        .catch(() => originalBlingProduct);
    }
    bodyBlingProduct = parseProduct(product, originalBlingProduct, appData);
    const endpoint = `/produtos${originalBlingProduct ? `/${blingProductId}` : ''}`;
    logger.info(`[${originalBlingProduct ? 'put' : 'post'}]: ${endpoint}`, { bodyBlingProduct });
    response = originalBlingProduct
      ? await bling.put(endpoint, bodyBlingProduct)
      : await bling.post(endpoint, bodyBlingProduct);
  }

  const responseData = response?.data?.data;
  if (responseData?.id) {
    blingProductId = String(responseData.id);
  }
  if (blingProductId) {
    if (metafieldId) {
      metafieldId.value = String(blingProductId);
    } else {
      metafields.push({
        _id: ecomUtils.randomObjectId(),
        namespace: 'bling',
        field: 'bling:id',
        value: String(blingProductId),
      });
    }
  }
  if (blingProductCode && !metafieldCodigo) {
    metafields.push({
      _id: ecomUtils.randomObjectId(),
      namespace: 'bling',
      field: 'bling:codigo',
      value: String(blingProductCode),
    });
  }
  if (metafields.length) {
    await api.patch(`products/${product._id}`, { metafields } as any).catch(logger.error);
  }

  if (!blingProductId) {
    return response;
  }

  /*
  Bling ignores the price sent for each variation when saving the parent product,
  applying the parent price to all of them, so variations priced differently on
  the store must be updated one by one.
  */
  if (bodyBlingProduct?.variacoes?.length) {
    const divergentVariations = bodyBlingProduct.variacoes.filter(({ preco }) => {
      return preco && preco !== bodyBlingProduct!.preco;
    });
    if (divergentVariations.length) {
      const savedVariations = await bling.get(`/produtos/${blingProductId}`)
        .then(({ data }) => data.data?.variacoes as Array<Record<string, any>> | undefined)
        .catch((err: any) => {
          logger.warn(`Failed listing Bling variations: ${err.message}`);
          return undefined;
        });
      for (let i = 0; i < divergentVariations.length; i++) {
        const { codigo, preco } = divergentVariations[i];
        const savedVariation = savedVariations?.find((variacao) => variacao.codigo === codigo);
        if (savedVariation?.id && savedVariation.preco !== preco) {
          logger.info(`Fixing variation ${codigo} price to ${preco}`);
          // eslint-disable-next-line no-await-in-loop
          await bling.put(`/produtos/${savedVariation.id}`, { ...savedVariation, preco })
            .catch((err: any) => {
              const errData = err.response?.data;
              logger.warn(`Failed updating variation ${codigo} price`, {
                response: errData,
              });
            });
        }
      }
    }
  }

  const stockBalances = await getBlingStockBalances(bling, blingProductId);
  const estoqueId = blingDeposit || stockBalances?.depositos?.[0]?.id;
  if (!estoqueId) {
    return response;
  }
  if (!blingDeposit && stockBalances && stockBalances.depositos?.length > 1) {
    /* Sem `bling_deposit` configurado a comparação soma todos os depósitos, mas
    a escrita iria só para o primeiro: a soma nunca converge e o depósito seria
    sobrescrito com o total da loja. Melhor não exportar estoque nesse caso. */
    logger.warn(`Multiple Bling deposits for ${blingProductId} and none configured,`
      + ' skipping stock exportation');
    return response;
  }

  const isVariations = Boolean(product.variations && product.variations.length);
  const isUpdateStock = appData.export_quantity === true || !originalBlingProduct;
  const stockRequests: Array<Promise<any>> = [];
  if (!isVariations) {
    const productQuantity = product.quantity || 0;
    // Compara contra a MESMA base que a importação grava (parseStockFromDeposits):
    // saldoVirtual quando a loja usa reserva, senão saldo físico; do depósito
    // configurado ou somando todos. Comparar contra saldoVirtualTotal (virtual,
    // total) movimentava a cada exportação ou deixava de corrigir o físico.
    const blingBalance = stockBalances
      ? parseStockFromDeposits(stockBalances, blingDeposit, Boolean(appData.has_stock_reserve))
      : undefined;
    if (isUpdateStock && blingBalance !== productQuantity) {
      stockRequests.push(bling.post('/estoques', {
        produto: { id: Number(blingProductId) },
        deposito: { id: Number(estoqueId) },
        operacao: 'B',
        quantidade: productQuantity,
        observacoes: `Update in ${new Date().toISOString()}`,
      }).catch(logger.error));
    }
  } else if (bodyBlingProduct?.variacoes) {
    let newVariations: Array<Record<string, any>> = responseData?.variacoes || [];
    if (!newVariations.length && !originalBlingProduct) {
      /* O `POST /produtos` da API v3 responde só com o id do produto criado,
      então o produto deve ser relido para obter os ids das variações criadas
      e inicializar o estoque de cada uma. */
      newVariations = await bling.get(`/produtos/${blingProductId}`)
        .then(({ data }) => data.data?.variacoes || [])
        .catch((err: any) => {
          logger.warn(`Failed reading created variations: ${err.message}`);
          return [];
        });
    }
    product.variations?.forEach((variation) => {
      const variationFind = bodyBlingProduct!.variacoes.find(({ nome }) => nome === variation.name);
      if (!variationFind) return;
      const newVariation = newVariations.find(({ codigo, nomeVariacao, nome }) => {
        if (codigo && variationFind.codigo) return codigo === variationFind.codigo;
        return (nomeVariacao || nome) === variationFind.variacao?.nome;
      });
      const isUpdateStockVariation = appData.export_quantity === true || Boolean(newVariation);
      const variationBlingId = (newVariation || variationFind).id;
      if (!isUpdateStockVariation || !variationBlingId) return;
      stockRequests.push(bling.post('/estoques', {
        produto: { id: Number(variationBlingId) },
        deposito: { id: Number(estoqueId) },
        operacao: 'B',
        quantidade: variation.quantity || 0,
        observacoes: `Update in ${new Date().toISOString()}`,
      }).catch(logger.error));
    });
  }
  await Promise.all(stockRequests);

  return response;
};

export default exportProductToBling;
