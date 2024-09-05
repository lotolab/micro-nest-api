export type IfwcAndOrType = 0 | 1 | 2;

export type IfwcKeywordParamType = {
  field: string;
  word: string;
  andOrNot: IfwcAndOrType;
};

export type IfwcDateParamType = {
  form?: string;
  to?: string;
};

export type IfwcPagerType = {
  pageindex: number;
  pagesize: number;
};

export type IfwcParamType = {
  keywords: Array<IfwcKeywordParamType>;
  grouparticletypes?: Array<number>;
  cityids?: Array<number>;
  sourceids?: Array<number>;
  markinfo?: boolean;
  date?: IfwcDateParamType;
  orderby: string;
} & IfwcPagerType;

export type IFakeNewsType = {
  articlesequenceid: string;
  articletype: string; // webapp
  title: string;
  markinfo?: string; // 摘要
  sameid: number;
  simhash?: string;
  foreignuniquekey: string;
  papername: string;
  paperdate?: number;
  isocode?: string; // 地区编码
  editor: string;
} & Record<string, any>;

export type IFakeNewsDetailType = {
  foreignuniquekey: string;
  contenttxt: string;
} & IFakeNewsType;

export type IQueryFakeNewsResultType = {
  total: number;
  rows: Array<IFakeNewsType>;
  searchTime: number;
  paperIDRows?: any[];
};
