import {
  format,
  subHours,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from 'date-fns';

const FW_DATE_OBJ_FORMAT = 'yyyy-MM-dd HH:mm:ss';

export function betweenLastHours(amount: number = 1): BetweenDateStrType {
  const now = new Date();

  const from = subHours(now, amount);

  return {
    from: format(from, FW_DATE_OBJ_FORMAT),
    to: format(now, FW_DATE_OBJ_FORMAT),
  } as BetweenDateStrType;
}

export function betweenLastDays(amount: number = 1): BetweenDateStrType {
  const now = new Date();

  const from = subDays(now, amount);

  return {
    from: format(from, FW_DATE_OBJ_FORMAT),
    to: format(now, FW_DATE_OBJ_FORMAT),
  } as BetweenDateStrType;
}
/**
 *
 * @returns
 */
export function betweenLastWeek(amount: number = 1): BetweenDateStrType {
  const now = new Date();

  const from = subWeeks(now, amount);

  return {
    from: format(from, FW_DATE_OBJ_FORMAT),
    to: format(now, FW_DATE_OBJ_FORMAT),
  } as BetweenDateStrType;
}

/**
 *
 * @returns
 */
export function betweenLastMonth(amount: number = 1): BetweenDateStrType {
  const now = new Date();
  const from = subMonths(now, amount);

  return {
    from: format(from, FW_DATE_OBJ_FORMAT),
    to: format(now, FW_DATE_OBJ_FORMAT),
  } as BetweenDateStrType;
}

/**
 *
 * @returns
 */
export function betweenLastYear(amount: number = 1): BetweenDateStrType {
  const now = new Date();
  const from = subYears(now, amount);

  return {
    from: format(from, FW_DATE_OBJ_FORMAT),
    to: format(now, FW_DATE_OBJ_FORMAT),
  } as BetweenDateStrType;
}
