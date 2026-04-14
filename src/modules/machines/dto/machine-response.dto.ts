import { MachineStatus } from '../entities/machine.entity';

export class MachineResponseDto {
  id: string;
  tenantId: string;
  serialNumber: string;
  nfcUid?: string;
  nfcTagId?: string;
  model: string;
  status: MachineStatus;
  locationId: string;
  installedAt?: Date;
  lastActivityAt?: Date;
  currentTemperature?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
