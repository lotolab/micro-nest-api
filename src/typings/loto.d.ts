type LotoModuleRouteType = {
  name: string;
  modulePath: string;
  desc?: string;
} & Record<string, any>;

type LotoResponseType<T = any> = {
  code: number;
  message: string;
  result?: T | undefined;
  error?: string | string[] | object | undefined;
  localeMessage?: string;
};

type BetweenDateType = {
  from?: Date;
  to?: Date;
};

type BetweenDateStrType = {
  from?: string;
  to?: string;
};

type IQueryOptions = {
  readonly page?: number;
  readonly pageSize?: number;
};

type PaginationResultData<T = any> = {
  total: number;
  page: number;
  pageSize: number;
  pageCount?: number; // 兼容Admin
  list: T[];
};
