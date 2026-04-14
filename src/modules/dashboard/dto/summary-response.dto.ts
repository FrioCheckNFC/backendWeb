export class MachinesSummaryDto {
  activeMachines: number;
  inactiveMachines: number;
  maintenanceMachines: number;
  totalMachines: number;
}

export class TicketsSummaryDto {
  openTickets: number;
  assignedTickets: number;
  inProgressTickets: number;
  totalOpenTickets: number;
  criticalPriority: number;
  highPriority: number;
}

export class VisitsSummaryDto {
  visitsToday: number;
  visitsTodayCompleted: number;
  visitsThisWeek: number;
  visitsThisMonth: number;
  averageVisitDurationMinutes: number;
}

export class DashboardSummaryResponseDto {
  machines: MachinesSummaryDto;
  tickets: TicketsSummaryDto;
  visits: VisitsSummaryDto;
  lastUpdated: Date;
}
