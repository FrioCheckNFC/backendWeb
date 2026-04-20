export class VisitResponseDto {
  id: string;
  tenantId: string;
  technicianId: string;
  machineId: string;
  latitude: number | null;
  longitude: number | null;
  nfcTagId: string | null;
  temperature: number | null;
  notes: string | null;
  status: string | null;
  type: string | null;
  visitedAt: Date | null;
  tenantName: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
