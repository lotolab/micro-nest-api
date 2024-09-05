import zhCNMessages from './locale/cn';
import enUSMessages from './locale/en';

export const BizMessages = (
  locale: LocaleType = 'zhCN',
): Record<number, string> => {
  switch (locale) {
    case 'enUS':
      return enUSMessages;
    case 'zhCN':
      return zhCNMessages;
    default:
      return enUSMessages;
  }
};
