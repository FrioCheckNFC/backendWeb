import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale, DeliveryStatus } from './entities/sale.entity';
import { SaleInventoryItem } from './entities/sale-inventory-item.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import {
  CreateSaleDto,
  CreateSaleInventoryItemDto,
  UpdateSaleDto,
  SaleResponseDto,
  SaleInventoryItemResponseDto,
} from './dto';

interface SaleFilters {
  startDate?: Date;
  endDate?: Date;
  sectorId?: string;
  vendorId?: string;
  retailerId?: string;
  deliveryStatus?: DeliveryStatus;
}

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepo: Repository<Sale>,
    @InjectRepository(SaleInventoryItem)
    private readonly saleInventoryItemsRepo: Repository<SaleInventoryItem>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  /**
   * Crear una nueva venta y sus items de inventario
   */
  async create(createSaleDto: CreateSaleDto): Promise<SaleResponseDto> {
    // Validar que haya items
    if (!createSaleDto.inventoryItems || createSaleDto.inventoryItems.length === 0) {
      throw new BadRequestException('Debe incluir al menos un item de inventario');
    }

    // El tenantId debe venir asignado desde el controlador
    if (!createSaleDto.tenantId) {
      throw new BadRequestException('El tenantId es requerido');
    }

    // Convertir fechas
    const saleDate = new Date(createSaleDto.saleDate);
    if (isNaN(saleDate.getTime())) {
      throw new BadRequestException('Formato de fecha de venta inválido');
    }

    let deliveryDate: Date | null = null;
    if (createSaleDto.deliveryDate) {
      deliveryDate = new Date(createSaleDto.deliveryDate);
      if (isNaN(deliveryDate.getTime())) {
        throw new BadRequestException('Formato de fecha de entrega inválido');
      }
    }

    // Calcular monto total y validar items de inventario
    let totalAmount = 0;
    const itemsData: SaleInventoryItem[] = [];

    for (const itemDto of createSaleDto.inventoryItems) {
      // Validar que el inventario existe
      const inventory = await this.inventoryRepo.findOne({
        where: { id: itemDto.inventoryId, tenantId: createSaleDto.tenantId },
      });

      if (!inventory) {
        throw new BadRequestException(
          `Producto de inventario con ID ${itemDto.inventoryId} no encontrado en este tenant`,
        );
      }

      // Validar cantidad disponible
      if (itemDto.quantity > inventory.quantity) {
        throw new BadRequestException(
          `Cantidad insuficiente del producto ${inventory.partName}. Disponible: ${inventory.quantity}, Solicitado: ${itemDto.quantity}`,
        );
      }

      // Calcular precio unitario (usar override o costo de inventario)
      const unitPrice = itemDto.unitPriceOverride ?? inventory.unitCost;
      const subtotal = itemDto.quantity * Number(unitPrice);

      if (subtotal <= 0) {
        throw new BadRequestException('El subtotal de cada item debe ser mayor a 0');
      }

      const discount = itemDto.discount || 0;
      const finalItemTotal = subtotal - discount;
      totalAmount += finalItemTotal;

      // Crear item de venta vinculado a inventario
      const item = this.saleInventoryItemsRepo.create();
      item.tenantId = createSaleDto.tenantId;
      item.inventoryId = itemDto.inventoryId;
      item.quantity = itemDto.quantity;
      item.unitPriceOverride =
        itemDto.unitPriceOverride !== undefined
          ? itemDto.unitPriceOverride
          : null;
      item.discount = discount > 0 ? discount : null;
      item.notes = itemDto.notes || null;

      itemsData.push(item);
    }

    if (totalAmount <= 0) {
      throw new BadRequestException('El monto total debe ser mayor a 0');
    }

    // Crear venta
    const sale = this.salesRepo.create();
    sale.tenantId = createSaleDto.tenantId;
    sale.vendorId = createSaleDto.vendorId || null;
    sale.sectorId = createSaleDto.sectorId || null;
    sale.retailerId = createSaleDto.retailerId;
    sale.amount = totalAmount;
    sale.description = createSaleDto.description || null;
    sale.deliveryStatus = createSaleDto.deliveryStatus || DeliveryStatus.PENDING;
    sale.saleDate = saleDate;
    sale.deliveryDate = deliveryDate;

    const savedSale = await this.salesRepo.save(sale);

    // Guardar items asociados a la venta
    for (const item of itemsData) {
      item.saleId = savedSale.id;
    }
    await this.saleInventoryItemsRepo.save(itemsData);

    // Cargar y mapear respuesta
    const saleWithItems = await this.salesRepo.findOne({
      where: { id: savedSale.id },
      relations: ['inventoryItems'],
    });

    if (!saleWithItems) {
      throw new Error('Error al recuperar la venta creada');
    }

    return this.mapToResponse(saleWithItems);
  }

  /**
   * Obtener todas las ventas del tenant
   */
  async findAll(
    tenantId: string,
    filters: SaleFilters = {},
  ): Promise<{ sales: SaleResponseDto[]; total: number }> {
    const query = this.salesRepo.createQueryBuilder('sale');

    query
      .where('sale.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('sale.inventoryItems', 'items')
      .leftJoinAndSelect('items.inventory', 'inventory');

    // Filtros
    if (filters.startDate) {
      query.andWhere('sale.saleDate >= :startDate', {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      query.andWhere('sale.saleDate <= :endDate', { endDate: filters.endDate });
    }
    if (filters.sectorId) {
      query.andWhere('sale.sectorId = :sectorId', { sectorId: filters.sectorId });
    }
    if (filters.vendorId) {
      query.andWhere('sale.vendorId = :vendorId', { vendorId: filters.vendorId });
    }
    if (filters.retailerId) {
      query.andWhere('sale.retailerId = :retailerId', {
        retailerId: filters.retailerId,
      });
    }
    if (filters.deliveryStatus) {
      query.andWhere('sale.deliveryStatus = :deliveryStatus', {
        deliveryStatus: filters.deliveryStatus,
      });
    }

    query.orderBy('sale.saleDate', 'DESC').addOrderBy('sale.createdAt', 'DESC');

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
      where: { id, tenantId },
      relations: ['inventoryItems', 'inventoryItems.inventory'],
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
      where: { id, tenantId },
      relations: ['inventoryItems'],
    });

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    // Actualizar campos básicos
    if (updateSaleDto.vendorId !== undefined)
      sale.vendorId = updateSaleDto.vendorId;
    if (updateSaleDto.sectorId !== undefined)
      sale.sectorId = updateSaleDto.sectorId;
    if (updateSaleDto.retailerId !== undefined)
      sale.retailerId = updateSaleDto.retailerId;
    if (updateSaleDto.description !== undefined)
      sale.description = updateSaleDto.description;
    if (updateSaleDto.deliveryStatus !== undefined)
      sale.deliveryStatus = updateSaleDto.deliveryStatus;

    if (updateSaleDto.saleDate) {
      const newSaleDate = new Date(updateSaleDto.saleDate);
      if (!isNaN(newSaleDate.getTime())) {
        sale.saleDate = newSaleDate;
      }
    }

    if (updateSaleDto.deliveryDate) {
      const newDeliveryDate = new Date(updateSaleDto.deliveryDate);
      if (!isNaN(newDeliveryDate.getTime())) {
        sale.deliveryDate = newDeliveryDate;
      }
    }

    // Si hay nuevos items, reemplazar todos
    if (updateSaleDto.inventoryItems && updateSaleDto.inventoryItems.length > 0) {
      // Eliminar items anteriores
      if (sale.inventoryItems && sale.inventoryItems.length > 0) {
        await this.saleInventoryItemsRepo.remove(sale.inventoryItems);
      }

      // Calcular nuevos items y monto
      let totalAmount = 0;
      const newItems: SaleInventoryItem[] = [];

      for (const itemDto of updateSaleDto.inventoryItems) {
        // Validar que el inventario existe
        const inventory = await this.inventoryRepo.findOne({
          where: { id: itemDto.inventoryId, tenantId },
        });

        if (!inventory) {
          throw new BadRequestException(
            `Producto de inventario con ID ${itemDto.inventoryId} no encontrado`,
          );
        }

        const unitPrice = itemDto.unitPriceOverride ?? inventory.unitCost;
        const subtotal = itemDto.quantity * Number(unitPrice);
        const discount = itemDto.discount || 0;
        const finalItemTotal = subtotal - discount;

        totalAmount += finalItemTotal;

        const item = this.saleInventoryItemsRepo.create();
        item.tenantId = tenantId;
        item.saleId = sale.id;
        item.inventoryId = itemDto.inventoryId;
        item.quantity = itemDto.quantity;
        item.unitPriceOverride =
          itemDto.unitPriceOverride !== undefined
            ? itemDto.unitPriceOverride
            : null;
        item.discount = discount > 0 ? discount : null;
        item.notes = itemDto.notes || null;

        newItems.push(item);
      }

      if (totalAmount > 0) {
        sale.amount = totalAmount;
      }

      await this.saleInventoryItemsRepo.save(newItems);
    }

    const updatedSale = await this.salesRepo.save(sale);

    // Recargar con items
    const saleWithItems = await this.salesRepo.findOne({
      where: { id: updatedSale.id },
      relations: ['inventoryItems', 'inventoryItems.inventory'],
    });

    if (!saleWithItems) {
      throw new Error('Error al recuperar la venta actualizada');
    }

    return this.mapToResponse(saleWithItems);
  }

  /**
   * Eliminar una venta (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<{ message: string }> {
    const sale = await this.salesRepo.findOne({
      where: { id, tenantId },
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
      retailerId?: string;
    } = {},
  ): Promise<{
    totalSales: number;
    totalAmount: number;
    averageAmount: number;
    pendingDeliveries: number;
    deliveredCount: number;
  }> {
    const query = this.salesRepo.createQueryBuilder('sale');

    query.where('sale.tenantId = :tenantId AND sale.deletedAt IS NULL', {
      tenantId,
    });

    if (filters.startDate) {
      query.andWhere('sale.saleDate >= :startDate', {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      query.andWhere('sale.saleDate <= :endDate', { endDate: filters.endDate });
    }
    if (filters.sectorId) {
      query.andWhere('sale.sectorId = :sectorId', { sectorId: filters.sectorId });
    }
    if (filters.retailerId) {
      query.andWhere('sale.retailerId = :retailerId', {
        retailerId: filters.retailerId,
      });
    }

    const sales = await query.getMany();

    const totalSales = sales.length;
    const totalAmount = sales.reduce(
      (sum, s) => sum + Number(s.amount),
      0,
    );
    const averageAmount = totalSales > 0 ? totalAmount / totalSales : 0;
    const pendingDeliveries = sales.filter(
      (s) => s.deliveryStatus === DeliveryStatus.PENDING,
    ).length;
    const deliveredCount = sales.filter(
      (s) => s.deliveryStatus === DeliveryStatus.DELIVERED,
    ).length;

    return {
      totalSales,
      totalAmount: Math.round(totalAmount * 100) / 100,
      averageAmount: Math.round(averageAmount * 100) / 100,
      pendingDeliveries,
      deliveredCount,
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
    response.retailerId = sale.retailerId;
    response.amount = Number(sale.amount);
    response.description = sale.description;
    response.deliveryStatus = sale.deliveryStatus;
    response.saleDate = sale.saleDate;
    response.deliveryDate = sale.deliveryDate;

    // Mapear items de inventario
    response.inventoryItems = (sale.inventoryItems || []).map((item) =>
      this.mapInventoryItemToResponse(item),
    );

    response.createdAt = sale.createdAt;
    response.updatedAt = sale.updatedAt;

    return response;
  }

  /**
   * Mapear item de venta a DTO response
   */
  private mapInventoryItemToResponse(
    item: SaleInventoryItem,
  ): SaleInventoryItemResponseDto {
    const response = new SaleInventoryItemResponseDto();
    response.id = item.id;
    response.inventoryId = item.inventoryId;

    // Datos del inventario si están cargados
    if (item.inventory) {
      response.inventoryPartName = item.inventory.partName;
      response.inventoryPartNumber = item.inventory.partNumber;
    }

    response.quantity = item.quantity;
    response.unitPriceOverride = item.unitPriceOverride
      ? Number(item.unitPriceOverride)
      : null;

    // Calcular subtotal usando el precio override o el costo del inventario
    const unitPrice = item.unitPriceOverride
      ? Number(item.unitPriceOverride)
      : item.inventory
        ? Number(item.inventory.unitCost)
        : 0;
    response.subtotal = item.quantity * unitPrice;

    response.discount = item.discount ? Number(item.discount) : null;
    response.notes = item.notes;
    response.createdAt = item.createdAt;
    response.updatedAt = item.updatedAt;

    return response;
  }
}
