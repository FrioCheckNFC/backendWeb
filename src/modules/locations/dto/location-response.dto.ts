export class LocationResponseDto {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contactName: string;
  phone: string;
  email: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
