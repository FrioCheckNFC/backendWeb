export class MachineStatusCountDto {
  status: string;
  count: number;
}

export class MachinesStatusResponseDto {
  ACTIVE: number;
  INACTIVE: number;
  IN_TRANSIT: number;
  MAINTENANCE: number;
  DECOMMISSIONED: number;
  total: number;
  statusBreakdown: MachineStatusCountDto[];
}
