import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(6, { message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف أو أرقام على الأقل' })
  newPassword: string;
}