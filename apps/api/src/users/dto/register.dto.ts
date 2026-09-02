import { IsEmail, IsIn, IsNotEmpty, MinLength } from 'class-validator';
import type { UserRole } from '@ticket-manager/types';

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(8) // placeholder policy — see RFC 0002, password strength is still "Decision Required"
  password: string;

  @IsNotEmpty()
  @IsIn(['PO', 'PM', 'DEVELOPER', 'QA'])
  role: UserRole;
}
