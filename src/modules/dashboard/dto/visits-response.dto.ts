export class VisitTypeSummaryDto {
  type: string;
  count: number;
}

export class VisitsPeriodDto {
  period: string;
  completed: number;
  pending: number;
  total: number;
}

export class VisitsResponseDto {
  today: VisitsPeriodDto;
  thisWeek: VisitsPeriodDto;
  thisMonth: VisitsPeriodDto;
  byType: VisitTypeSummaryDto[];
  averageDurationMinutes: number;
  averageNfcScansPerVisit: number;
}
