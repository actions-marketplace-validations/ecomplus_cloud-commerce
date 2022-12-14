import type {
  ResourceOpQuery,
  Endpoint,
  Config,
  ResponseBody,
  RequestBody,
  ErrorBody,
} from './types';

declare global {
  // eslint-disable-next-line
  var __apiCache: Record<string, {
    timestamp: number,
    res: Response & { data: any },
  }>;
}
if (!globalThis.__apiCache) {
  globalThis.__apiCache = {};
}

// @ts-ignore
const _env: Record<string, string> = import.meta.env
  || (typeof process === 'object' && process?.env)
  || globalThis;

class ApiError extends Error {
  config: Config;
  response?: Response & { data?: ErrorBody };
  statusCode?: number;
  data?: ErrorBody;
  isTimeout: boolean;
  constructor(
    config: Config,
    response?: ApiError['response'],
    msg?: string,
    isTimeout: boolean = false,
  ) {
    if (response) {
      super(response.statusText);
      this.data = response.data;
      this.statusCode = response.status;
    } else {
      super(msg || 'Request error');
    }
    this.config = config;
    this.response = response;
    this.isTimeout = isTimeout;
  }
}

const def = {
  middleware(config: Config) {
    const headers: Headers | Record<string, string> = { ...config.headers };
    if (!config.isNoAuth) {
      if (config.accessToken) {
        // eslint-disable-next-line dot-notation
        headers['Authorization'] = `Bearer ${config.accessToken}`;
      } else {
        const authenticationId = config.authenticationId || _env.ECOM_AUTHENTICATION_ID;
        const apiKey = config.apiKey || _env.ECOM_API_KEY;
        if (authenticationId && apiKey) {
          const rawAuth = `${authenticationId}:${apiKey}`;
          const base64Auth = typeof Buffer === 'function'
            ? Buffer.from(rawAuth).toString('base64') : btoa(rawAuth);
          // eslint-disable-next-line dot-notation
          headers['Authorization'] = `Basic ${base64Auth}`;
        }
      }
    }
    let url = config.baseUrl || _env.API_BASE_URL || 'https://ecomplus.io/v2';
    const { endpoint, params } = config;
    if (
      endpoint !== 'login'
      && endpoint !== 'authenticate'
      && endpoint !== 'ask-auth-callback'
      && endpoint !== 'check-username'
    ) {
      const storeId = config.storeId || _env.ECOM_STORE_ID;
      if (!storeId) {
        throw new Error('`storeId` must be set in config or `ECOM_STORE_ID` env var');
      }
      url += `/:${storeId}`;
      const lang = config.lang || _env.ECOM_LANG;
      if (lang) {
        url += `,lang:${lang}`;
      }
    }
    url += `/${endpoint}`;
    if (params) {
      if (typeof params === 'string') {
        url += `?${params}`;
      } else if (typeof params === 'object') {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          const values = params[key];
          if (Array.isArray(values)) {
            values.forEach((value: string | number) => {
              // https://github.com/microsoft/TypeScript/issues/32951
              searchParams.append(key, value as string);
            });
          } else {
            searchParams.append(key, values as string);
          }
        });
        url += `?${searchParams.toString()}`;
      }
    }
    return { url, headers };
  },
};

const setMiddleware = (middleware: typeof def.middleware) => {
  def.middleware = middleware;
};

const api = async <T extends Config & { body?: any, data?: any }>(config: T, retries = 0):
Promise<Response & {
  config: Config,
  data: ResponseBody<T>,
}> => {
  const { url, headers } = def.middleware(config);
  const {
    method = 'get',
    timeout = 20000,
    maxRetries = 3,
    cacheMaxAge = 600000, // 10 minutes
  } = config;
  const canCache = method === 'get'
    && (config.canCache || (config.canCache === undefined && _env.SSR));
  let cacheKey: string | undefined;
  if (canCache) {
    cacheKey = `${url}${JSON.stringify(headers)}`;
    const cached = globalThis.__apiCache[cacheKey];
    if (cached && Date.now() - cached.timestamp <= cacheMaxAge) {
      return { ...cached.res, config };
    }
  }
  const bodyObject = config.body || config.data;
  let body: string | undefined;
  if (bodyObject) {
    body = JSON.stringify(bodyObject);
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = body.length.toString();
  }

  const abortController = new AbortController();
  let isTimeout = false;
  const timer = setTimeout(() => {
    abortController.abort();
    isTimeout = true;
  }, timeout);
  let response: Response & { data?: any } | undefined;
  try {
    response = await (config.fetch || fetch)(url, {
      method,
      headers,
      body,
      signal: abortController.signal,
    });
  } catch (err: any) {
    throw new ApiError(config, response, err.message, isTimeout);
  }
  clearTimeout(timer);

  if (response) {
    if (response.ok) {
      const res = {
        ...response,
        data: await response.json(),
      };
      if (canCache && cacheKey) {
        globalThis.__apiCache[cacheKey] = {
          timestamp: Date.now(),
          res,
        };
      }
      return { ...res, config };
    }
    const { status } = response;
    if (maxRetries < retries && (status === 429 || status >= 500)) {
      const retryAfter = response.headers.get('retry-after');
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          api(config, retries + 1).then(resolve).catch(reject);
        }, (retryAfter && parseInt(retryAfter, 10)) || 5000);
      });
    }
  }
  try {
    response.data = await response?.json() as ErrorBody;
  } catch (e) {
    //
  }
  throw new ApiError(config, response);
};

type AbstractedConfig = Omit<Config, 'endpoint' | 'method'>;

const get = <E extends Endpoint, C extends AbstractedConfig>(
  endpoint: E,
  config?: C,
): Promise<Response & {
  config: Config,
  data: ResponseBody<{ endpoint: E }>,
}> => api({ ...config, endpoint });

const post = <E extends Endpoint, C extends AbstractedConfig>(
  endpoint: E,
  body: RequestBody<{ endpoint: E, method: 'post' }>,
  config?: E extends 'login' | 'authenticate' ? AbstractedConfig : C,
) => api({
    ...config,
    method: 'post',
    endpoint,
    body,
  });

const put = <E extends Exclude<Endpoint, ResourceOpQuery>, C extends AbstractedConfig>(
  endpoint: E,
  body: RequestBody<{ endpoint: E, method: 'put' }>,
  config?: C,
) => api({
    ...config,
    method: 'put',
    endpoint,
    body,
  });

const patch = (endpoint: Endpoint, body: any, config?: AbstractedConfig) => api({
  ...config,
  method: 'patch',
  endpoint,
  body,
});

const del = (endpoint: Endpoint, config?: AbstractedConfig) => api({
  ...config,
  method: 'delete',
  endpoint,
});

api.get = get;
api.post = post;
api.put = put;
api.patch = patch;
api.del = del;
api.delete = del;

export default api;

export {
  setMiddleware,
  get,
  post,
  put,
  patch,
  del,
  ApiError,
};

export type ApiEndpoint = Endpoint;

export type ApiConfig = Config;

export type ApiErrorBody = ErrorBody;
