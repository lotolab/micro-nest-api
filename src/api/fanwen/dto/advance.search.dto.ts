import { QueryOptionsModel } from 'src/core/model';
import { SearcherPeriodType } from '../interface';

export class SearchAdvanceParamsDto extends QueryOptionsModel {
  peroid: SearcherPeriodType;
  keywords: string;
  classes?: Array<string>;
  cityids?: Array<number>;
  markinfo?: boolean;
}
