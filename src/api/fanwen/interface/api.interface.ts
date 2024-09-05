export interface IFanwenAPIResponse<T = any> {
  code: number;
  succeed: boolean;
  msg?: string;
  data?: T;
}

export interface IFanwenToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface IfwCityTree {
  id: number;
  name: string;
  list?: Array<IfwCityTree>;
}

export interface SyncCityTreeState {
  size: number;
  affected: number;
  left: Array<IfwCityTree>;
}

export type SearcherPeriodType =
  | 'all'
  | 'week'
  | 'month'
  | 'twoMonth'
  | 'season'
  | 'sixMonth'
  | 'year';
