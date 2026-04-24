import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Inventory, InventoryStatus } from './entities/inventory.entity';
import { CreateInventoryDto, UpdateInventoryDto, InventoryResponseDto } from './dto';
import { Tenant } from '../tenants/entities/tenant.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Tenant)
    private readonly tenantsRepo: Repository<Tenant>,
  ) {}

  /**
   * Crear un nuevo item de inventario
   */
  async create(
    tenantId: string,
    createInventoryDto: CreateInventoryDto,
  ): Promise<InventoryResponseDto> {
    // Validar que no exista con el mismo part_number
    const existing = await this.inventoryRepo.findOne({
      where: {
        tenantId,
        partNumber: createInventoryDto.partNumber,
        deletedAt: IsNull(),
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Ya existe un producto con el código ${createInventoryDto.partNumber}`,
      );
    }

    const tenant = await this.tenantsRepo.findOne({
      where: { id: tenantId, deletedAt: IsNull() },
    });

    const inventory = this.inventoryRepo.create();
    inventory.tenantId = tenantId;
    inventory.partName = createInventoryDto.partName;
    inventory.partNumber = createInventoryDto.partNumber;
    inventory.description = createInventoryDto.description ?? null;
    inventory.quantity = createInventoryDto.quantity ?? 0;
    inventory.minQuantity = createInventoryDto.minQuantity ?? 5;
    inventory.unitCost = createInventoryDto.unitCost;
    inventory.location = createInventoryDto.location ?? null;
    inventory.tenantName = tenant?.name ?? null;

    if (createInventoryDto.status) {
      inventory.status = createInventoryDto.status;
    } else {
      // Determinar status basado en cantidad
      if (inventory.quantity === 0) {
        inventory.status = InventoryStatus.AGOTADO;
      } else if (inventory.quantity <= inventory.minQuantity) {
        inventory.status = InventoryStatus.EN_USO;
      } else {
        inventory.status = InventoryStatus.DISPONIBLE;
      }
    }

    const saved = await this.inventoryRepo.save(inventory);
    return this.mapToResponse(saved);
  }

  /**
   * Obtener todos los items de inventario del tenant
   */
  async findAll(
    tenantId: string,
    filters?: { status?: InventoryStatus; search?: string },
  ): Promise<{ inventory: InventoryResponseDto[]; total: number }> {
    const query = this.inventoryRepo.createQueryBuilder('inv');

    query.where('inv.tenant_id = :tenantId AND inv.deleted_at IS NULL', {
      tenantId,
    });

    if (filters?.status) {
      query.andWhere('inv.status = :status', { status: filters.status });
    }

    if (filters?.search) {
      query.andWhere(
        '(inv.part_name ILIKE :search OR inv.part_number ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    query.orderBy('inv.part_name', 'ASC');

    const [inventory, total] = await query.getManyAndCount();

    return {
      inventory: inventory.map((inv) => this.mapToResponse(inv)),
      total,
    };
  }

  /**
   * Obtener un item específico
   */
  async findOne(id: string, tenantId: string): Promise<InventoryResponseDto> {
    const inventory = await this.inventoryRepo.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!inventory) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return this.mapToResponse(inventory);
  }

  /**
   * Actualizar un item de inventario
   */
  async update(
    id: string,
    tenantId: string,
    updateInventoryDto: UpdateInventoryDto,
  ): Promise<InventoryResponseDto> {
    const inventory = await this.inventoryRepo.findOne({
      where: { id, tenantId },
    });

    if (!inventory) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    // Validar unicidad de part_number si se actualiza
    if (
      updateInventoryDto.partNumber &&
      updateInventoryDto.partNumber !== inventory.partNumber
    ) {
      const existing = await this.inventoryRepo.findOne({
        where: {
          tenantId,
          partNumber: updateInventoryDto.partNumber,
          deletedAt: IsNull(),
        },
      });
      if (existing) {
        throw new BadRequestException(
          `Ya existe un producto con el código ${updateInventoryDto.partNumber}`,
        );
      }
    }

    if (updateInventoryDto.partName !== undefined)
      inventory.partName = updateInventoryDto.partName;
    if (updateInventoryDto.partNumber !== undefined)
      inventory.partNumber = updateInventoryDto.partNumber;
    if (updateInventoryDto.description !== undefined)
      inventory.description = updateInventoryDto.description;
    if (updateInventoryDto.quantity !== undefined)
      inventory.quantity = updateInventoryDto.quantity;
    if (updateInventoryDto.minQuantity !== undefined)
      inventory.minQuantity = updateInventoryDto.minQuantity;
    if (updateInventoryDto.unitCost !== undefined)
      inventory.unitCost = updateInventoryDto.unitCost;
    if (updateInventoryDto.location !== undefined)
      inventory.location = updateInventoryDto.location;
    if (updateInventoryDto.status !== undefined)
      inventory.status = updateInventoryDto.status;

    // Actualizar status basado en cantidad
    if (
      updateInventoryDto.status === undefined &&
      (
        updateInventoryDto.quantity !== undefined ||
        updateInventoryDto.minQuantity !== undefined
      )
    ) {
      if (inventory.quantity === 0) {
        inventory.status = InventoryStatus.AGOTADO;
      } else if (inventory.quantity <= inventory.minQuantity) {
        inventory.status = InventoryStatus.EN_USO;
      } else {
        inventory.status = InventoryStatus.DISPONIBLE;
      }
    }

    const updated = await this.inventoryRepo.save(inventory);
    return this.mapToResponse(updated);
  }

  /**
   * Eliminar un item (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<{ message: string }> {
    const inventory = await this.inventoryRepo.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!inventory) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    await this.inventoryRepo.softDelete(id);
    return { message: 'Producto eliminado correctamente' };
  }

  /**
   * Mapear entidad a DTO
   */
  private mapToResponse(inventory: Inventory): InventoryResponseDto {
    const response = new InventoryResponseDto();
    response.id = inventory.id;
    response.tenantId = inventory.tenantId;
    response.partName = inventory.partName;
    response.partNumber = inventory.partNumber;
    response.description = inventory.description;
    response.quantity = inventory.quantity;
    response.minQuantity = inventory.minQuantity;
    response.unitCost = Number(inventory.unitCost);
    response.status = inventory.status;
    response.location = inventory.location;
    response.tenantName = inventory.tenantName;
    response.createdAt = inventory.createdAt;
    response.updatedAt = inventory.updatedAt;
    response.deletedAt = inventory.deletedAt;
    return response;
  }
}
