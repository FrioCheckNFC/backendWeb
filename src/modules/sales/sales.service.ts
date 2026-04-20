import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateSaleDto, UpdateSaleDto, SaleResponseDto } from './dto';

interface SaleFilters {
  startDate?: Date;
  endDate?: Date;
  sectorId?: string;
  vendorId?: string;
  machineId?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepo: Repository<Sale>,
    @InjectRepository(Tenant)
    private readonly tenantsRepo: Repository<Tenant>,
  ) {}

  /**
   * Crear una nueva venta
   */
  async create(
    tenantId: string,
    currentUserId: string,
    createSaleDto: CreateSaleDto,
  ): Promise<SaleResponseDto> {
    if (!tenantId) {
      throw new BadRequestException('El tenantId es requerido');
    }

    const saleDate = new Date(createSaleDto.saleDate);
    if (isNaN(saleDate.getTime())) {
      throw new BadRequestException('Formato de fecha de venta inválido');
    }

    if (createSaleDto.amount <= 0) {
      throw new BadRequestException('El monto total debe ser mayor a 0');
    }

    const tenant = await this.tenantsRepo.findOne({
      where: { id: tenantId, deletedAt: IsNull() },
    });

    const sale = this.salesRepo.create({
      tenantId,
      vendorId: createSaleDto.vendorId ?? currentUserId,
      sectorId: createSaleDto.sectorId ?? null,
      machineId: createSaleDto.machineId ?? null,
      amount: createSaleDto.amount,
      description: createSaleDto.description ?? null,
      saleDate,
      tenantName: tenant?.name ?? null,
    });

    const savedSale = await this.salesRepo.save(sale);
    return this.mapToResponse(savedSale);
  }

  /**
   * Obtener todas las ventas del tenant
   */
  async findAll(
    tenantId: string,
    filters: SaleFilters = {},
  ): Promise<{ sales: SaleResponseDto[]; total: number }> {
    const where: FindOptionsWhere<Sale> = { tenantId, deletedAt: IsNull() };

    if (filters.sectorId) {
      where.sectorId = filters.sectorId;
    }
    if (filters.vendorId) {
      where.vendorId = filters.vendorId;
    }
    if (filters.machineId) {
      where.machineId = filters.machineId;
    }

    const query = this.salesRepo.createQueryBuilder('sale').where(where);

    if (filters.startDate) {
      query.andWhere('sale.sale_date >= :startDate', {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      query.andWhere('sale.sale_date <= :endDate', { endDate: filters.endDate });
    }

    query
      .orderBy('sale.sale_date', 'DESC')
      .addOrderBy('sale.created_at', 'DESC')
      .skip(filters.skip ?? 0)
      .take(filters.take ?? 20);

    const [sales, total] = await query.getManyAndCount();

    return {
      sales: sales.map((s) => this.mapToResponse(s)),
      total,
    };
  }

  /**
   * Obtener una venta específica
   */
  async findOne(id: string, tenantId: string): Promise<SaleResponseDto> {
    const sale = await this.salesRepo.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return this.mapToResponse(sale);
  }

  /**
   * Actualizar una venta
   */
  async update(
    id: string,
    tenantId: string | undefined,
    updateSaleDto: UpdateSaleDto,
  ): Promise<SaleResponseDto> {
    if (!tenantId) {
      throw new BadRequestException('El tenantId es requerido');
    }

    const sale = await this.salesRepo.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    if (updateSaleDto.vendorId !== undefined) {
      sale.vendorId = updateSaleDto.vendorId;
    }
    if (updateSaleDto.sectorId !== undefined) {
      sale.sectorId = updateSaleDto.sectorId;
    }
    if (updateSaleDto.machineId !== undefined) {
      sale.machineId = updateSaleDto.machineId;
    }
    if (updateSaleDto.amount !== undefined) {
      if (updateSaleDto.amount <= 0) {
        throw new BadRequestException('El monto total debe ser mayor a 0');
      }
      sale.amount = updateSaleDto.amount;
    }
    if (updateSaleDto.description !== undefined) {
      sale.description = updateSaleDto.description;
    }

    if (updateSaleDto.saleDate) {
      const newSaleDate = new Date(updateSaleDto.saleDate);
      if (isNaN(newSaleDate.getTime())) {
        throw new BadRequestException('Formato de fecha de venta inválido');
      }
      sale.saleDate = newSaleDate;
    }

    const updatedSale = await this.salesRepo.save(sale);
    return this.mapToResponse(updatedSale);
  }

  /**
   * Eliminar una venta (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<{ message: string }> {
    const sale = await this.salesRepo.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    await this.salesRepo.softDelete(id);

    return { message: 'Venta eliminada correctamente' };
  }

  /**
   * Obtener estadísticas de ventas
   */
  async getStatistics(
    tenantId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      sectorId?: string;
      vendorId?: string;
      machineId?: string;
    } = {},
  ): Promise<{
    totalSales: number;
    totalAmount: number;
    averageAmount: number;
  }> {
    const query = this.salesRepo.createQueryBuilder('sale');

    query.where('sale.tenant_id = :tenantId AND sale.deleted_at IS NULL', {
      tenantId,
    });

    if (filters.startDate) {
      query.andWhere('sale.sale_date >= :startDate', {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      query.andWhere('sale.sale_date <= :endDate', { endDate: filters.endDate });
    }
    if (filters.sectorId) {
      query.andWhere('sale.sector_id = :sectorId', { sectorId: filters.sectorId });
    }
    if (filters.vendorId) {
      query.andWhere('sale.vendor_id = :vendorId', { vendorId: filters.vendorId });
    }
    if (filters.machineId) {
      query.andWhere('sale.machine_id = :machineId', { machineId: filters.machineId });
    }

    const sales = await query.getMany();

    const totalSales = sales.length;
    const totalAmount = sales.reduce(
      (sum, s) => sum + Number(s.amount),
      0,
    );
    const averageAmount = totalSales > 0 ? totalAmount / totalSales : 0;

    return {
      totalSales,
      totalAmount: Math.round(totalAmount * 100) / 100,
      averageAmount: Math.round(averageAmount * 100) / 100,
    };
  }

  /**
   * Mapear entidad Sale a DTO response
   */
  private mapToResponse(sale: Sale): SaleResponseDto {
    const response = new SaleResponseDto();
    response.id = sale.id;
    response.tenantId = sale.tenantId;
    response.vendorId = sale.vendorId;
    response.sectorId = sale.sectorId;
    response.machineId = sale.machineId;
    response.amount = Number(sale.amount);
    response.description = sale.description;
    response.saleDate = sale.saleDate;
    response.tenantName = sale.tenantName;

    response.createdAt = sale.createdAt;
    response.updatedAt = sale.updatedAt;
    response.deletedAt = sale.deletedAt;

    return response;
  }
}
