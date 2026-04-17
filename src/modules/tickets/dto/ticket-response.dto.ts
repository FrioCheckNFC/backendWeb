import { TicketStatus, TicketPriority } from '../entities/ticket.entity';
import { UserRole } from '../../users/entities/user.entity';
import { MachineStatus } from '../../machines/entities/machine.entity';

// DTO para datos básicos del usuario en respuestas de ticket
export class TicketUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
  active: boolean;
}

// DTO para datos de la máquina en respuestas de ticket
export class TicketMachineDto {
  id: string;
  serialNumber: string;
  model: string;
  brand?: string;
  status: MachineStatus;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  nfcUid?: string;
  description?: string;
}

// DTO de respuesta completa para un ticket individual
export class TicketResponseDto {
  id: string;
  tenantId: string;
  
  // Máquina relacionada
  machine?: TicketMachineDto;
  machineId?: string; // Si machine no existe
  
  // Usuario que reportó
  reportedBy?: TicketUserDto;
  reportedById: string;

  // Usuario asignado
  assignedTo?: TicketUserDto;
  assignedToId?: string;

  // Usuario que resolvió
  resolvedBy?: TicketUserDto;
  resolvedById?: string;

  // Estado del ticket
  priority: TicketPriority;
  status: TicketStatus;

  // Descripción
  title: string;
  description?: string;

  tenantName?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
