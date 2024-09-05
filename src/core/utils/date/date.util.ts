import {
  format,
  addDays,
  addSeconds,
  addHours,
  addMonths,
  addWeeks,
  addYears,
  addMinutes,
} from 'date-fns';

export const formatDate = (date?: any): string => {
  if (!date) date = new Date();
  if (date instanceof Date) {
    return format(date as unknown as Date, 'yyyy-MM-dd');
  }
  const _date = new Date(date);

  return format(_date, 'yyyy-MM-dd');
};

export const formatDateTime = (
  date?: any,
  expr: string = 'yyyy-MM-dd HH:mm:ss',
): string => {
  if (!date) date = new Date();
  if (date instanceof Date) {
    return format(date as unknown as Date, expr);
  }
  const _date = new Date(date);

  return format(_date, expr);
};

export const increaseDay = (
  from: Date | number | string,
  amount: number,
): Date => {
  return addDays(from, amount);
};

/**
 *
 * @param from date,number or date string
 * @param amount 1d,1s,1h,1w,1m or 1y ,if amount is an number default seconds
 * @returns Date
 */
export const increaseDate = (
  from: Date | number | string,
  amount: string | number,
): Date => {
  const strAmount: string = String(amount);
  const len = strAmount.length;
  if (typeof amount === 'number') {
    return addSeconds(from, amount as number);
  } else if (/^\d+d$/.test(amount)) {
    return addDays(from, Number(strAmount.substring(0, len - 1)));
  } else if (/^\d+h$/.test(amount)) {
    return addHours(from, Number(strAmount.substring(0, len - 1)));
  } else if (/^\d+m$/.test(amount)) {
    return addMinutes(from, Number(strAmount.substring(0, len - 1)));
  } else if (/^\d+M$/.test(amount)) {
    return addMonths(from, Number(strAmount.substring(0, len - 1)));
  } else if (/^\d+s$/.test(amount)) {
    return addSeconds(from, Number(strAmount.substring(0, len - 1)));
  } else if (/^\d+w$/.test(amount)) {
    return addWeeks(from, Number(strAmount.substring(0, len - 1)));
  } else if (/^\d+y$/.test(amount)) {
    return addYears(from, Number(strAmount.substring(0, len - 1)));
  } else {
    throw new Error(`Parameter amount illegal ${amount}.`);
  }
};

/**
 * 计算
 * @param value
 * @returns duration seconds
 *
 */
export const convertDiffToSeconds = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!/^\d+(d|h|m|M|s|w|y)$/.test(value))
    throw new Error(`Parameter value illegal ${value}.`);
  const strAmount: string = String(value);

  const now = new Date().valueOf();
  const duration = increaseDate(now, strAmount);

  return Math.floor((duration.valueOf() - now) / 1000);
};
