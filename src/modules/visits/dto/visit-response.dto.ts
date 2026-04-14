import { VisitStatus } from '../entities/visit.entity';

export class VisitResponseDto {
  id: string;
  tenantId: string;
  userId: string;
  machineId: string;
  status: VisitStatus;
  checkInTimestamp: Date;
  checkOutTimestamp?: Date;
  checkInGpsLat?: number;
  checkInGpsLng?: number;
  checkOutGpsLat?: number;
  checkOutGpsLng?: number;
  checkInNfcUid?: string;
  checkOutNfcUid?: string;
  isValid: boolean;
  validationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
