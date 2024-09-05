export enum SearcherPeriodEnum {
  all = 'all',
  week = 'week',
  month = 'month',
  twoMonth = 'twoMonth',
  season = 'season',
  sixMonth = 'sixMonth',
  year = 'year',
}

export const SearcherPeriodMessage = {
  all: '全部',
  week: '最近一周',
  month: '近一个月',
  twoMonth: '近两个月',
  season: '近三个月',
  sixMonth: '最近半年',
  year: '近一年',
};

export const getSearcherPeriodSelectorOptions = (): Array<
  SelectorOptionType<string>
> => {
  return Object.keys(SearcherPeriodEnum).map((key) => {
    return {
      label: SearcherPeriodMessage[key] ?? key,
      value: key,
    } as SelectorOptionType<string>;
  });
};
