export class LocationResponseDto {
  id: string;
  tenantId: string;
  sectorId: string;
  retailerId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  retailerName: string;
  retailerRut: string;
  retailerPhone: string;
  retailerEmail: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
