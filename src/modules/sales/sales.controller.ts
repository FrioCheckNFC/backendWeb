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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateSaleDto, UpdateSaleDto, SaleResponseDto } from './dto';
import { User } from '../users/entities/user.entity';
import { DeliveryStatus } from './entities/sale.entity';

@ApiTags('Sales (Pedidos/Ventas)')
@ApiBearerAuth()
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private salesService: SalesService) {}

  /**
   * POST /sales
   * Crear una nueva venta/pedido con productos
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo pedido/venta con detalles de productos' })
  @ApiResponse({
    status: 201,
    description: 'Venta creada exitosamente',
    type: SaleResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async create(
    @Body() createSaleDto: CreateSaleDto,
    @GetUser() user: User,
  ): Promise<SaleResponseDto> {
    // Asignar automáticamente el tenantId del usuario autenticado
    createSaleDto.tenantId = user.tenantId;
    return this.salesService.create(createSaleDto);
  }

  /**
   * GET /sales
   * Obtener todas las ventas del tenant del usuario
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las ventas con filtros' })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Registros a saltar (paginación)',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Cantidad de registros a traer',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha de inicio (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha de fin (ISO 8601)',
  })
  @ApiQuery({
    name: 'sectorId',
    required: false,
    type: String,
    description: 'Filtrar por sector/local',
  })
  @ApiQuery({
    name: 'vendorId',
    required: false,
    type: String,
    description: 'Filtrar por vendedor/usuario',
  })
  @ApiQuery({
    name: 'retailerId',
    required: false,
    type: String,
    description: 'Filtrar por minorista/cliente (user con role RETAILER)',
  })
  @ApiQuery({
    name: 'deliveryStatus',
    required: false,
    enum: ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'RETURNED'],
    description: 'Filtrar por estado de entrega',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ventas',
    schema: {
      properties: {
        sales: {
          type: 'array',
          items: { $ref: '#/components/schemas/SaleResponseDto' },
        },
        total: { type: 'number' },
      },
    },
  })
  async findAll(
    @GetUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sectorId') sectorId?: string,
    @Query('vendorId') vendorId?: string,
    @Query('retailerId') retailerId?: string,
    @Query('deliveryStatus') deliveryStatus?: DeliveryStatus,
  ) {
    return this.salesService.findAll(user.tenantId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      sectorId,
      vendorId,
      retailerId,
      deliveryStatus,
    });
  }

  /**
   * GET /sales/:id
   * Obtener una venta específica con sus productos
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una venta con sus productos' })
  @ApiResponse({
    status: 200,
    description: 'Venta encontrada',
    type: SaleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Venta no encontrada',
  })
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<SaleResponseDto> {
    return this.salesService.findOne(id, user.tenantId);
  }

  /**
   * PATCH /sales/:id
   * Actualizar una venta y sus productos
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar venta y sus productos' })
  @ApiResponse({
    status: 200,
    description: 'Venta actualizada exitosamente',
    type: SaleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Venta no encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
    @GetUser() user: User,
  ): Promise<SaleResponseDto> {
    return this.salesService.update(id, user.tenantId, updateSaleDto);
  }

  /**
   * DELETE /sales/:id
   * Eliminar una venta (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una venta y sus productos' })
  @ApiResponse({
    status: 200,
    description: 'Venta eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Venta no encontrada',
  })
  async delete(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.salesService.delete(id, user.tenantId);
  }

  /**
   * GET /sales/stats/summary
   * Obtener estadísticas de ventas/pedidos
   */
  @Get('stats/summary')
  @ApiOperation({ summary: 'Obtener estadísticas de ventas y entregas' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha de inicio (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha de fin (ISO 8601)',
  })
  @ApiQuery({
    name: 'sectorId',
    required: false,
    type: String,
    description: 'Filtrar por sector',
  })
  @ApiQuery({
    name: 'retailerId',
    required: false,
    type: String,
    description: 'Filtrar por minorista/cliente',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de ventas',
    schema: {
      properties: {
        totalSales: { type: 'number' },
        totalAmount: { type: 'number' },
        averageAmount: { type: 'number' },
        saleCount: { type: 'number' },
        pendingDeliveries: { type: 'number' },
        deliveredCount: { type: 'number' },
      },
    },
  })
  async getStatistics(
    @GetUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sectorId') sectorId?: string,
    @Query('retailerId') retailerId?: string,
  ) {
    return this.salesService.getStatistics(user.tenantId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      sectorId,
      retailerId,
    });
  }
}
