import { IsNotEmpty } from 'class-validator';
import { ILoginUser } from 'src/core/interface';

export class AccountSigninDto implements ILoginUser {
  @IsNotEmpty({
    message: '请输入登录账号',
  })
  account: string;

  @IsNotEmpty({ message: '请输入密码' })
  password: string;
  code?: string;
}
