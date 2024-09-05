export interface RecursionRegionState {
  root: RegionTreeExType;
  file: string;
}

export interface RecursionRegionParams {
  nextsid: number;
  file: string;
  root: RegionTreeExType;
}

export interface IGBRegionNode {
  code: string;
  name: string;
  province: string;
  city?: string;
  area?: string;
  children?: Array<IGBRegionNode>;
}
