export class TicketStatusCountDto {
  status: string;
  count: number;
}

export class TicketPriorityCountDto {
  priority: string;
  count: number;
}

export class TicketsResponseDto {
  total: number;
  byStatus: TicketStatusCountDto[];
  byPriority: TicketPriorityCountDto[];
  openByPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  averageResolutionTimeHours: number;
}
