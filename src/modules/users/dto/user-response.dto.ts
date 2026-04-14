import { UserRole } from './create-user.dto';

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  phone?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
