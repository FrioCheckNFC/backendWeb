import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  InventoryResponseDto,
} from './dto';
import { User } from '../users/entities/user.entity';
import { InventoryStatus } from './entities/inventory.entity';

@ApiTags('Inventory (Catálogo de Productos)')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  /**
   * POST /inventory
   * Crear un nuevo producto en el inventario
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo producto en inventario' })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
    type: InventoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o código duplicado',
  })
  async create(
    @Body() createInventoryDto: CreateInventoryDto,
    @GetUser() user: User,
  ) {
    return this.inventoryService.create(user.tenantId, createInventoryDto);
  }

  /**
   * GET /inventory
   * Listar todos los productos del inventario del tenant
   */
  @Get()
  @ApiOperation({ summary: 'Listar todos los productos en inventario' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: InventoryStatus,
    description: 'Filtrar por estado de stock',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Buscar por nombre o código del producto',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos',
    schema: {
      properties: {
        inventory: {
          type: 'array',
          items: { $ref: '#/components/schemas/InventoryResponseDto' },
        },
        total: { type: 'number' },
      },
    },
  })
  async findAll(
    @GetUser() user: User,
    @Query('status') status?: InventoryStatus,
    @Query('search') search?: string,
  ) {
    return this.inventoryService.findAll(user.tenantId, {
      status,
      search,
    });
  }

  /**
   * GET /inventory/:id
   * Obtener detalles de un producto específico
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de un producto' })
  @ApiResponse({
    status: 200,
    description: 'Detalles del producto',
    type: InventoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.inventoryService.findOne(id, user.tenantId);
  }

  /**
   * PATCH /inventory/:id
   * Actualizar un producto del inventario
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto en inventario' })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado',
    type: InventoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @GetUser() user: User,
  ) {
    return this.inventoryService.update(id, user.tenantId, updateInventoryDto);
  }

  /**
   * DELETE /inventory/:id
   * Eliminar un producto del inventario
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar producto del inventario' })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async delete(@Param('id') id: string, @GetUser() user: User) {
    return this.inventoryService.delete(id, user.tenantId);
  }
}
