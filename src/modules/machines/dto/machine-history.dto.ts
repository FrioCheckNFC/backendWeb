import { MachineActivityType } from '../entities/machine-history.entity';

export class MachineHistoryDto {
  id: string;
  machineId: string;
  tenantId: string;
  activityType: MachineActivityType;
  description?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  performedBy?: string;
  createdAt: Date;
}
