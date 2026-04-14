import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine } from '../machines/entities/machine.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Visit } from '../visits/entities/visit.entity';
import {
  DashboardSummaryResponseDto,
  MachinesSummaryDto,
  MachinesStatusResponseDto,
  TicketsSummaryDto,
  TicketsResponseDto,
  VisitsSummaryDto,
  VisitsResponseDto,
  VisitsPeriodDto,
} from './dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Machine)
    private machinesRepo: Repository<Machine>,
    @InjectRepository(Ticket)
    private ticketsRepo: Repository<Ticket>,
    @InjectRepository(Visit)
    private visitsRepo: Repository<Visit>,
  ) {}

  /**
   * Obtener resumen general del dashboard
   * Queries optimizadas para múltiples agregaciones
   */
  async getSummary(tenantId: string): Promise<DashboardSummaryResponseDto> {
    const [machines, tickets, visits] = await Promise.all([
      this.getMachinesSummary(tenantId),
      this.getTicketsSummary(tenantId),
      this.getVisitsSummary(tenantId),
    ]);

    return {
      machines,
      tickets,
      visits,
      lastUpdated: new Date(),
    };
  }

  /**
   * Obtener resumen de máquinas - Query optimizada con conteos por estado
   */
  private async getMachinesSummary(
    tenantId: string,
  ): Promise<MachinesSummaryDto> {
    // Single query con agregaciones por estado
    const statusCounts = await this.machinesRepo
      .createQueryBuilder('m')
      .select('m.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('m.tenantId = :tenantId', { tenantId })
      .andWhere('m.deletedAt IS NULL')
      .groupBy('m.status')
      .getRawMany();

    const countByStatus = statusCounts.reduce(
      (acc, row) => {
        acc[row.status] = parseInt(row.count, 10);
        return acc;
      },
      {} as Record<string, number>,
    );

    const total = statusCounts.reduce(
      (sum, row) => sum + parseInt(row.count, 10),
      0,
    );

    return {
      activeMachines: countByStatus['ACTIVE'] || 0,
      inactiveMachines: countByStatus['INACTIVE'] || 0,
      maintenanceMachines: countByStatus['MAINTENANCE'] || 0,
      totalMachines: total,
    };
  }

  /**
   * Obtener resumen de tickets - Query optimizada con conteos por estado y prioridad
   */
  private async getTicketsSummary(
    tenantId: string,
  ): Promise<TicketsSummaryDto> {
    // Query 1: Conteo por estado
    const statusCounts = await this.ticketsRepo
      .createQueryBuilder('t')
      .select('t.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.deletedAt IS NULL')
      .groupBy('t.status')
      .getRawMany();

    // Query 2: Conteo crítico/alto abiertos (más eficiente con índices)
    const priorityCounts = await this.ticketsRepo
      .createQueryBuilder('t')
      .select('t.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.status IN (:...statuses)', {
        statuses: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'],
      })
      .andWhere('t.deletedAt IS NULL')
      .groupBy('t.priority')
      .getRawMany();

    const countByStatus = statusCounts.reduce(
      (acc, row) => {
        acc[row.status] = parseInt(row.count, 10);
        return acc;
      },
      {} as Record<string, number>,
    );

    const countByPriority = priorityCounts.reduce(
      (acc, row) => {
        acc[row.priority] = parseInt(row.count, 10);
        return acc;
      },
      {} as Record<string, number>,
    );

    const openTickets =
      (countByStatus['OPEN'] || 0) +
      (countByStatus['ASSIGNED'] || 0) +
      (countByStatus['IN_PROGRESS'] || 0);

    return {
      openTickets,
      assignedTickets: countByStatus['ASSIGNED'] || 0,
      inProgressTickets: countByStatus['IN_PROGRESS'] || 0,
      totalOpenTickets: openTickets,
      criticalPriority: countByPriority['CRITICAL'] || 0,
      highPriority: countByPriority['HIGH'] || 0,
    };
  }

  /**
   * Obtener resumen de visitas - Query optimizada con timestamp ranges
   */
  private async getVisitsSummary(tenantId: string): Promise<VisitsSummaryDto> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Query: obtener estadísticas agregadas
    const [todayCount, weekCount, monthCount, avgDuration] = await Promise.all([
      this.visitsRepo
        .createQueryBuilder('v')
        .select('COUNT(*)', 'count')
        .addSelect(
          'COUNT(CASE WHEN v.checkOutAt IS NOT NULL THEN 1 END)',
          'completed',
        )
        .where('v.tenantId = :tenantId', { tenantId })
        .andWhere('v.deletedAt IS NULL')
        .andWhere('DATE(v.checkInAt) = DATE(:today)', { today })
        .getRawOne(),
      this.visitsRepo
        .createQueryBuilder('v')
        .select('COUNT(*)', 'count')
        .where('v.tenantId = :tenantId', { tenantId })
        .andWhere('v.deletedAt IS NULL')
        .andWhere('v.checkInAt >= :weekStart', { weekStart })
        .andWhere('v.checkInAt < :nextDay', {
          weekStart,
          nextDay: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
        })
        .getRawOne(),
      this.visitsRepo
        .createQueryBuilder('v')
        .select('COUNT(*)', 'count')
        .where('v.tenantId = :tenantId', { tenantId })
        .andWhere('v.deletedAt IS NULL')
        .andWhere('v.checkInAt >= :monthStart', { monthStart })
        .getRawOne(),
      this.visitsRepo
        .createQueryBuilder('v')
        .select(
          `COALESCE(AVG(EXTRACT(EPOCH FROM (v.checkOutAt - v.checkInAt)) / 60), 0)`,
          'avg_duration',
        )
        .where('v.tenantId = :tenantId', { tenantId })
        .andWhere('v.deletedAt IS NULL')
        .andWhere('v.checkOutAt IS NOT NULL')
        .getRawOne(),
    ]);

    return {
      visitsToday: parseInt(todayCount.count || 0, 10),
      visitsTodayCompleted: parseInt(todayCount.completed || 0, 10),
      visitsThisWeek: parseInt(weekCount.count || 0, 10),
      visitsThisMonth: parseInt(monthCount.count || 0, 10),
      averageVisitDurationMinutes: Math.round(
        parseFloat(avgDuration.avg_duration || 0),
      ),
    };
  }

  /**
   * Obtener estado de máquinas con conteo por estado
   * Query optimizada con índices
   */
  async getMachinesStatus(
    tenantId: string,
  ): Promise<MachinesStatusResponseDto> {
    const statusCounts = await this.machinesRepo
      .createQueryBuilder('m')
      .select('m.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('m.tenantId = :tenantId', { tenantId })
      .andWhere('m.deletedAt IS NULL')
      .groupBy('m.status')
      .getRawMany();

    const breakdown = statusCounts.map((row) => ({
      status: row.status,
      count: parseInt(row.count, 10),
    }));

    const countByStatus = statusCounts.reduce(
      (acc, row) => {
        acc[row.status] = parseInt(row.count, 10);
        return acc;
      },
      {} as Record<string, number>,
    );

    const total = breakdown.reduce((sum, item) => sum + item.count, 0);

    return {
      ACTIVE: countByStatus['ACTIVE'] || 0,
      INACTIVE: countByStatus['INACTIVE'] || 0,
      IN_TRANSIT: countByStatus['IN_TRANSIT'] || 0,
      MAINTENANCE: countByStatus['MAINTENANCE'] || 0,
      DECOMMISSIONED: countByStatus['DECOMMISSIONED'] || 0,
      total,
      statusBreakdown: breakdown,
    };
  }

  /**
   * Obtener información de tickets abiertos con agregaciones
   * Query optimizada con múltiples agregaciones en una sola query
   */
  async getTickets(tenantId: string): Promise<TicketsResponseDto> {
    // Query 1: Conteo por estado y prioridad en una sola query (más eficiente)
    const ticketStats = await this.ticketsRepo
      .createQueryBuilder('t')
      .select('t.status', 'status')
      .addSelect('t.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.deletedAt IS NULL')
      .groupBy('t.status, t.priority')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Reorganizar datos - Por estado
    const byStatus: any[] = [];
    const byStatusMap = new Map<string, number>();
    ticketStats.forEach((row) => {
      const count = parseInt(row.count, 10);
      if (byStatusMap.has(row.status)) {
        byStatusMap.set(row.status, byStatusMap.get(row.status)! + count);
      } else {
        byStatusMap.set(row.status, count);
      }
    });
    byStatusMap.forEach((count, status) => {
      byStatus.push({ status, count });
    });

    // Reorganizar datos - Por prioridad
    const byPriority: any[] = [];
    const byPriorityMap = new Map<string, number>();
    ticketStats.forEach((row) => {
      const count = parseInt(row.count, 10);
      if (byPriorityMap.has(row.priority)) {
        byPriorityMap.set(row.priority, byPriorityMap.get(row.priority)! + count);
      } else {
        byPriorityMap.set(row.priority, count);
      }
    });
    byPriorityMap.forEach((count, priority) => {
      byPriority.push({ priority, count });
    });

    // Contar tickets abiertos por prioridad
    const openTickets = ticketStats.filter(
      (t) =>
        ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status) &&
        ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(t.priority),
    );

    const openByPriority = {
      critical: this.sumByCondition(
        openTickets,
        (t) => t.priority === 'CRITICAL',
      ),
      high: this.sumByCondition(openTickets, (t) => t.priority === 'HIGH'),
      medium: this.sumByCondition(openTickets, (t) => t.priority === 'MEDIUM'),
      low: this.sumByCondition(openTickets, (t) => t.priority === 'LOW'),
    };

    // Query 2: Calcular tiempo promedio de resolución (cuando exista)
    const resolutionTime = await this.ticketsRepo
      .createQueryBuilder('t')
      .select(
        'COALESCE(AVG(EXTRACT(EPOCH FROM (t.updatedAt - t.createdAt)) / 3600), 0)',
        'avg_hours',
      )
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.status = :status', { status: 'CLOSED' })
      .andWhere('t.deletedAt IS NULL')
      .getRawOne();

    const total = ticketStats.reduce(
      (sum, row) => sum + parseInt(row.count, 10),
      0,
    );

    return {
      total,
      byStatus,
      byPriority,
      openByPriority,
      averageResolutionTimeHours: Math.round(
        parseFloat(resolutionTime.avg_hours || 0),
      ),
    };
  }

  /**
   * Obtener información de visitas por período
   * Query optimizada con GROUP BY por período
   */
  async getVisits(tenantId: string): Promise<VisitsResponseDto> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Query optimizada: obtener todas las visitas y calcular períodos
    const visitsData = await this.visitsRepo
      .createQueryBuilder('v')
      .select('v.visitType', 'type')
      .addSelect(
        "DATE(v.checkInAt) >= DATE(:today) AS is_today",
        'is_today',
      )
      .addSelect(
        "DATE(v.checkInAt) >= DATE(:weekStart) AS is_week",
        'is_week',
      )
      .addSelect(
        "DATE(v.checkInAt) >= DATE(:monthStart) AS is_month",
        'is_month',
      )
      .addSelect('COUNT(*)', 'total_count')
      .addSelect(
        'COUNT(CASE WHEN v.checkOutAt IS NOT NULL THEN 1 END)',
        'completed_count',
      )
      .addSelect(
        `COALESCE(AVG(
          EXTRACT(EPOCH FROM (v.checkOutAt - v.checkInAt)) / 60
        ), 0)`,
        'avg_duration',
      )
      .addSelect('COALESCE(AVG(v.nfcScanCount), 0)', 'avg_nfc_scans')
      .where('v.tenantId = :tenantId', { tenantId })
      .andWhere('v.deletedAt IS NULL')
      .andWhere('v.checkInAt >= :monthStart', { monthStart })
      .setParameters({
        tenantId,
        today,
        weekStart,
        monthStart,
      })
      .groupBy('v.visitType')
      .getRawMany();

    // Calcular estadísticas por período
    const [todayStats, weekStats, monthStats] = await Promise.all([
      this.getVisitsPeriod(tenantId, today, 'today'),
      this.getVisitsPeriod(tenantId, weekStart, 'thisWeek'),
      this.getVisitsPeriod(tenantId, monthStart, 'thisMonth'),
    ]);

    // Resumen por tipo
    const byType = visitsData.map((row) => ({
      type: row.type || 'UNKNOWN',
      count: parseInt(row.total_count, 10),
    }));

    const avgDuration =
      visitsData.reduce(
        (sum, v) => sum + parseFloat(v.avg_duration || 0),
        0,
      ) / (visitsData.length || 1);
    const avgNfcScans =
      visitsData.reduce((sum, v) => sum + parseFloat(v.avg_nfc_scans || 0), 0) /
      (visitsData.length || 1);

    return {
      today: todayStats,
      thisWeek: weekStats,
      thisMonth: monthStats,
      byType,
      averageDurationMinutes: Math.round(avgDuration),
      averageNfcScansPerVisit: Math.round(avgNfcScans),
    };
  }

  /**
   * Helper: Obtener estadísticas de visitas para un período específico
   */
  private async getVisitsPeriod(
    tenantId: string,
    startDate: Date,
    period: string,
  ): Promise<VisitsPeriodDto> {
    const endDate = new Date(startDate);
    if (period === 'today') {
      endDate.setDate(startDate.getDate() + 1);
    } else if (period === 'thisWeek') {
      endDate.setDate(startDate.getDate() + 7);
    } else if (period === 'thisMonth') {
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(1);
    }

    const result = await this.visitsRepo
      .createQueryBuilder('v')
      .select('COUNT(CASE WHEN v.checkOutAt IS NOT NULL THEN 1 END)', 'completed')
      .addSelect('COUNT(CASE WHEN v.checkOutAt IS NULL THEN 1 END)', 'pending')
      .addSelect('COUNT(*)', 'total')
      .where('v.tenantId = :tenantId', { tenantId })
      .andWhere('v.deletedAt IS NULL')
      .andWhere('v.checkInAt >= :startDate', { startDate })
      .andWhere('v.checkInAt < :endDate', { endDate })
      .getRawOne();

    return {
      period,
      completed: parseInt(result.completed || 0, 10),
      pending: parseInt(result.pending || 0, 10),
      total: parseInt(result.total || 0, 10),
    };
  }

  /**
   * Helper: Sumar valores según condición
   */
  private sumByCondition(data: any[], condition: (item: any) => boolean): number {
    return data.reduce((sum, item) => {
      if (condition(item)) {
        return sum + parseInt(item.count, 10);
      }
      return sum;
    }, 0);
  }
}
