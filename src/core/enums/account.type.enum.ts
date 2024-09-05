/**
 * account type
 * system-1,admin-2,user-3
 */
export enum AccountTypeEnum {
  SYSTEM = 1,
  ADMIN = 2, // this type for multi-temant system backend user type
  USER = 3,
}

export const AccountTypeMessage = {
  1: 'System user',
  2: 'Admin user',
  3: 'Client user',
};
