// filepath: src/modules/kpis/kpis.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, FindOptionsWhere } from 'typeorm';
import { Kpi, KpiType, KpiCategory, KpiCalculationType } from './entities/kpi.entity';
import { CreateKpiDto, UpdateKpiDto, KpiResponseDto, KpiFilterDto } from './dto/kpi.dto';
import { Machine } from '../machines/entities/machine.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Visit } from '../visits/entities/visit.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Sector } from '../sectors/entities/sector.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User, UserRole } from '../users/entities/user.entity';

interface KpiFilters {
  type?: string;
  category?: string;
  isGlobal?: boolean;
  sectorId?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class KpisService {
  constructor(
    @InjectRepository(Kpi)
    private readonly kpisRepo: Repository<Kpi>,
    @InjectRepository(Machine)
    private readonly machinesRepo: Repository<Machine>,
    @InjectRepository(Ticket)
    private readonly ticketsRepo: Repository<Ticket>,
    @InjectRepository(Visit)
    private readonly visitsRepo: Repository<Visit>,
    @InjectRepository(Sale)
    private readonly salesRepo: Repository<Sale>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Sector)
    private readonly sectorsRepo: Repository<Sector>,
    @InjectRepository(Tenant)
    private readonly tenantsRepo: Repository<Tenant>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // ============================================================================
  // CRUD BÁSICO DE KPIs
  // ============================================================================

  async create(
    tenantId: string,
    userId: string,
    createKpiDto: CreateKpiDto,
  ): Promise<KpiResponseDto> {
    const kpi = this.kpisRepo.create({
      ...createKpiDto,
      tenantId,
      userId,
      currentValue: createKpiDto.currentValue ?? 0,
      calculationType: createKpiDto.calculationType ?? KpiCalculationType.MANUAL,
    });

    const savedKpi = await this.kpisRepo.save(kpi);
    return this.mapToResponse(savedKpi);
  }

  async findAll(
    tenantId: string,
    filters: KpiFilters = {},
  ): Promise<{ kpis: KpiResponseDto[]; total: number }> {
    const where: FindOptionsWhere<Kpi> = { tenantId, deletedAt: IsNull() };

    if (filters.type) {
      where.type = filters.type as KpiType;
    }
    if (filters.category) {
      where.category = filters.category as KpiCategory;
    }
    if (filters.isGlobal !== undefined) {
      where.isGlobal = filters.isGlobal;
    }
    if (filters.sectorId) {
      where.sectorId = filters.sectorId;
    }

    const [kpis, total] = await this.kpisRepo.findAndCount({
      where,
      skip: filters.skip ?? 0,
      take: filters.take ?? 20,
      order: { createdAt: 'DESC' },
    });

    return {
      kpis: kpis.map(this.mapToResponse),
      total,
    };
  }

  async findOne(tenantId: string, id: string): Promise<KpiResponseDto> {
    const kpi = await this.kpisRepo.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!kpi) {
      throw new NotFoundException(`KPI with id ${id} not found`);
    }

    return this.mapToResponse(kpi);
  }

  async update(
    tenantId: string,
    id: string,
    updateKpiDto: UpdateKpiDto,
  ): Promise<KpiResponseDto> {
    const kpi = await this.findOne(tenantId, id);

    Object.assign(kpi, updateKpiDto);
    const updatedKpi = await this.kpisRepo.save(kpi);

    return this.mapToResponse(updatedKpi);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const kpi = await this.findOne(tenantId, id);
    await this.kpisRepo.softRemove(kpi);
  }

  // ============================================================================
  // KPIs DINÁMICOS - CÁLCULOS AUTOMÁTICOS DESDE LOS DATOS
  // ============================================================================

  /**
   * Obtiene el dashboard de KPIs para ADMIN
   * Incluye métricas de ventas, máquinas, tickets, visitas, inventario
   */
  async getDashboardKpis(tenantId: string): Promise<any> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    try {
      // Ejecutar todas las queries en paralelo
      const [
        salesData,
        machinesData,
        ticketsData,
        visitsData,
        inventoryData,
        sectorsData,
      ] = await Promise.all([
        this.getSalesKpis(tenantId, monthStart, now).catch(e => ({ error: 'sales', message: e.message })),
        this.getMachinesKpis(tenantId).catch(e => ({ error: 'machines', message: e.message })),
        this.getTicketsKpis(tenantId).catch(e => ({ error: 'tickets', message: e.message })),
        this.getVisitsKpis(tenantId, today, now).catch(e => ({ error: 'visits', message: e.message })),
        this.getInventoryKpis(tenantId).catch(e => ({ error: 'inventory', message: e.message })),
        this.getSectorsKpis(tenantId).catch(e => ({ error: 'sectors', message: e.message })),
      ]);

      return {
        sales: salesData,
        machines: machinesData,
        tickets: ticketsData,
        visits: visitsData,
        inventory: inventoryData,
        sectors: sectorsData,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error in getDashboardKpis:', error);
      throw error;
    }
  }

  /**
   * KPIs de Ventas
   */
  private async getSalesKpis(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // Ingresos del mes actual
    const currentMonthSales = await this.salesRepo
      .createQueryBuilder('sale')
      .select('SUM(sale.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(sale.amount)', 'average')
      .where('sale.tenantId = :tenantId', { tenantId })
      .andWhere('sale.saleDate >= :startDate', { startDate })
      .andWhere('sale.saleDate <= :endDate', { endDate })
      .andWhere('sale.deletedAt IS NULL')
      .getRawOne();

    // Ventas por sector (usando subquery)
    const salesBySector = await this.salesRepo
      .createQueryBuilder('sale')
      .select('sale.sectorId', 'sectorId')
      .addSelect('SUM(sale.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('sale.tenantId = :tenantId', { tenantId })
      .andWhere('sale.saleDate >= :startDate', { startDate })
      .andWhere('sale.deletedAt IS NULL')
      .andWhere('sale.sectorId IS NOT NULL')
      .groupBy('sale.sectorId')
      .orderBy('total', 'DESC')
      .limit(10)
      .getRawMany();

    // Productos más vendidos - simplificado sin join
    const topProducts = await this.salesRepo
      .createQueryBuilder('sale')
      .select('sale.id', 'saleId')
      .addSelect('COUNT(*)', 'itemCount')
      .addSelect('SUM(sale.amount)', 'total')
      .where('sale.tenantId = :tenantId', { tenantId })
      .andWhere('sale.saleDate >= :startDate', { startDate })
      .andWhere('sale.deletedAt IS NULL')
      .groupBy('sale.id')
      .orderBy('total', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      totalRevenue: parseFloat(currentMonthSales.total || 0),
      transactionCount: parseInt(currentMonthSales.count || 0, 10),
      averageTicket: parseFloat(currentMonthSales.average || 0),
      bySector: salesBySector,
      topProducts,
    };
  }

  /**
   * KPIs de Máquinas
   */
  private async getMachinesKpis(tenantId: string): Promise<any> {
    const statusCounts = await this.machinesRepo
      .createQueryBuilder('m')
      .select('m.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('m.tenantId = :tenantId', { tenantId })
      .andWhere('m.deletedAt IS NULL')
      .groupBy('m.status')
      .getRawMany();

    const countByStatus = statusCounts.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);

    let totalMachines = 0;
    for (const key of Object.keys(countByStatus)) {
      totalMachines += countByStatus[key];
    }
    const active = countByStatus['ACTIVE'] || 0;

    return {
      total: totalMachines,
      active,
      inactive: countByStatus['INACTIVE'] || 0,
      inMaintenance: countByStatus['MAINTENANCE'] || 0,
      inTransit: countByStatus['IN_TRANSIT'] || 0,
      decommissioned: countByStatus['DECOMMISSIONED'] || 0,
      availabilityRate: totalMachines > 0 ? Math.round((active / totalMachines) * 100) : 0,
    };
  }

  /**
   * KPIs de Tickets
   */
  private async getTicketsKpis(tenantId: string): Promise<any> {
    const statusCounts = await this.ticketsRepo
      .createQueryBuilder('t')
      .select('t.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.deletedAt IS NULL')
      .groupBy('t.status')
      .getRawMany();

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

    const countByStatus = statusCounts.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);

    const countByPriority = priorityCounts.reduce((acc, row) => {
      acc[row.priority] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);

    const openTickets =
      (countByStatus['OPEN'] || 0) +
      (countByStatus['ASSIGNED'] || 0) +
      (countByStatus['IN_PROGRESS'] || 0);

    const resolvedTickets = countByStatus['RESOLVED'] || 0;
    const closedTickets = countByStatus['CLOSED'] || 0;

    return {
      open: openTickets,
      assigned: countByStatus['ASSIGNED'] || 0,
      inProgress: countByStatus['IN_PROGRESS'] || 0,
      resolved: resolvedTickets,
      closed: closedTickets,
      critical: countByPriority['CRITICAL'] || 0,
      high: countByPriority['HIGH'] || 0,
      medium: countByPriority['MEDIUM'] || 0,
      low: countByPriority['LOW'] || 0,
      resolutionRate: openTickets > 0 
        ? Math.round(((resolvedTickets + closedTickets) / (openTickets + resolvedTickets + closedTickets)) * 100)
        : 100,
    };
  }

  /**
   * KPIs de Visitas
   */
  private async getVisitsKpis(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const todayCount = await this.visitsRepo
      .createQueryBuilder('v')
      .select('COUNT(*)', 'count')
      .where('v.tenantId = :tenantId', { tenantId })
      .andWhere('DATE(v.visitedAt) = DATE(:today)', { today: startDate })
      .andWhere('v.deletedAt IS NULL')
      .getRawOne();

    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() - 7);

    const weekCount = await this.visitsRepo
      .createQueryBuilder('v')
      .select('COUNT(*)', 'count')
      .where('v.tenantId = :tenantId', { tenantId })
      .andWhere('v.visitedAt >= :weekStart', { weekStart })
      .andWhere('v.deletedAt IS NULL')
      .getRawOne();

    // Temperaturas anómalas (mayor a 10 grados o menor a 0)
    const anomalousTemps = await this.visitsRepo
      .createQueryBuilder('v')
      .select('COUNT(*)', 'count')
      .where('v.tenantId = :tenantId', { tenantId })
      .andWhere('v.temperature > :maxTemp OR v.temperature < :minTemp', {
        maxTemp: 10,
        minTemp: 0,
      })
      .andWhere('v.deletedAt IS NULL')
      .getRawOne();

    // Visitas por técnico (sin join, usando subquery)
    const visitsByTechnician = await this.visitsRepo
      .createQueryBuilder('v')
      .select('v.technicianId', 'technicianId')
      .addSelect('COUNT(*)', 'count')
      .where('v.tenantId = :tenantId', { tenantId })
      .andWhere('v.visitedAt >= :weekStart', { weekStart })
      .andWhere('v.deletedAt IS NULL')
      .groupBy('v.technicianId')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      today: parseInt(todayCount.count || 0, 10),
      thisWeek: parseInt(weekCount.count || 0, 10),
      anomalousTemperatures: parseInt(anomalousTemps.count || 0, 10),
      byTechnician: visitsByTechnician,
    };
  }

  /**
   * KPIs de Inventario
   */
  private async getInventoryKpis(tenantId: string): Promise<any> {
    const statusCounts = await this.inventoryRepo
      .createQueryBuilder('i')
      .select('i.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('i.tenantId = :tenantId', { tenantId })
      .andWhere('i.deletedAt IS NULL')
      .groupBy('i.status')
      .getRawMany();

    const countByStatus = statusCounts.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);

    // Valor total del inventario
    const totalValue = await this.inventoryRepo
      .createQueryBuilder('i')
      .select('SUM(i.quantity * i.unitCost)', 'total')
      .where('i.tenantId = :tenantId', { tenantId })
      .andWhere('i.deletedAt IS NULL')
      .getRawOne();

    // Productos bajo stock (quantity <= minQuantity)
    const lowStock = await this.inventoryRepo
      .createQueryBuilder('i')
      .select('COUNT(*)', 'count')
      .where('i.tenantId = :tenantId', { tenantId })
      .andWhere('i.quantity <= i.minQuantity')
      .andWhere('i.deletedAt IS NULL')
      .getRawOne();

    return {
      total: Object.values(countByStatus).reduce((a: number, b: number) => a + b, 0),
      available: countByStatus['DISPONIBLE'] || 0,
      inUse: countByStatus['EN_USO'] || 0,
      outOfStock: countByStatus['AGOTADO'] || 0,
      onOrder: countByStatus['EN_PEDIDO'] || 0,
      totalValue: parseFloat(totalValue.total || 0),
      lowStock: parseInt(lowStock.count || 0, 10),
    };
  }

  /**
   * KPIs de Sectores
   */
  private async getSectorsKpis(tenantId: string): Promise<any> {
    const sectors = await this.sectorsRepo
      .createQueryBuilder('s')
      .select('s.id', 'id')
      .addSelect('s.comuna', 'comuna')
      .addSelect('s.city', 'city')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.deletedAt IS NULL')
      .getRawMany();

    // Máquinas por sector (sin join)
    const machinesBySector = await this.machinesRepo
      .createQueryBuilder('m')
      .select('m.sectorId', 'sectorId')
      .addSelect('COUNT(*)', 'count')
      .where('m.tenantId = :tenantId', { tenantId })
      .andWhere('m.deletedAt IS NULL')
      .andWhere('m.sectorId IS NOT NULL')
      .groupBy('m.sectorId')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      total: sectors.length,
      list: sectors,
      machinesBySector,
    };
  }

  // ============================================================================
  // KPIs PARA SUPER_ADMIN (GLOBAL - TODOS LOS TENANTS)
  // ============================================================================

  async getGlobalKpis(): Promise<any> {
    // Obtener todos los tenants
    const tenants = await this.tenantsRepo
      .createQueryBuilder('t')
      .select('t.id', 'id')
      .addSelect('t.name', 'name')
      .where('t.deletedAt IS NULL')
      .getRawMany();

    // Stats globales
    const [totalTenants, totalMachines, totalUsers, totalTickets] = await Promise.all([
      this.tenantsRepo.count({ where: { deletedAt: IsNull() } }),
      this.machinesRepo.count({ where: { deletedAt: IsNull() } }),
      this.usersRepo.count({ where: { deletedAt: IsNull() } }),
      this.ticketsRepo.count({ 
        where: { 
          deletedAt: IsNull(),
          status: 'OPEN' as any,
        } 
      }),
    ]);

    // Distribución de usuarios por rol
    const usersByRole = await this.usersRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .where('u.deletedAt IS NULL')
      .groupBy('u.role')
      .getRawMany();

    return {
      totalTenants,
      totalMachines,
      totalUsers,
      totalTickets,
      tenants: tenants.map(t => t.name),
      usersByRole,
      lastUpdated: new Date(),
    };
  }

  // ============================================================================
  // KPIs PARA SUPPORT (MÉTRICAS PERSONALES)
  // ============================================================================

  async getSupportKpis(tenantId: string, userId: string): Promise<any> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Mis tickets asignados
    const myTickets = await this.ticketsRepo
      .createQueryBuilder('t')
      .select('t.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.assignedToId = :userId', { userId })
      .andWhere('t.deletedAt IS NULL')
      .groupBy('t.status')
      .getRawMany();

    // Mis máquinas asignadas
    const myMachines = await this.machinesRepo
      .createQueryBuilder('m')
      .select('m.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('m.tenantId = :tenantId', { tenantId })
      .andWhere('m.assignedUserId = :userId', { userId })
      .andWhere('m.deletedAt IS NULL')
      .groupBy('m.status')
      .getRawMany();

    // Mis visitas de hoy
    const myVisitsToday = await this.visitsRepo
      .createQueryBuilder('v')
      .select('COUNT(*)', 'count')
      .where('v.tenantId = :tenantId', { tenantId })
      .andWhere('v.technicianId = :userId', { userId })
      .andWhere('DATE(v.visitedAt) = DATE(:today)', { today })
      .andWhere('v.deletedAt IS NULL')
      .getRawOne();

    const countByTicketStatus = myTickets.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);

    const countByMachineStatus = myMachines.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);

    return {
      tickets: {
        open: (countByTicketStatus['OPEN'] || 0) + (countByTicketStatus['ASSIGNED'] || 0),
        inProgress: countByTicketStatus['IN_PROGRESS'] || 0,
        resolved: countByTicketStatus['RESOLVED'] || 0,
        closed: countByTicketStatus['CLOSED'] || 0,
      },
      machines: {
        total: Object.values(countByMachineStatus).reduce((a: number, b: number) => a + b, 0),
        active: countByMachineStatus['ACTIVE'] || 0,
        maintenance: countByMachineStatus['MAINTENANCE'] || 0,
        inactive: countByMachineStatus['INACTIVE'] || 0,
      },
      visitsToday: parseInt(myVisitsToday.count || 0, 10),
      lastUpdated: new Date(),
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private mapToResponse(kpi: Kpi): KpiResponseDto {
    return {
      id: kpi.id,
      tenantId: kpi.tenantId,
      userId: kpi.userId,
      sectorId: kpi.sectorId,
      type: kpi.type,
      name: kpi.name,
      description: kpi.description,
      category: kpi.category,
      targetValue: kpi.targetValue,
      currentValue: kpi.currentValue,
      startDate: kpi.startDate,
      endDate: kpi.endDate,
      calculationType: kpi.calculationType,
      formula: kpi.formula,
      frequency: kpi.frequency,
      isGlobal: kpi.isGlobal,
      dataConfig: kpi.dataConfig,
      createdAt: kpi.createdAt,
      updatedAt: kpi.updatedAt,
    };
  }
}