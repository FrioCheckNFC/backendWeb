import {Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, BadRequestException, DefaultValuePipe, ParseIntPipe} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse, ApiQuery} from '@nestjs/swagger';
import {MachinesService} from './machines.service';
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';
import {RolesGuard} from '../auth/guards/roles.guard';
import {Roles} from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import {Machine, MachineStatus} from './entities/machine.entity';
import {CreateMachineDto, UpdateMachineDto, UpdateMachineResponseDto} from './dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Machines')
@ApiBearerAuth()
@Controller('machines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MachinesController {
  constructor(private machinesService: MachinesService) {}

  @Post()
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({summary: 'Crear máquina'})
  @ApiBody({
    type: CreateMachineDto,
    required: true,
    examples: {
      ejemplo1: {
        summary: 'Ejemplo básico - Máquina Vending',
        value: {
          serialNumber: 'SN-2024-001',
          model: 'Vending Machine Pro V2',
          brand: 'VendTech',
          status: 'ACTIVE',
          assignedUserId: '660e8400-e29b-41d4-a716-446655440000',
          locationName: 'Centro Comercial Plaza Mayor - Piso 1',
          locationLat: 40.41678,
          locationLng: -3.70379,
        },
      },
      ejemplo2: {
        summary: 'Ejemplo con NFC y fecha',
        value: {
          serialNumber: 'SN-2024-002',
          model: 'Smart Dispenser X1',
          brand: 'DispenseLabs',
          status: 'ACTIVE',
          assignedUserId: '660e8400-e29b-41d4-a716-446655440000',
          locationName: 'Oficina Central - Recepción',
          locationLat: 40.42045,
          locationLng: -3.69465,
          nfcUid: 'NFC-00A1B2C3D4',
          nfcTagId: '770e8400-e29b-41d4-a716-446655440000',
          installedAt: '2024-04-01T10:30:00Z',
          description: 'Máquina de vending ubicada en entrada principal',
        },
      },
      ejemplo3: {
        summary: 'Ejemplo mínimo',
        value: {
          serialNumber: 'SN-2024-003',
          model: 'Basic Vending Unit',
          status: 'ACTIVE',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Máquina creada exitosamente',
    type: Machine,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async create(@Body() data: CreateMachineDto, @GetUser() user: User): Promise<Machine> {
    data.tenantId = user.tenantId;
    return await this.machinesService.create(data);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPPORT', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
  @ApiOperation({summary: 'Obtener máquina'})
  async findOne(@Param('id') id: string, @GetUser() user: User): Promise<Machine> {
    return await this.machinesService.findOne(id, user.tenantId);
  }

  @Get()
  @Roles('ADMIN', 'SUPPORT', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
  @ApiOperation({summary: 'Listar máquinas'})
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado de la máquina',
    enum: MachineStatus,
    example: MachineStatus.ACTIVE,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Número de registros a saltar (para paginación)',
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Número de registros a retornar (máximo 100)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de máquinas obtenida exitosamente',
    schema: {
      example: {
        machines: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            tenantId: '550e8400-e29b-41d4-a716-446655440000',
            serialNumber: 'SN-2024-001',
            model: 'Vending Machine Pro V2',
            brand: 'VendTech',
            status: 'ACTIVE',
            assignedUserId: '660e8400-e29b-41d4-a716-446655440000',
            locationName: 'Centro Comercial Plaza Mayor',
            locationLat: 40.41678,
            locationLng: -3.70379,
            createdAt: '2024-04-01T10:30:00Z',
            updatedAt: '2024-04-01T15:45:00Z',
            deletedAt: null,
          },
        ],
        total: 1,
      },
    },
  })
  async findAll(
    @GetUser() user: User,
    @Query('status') status?: MachineStatus,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number = 20,
  ): Promise<{ machines: Machine[]; total: number }> {
    return await this.machinesService.findAll(user.tenantId, status, skip, take);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPPORT', 'TECHNICIAN')
  @ApiOperation({ summary: 'Actualizar máquina (obtiene tenantId automáticamente)' })
  @ApiBody({
    type: UpdateMachineDto,
    required: true,
    examples: {
      ejemplo1: {
        summary: 'Actualización parcial - Solo modelo y marca',
        value: {
          model: 'Refrigerador Samsung RF28 - Actualizado',
          brand: 'Samsung',
        },
      },
      ejemplo2: {
        summary: 'Actualización completa - Todos los campos',
        value: {
          serialNumber: 'SN-RF-00001',
          model: 'Refrigerador Samsung RF28',
          brand: 'Samsung',
          locationName: 'Almacén Central',
          locationLat: -34.55568662,
          locationLng: -58.36408539,
          status: 'ACTIVE',
          assignedUserId: 'cfe41b62-9b35-4e8d-9a4f-4a7789a41320',
          sectorId: '550e8400-e29b-41d4-a716-446655440002',
        },
      },
      ejemplo3: {
        summary: 'Actualización de ubicación',
        value: {
          locationName: 'Sucursal Centro',
          locationLat: -34.6037,
          locationLng: -58.3816,
        },
      },
      ejemplo4: {
        summary: 'Cambio de estado y usuario asignado',
        value: {
          status: 'IN_MAINTENANCE',
          assignedUserId: 'cfe41b62-9b35-4e8d-9a4f-4a7789a41320',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Máquina actualizada exitosamente',
    type: UpdateMachineResponseDto,
    example: {
      id: '595b8f06-5fc4-42f3-854a-2f1b8e1732d1',
      tenantId: 'ff89158e-a521-4168-8a9f-cecb78d6f408',
      serialNumber: 'SN-RF-00001',
      model: 'Refrigerador Samsung RF28',
      brand: 'Samsung',
      locationName: 'Almacén Central',
      locationLat: -34.55568662,
      locationLng: -58.36408539,
      status: 'ACTIVE',
      assignedUserId: 'cfe41b62-9b35-4e8d-9a4f-4a7789a41320',
      sectorId: '550e8400-e29b-41d4-a716-446655440002',
      createdAt: '2026-03-30T15:13:36.77929Z',
      updatedAt: '2026-03-30T15:13:36.77929Z',
      deletedAt: null,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido',
  })
  @ApiResponse({
    status: 404,
    description: 'Máquina no encontrada',
  })
  async update(
    @Param('id') id: string,
    @Body() data: UpdateMachineDto,
    @GetUser() user: User,
  ): Promise<Machine> {
    return await this.machinesService.update(id, user.tenantId, data);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'SUPPORT', 'TECHNICIAN')
  @ApiOperation({summary: 'Cambiar estado'})
  async changeStatus(
    @Param('id') id: string,
    @GetUser() user: User,
    @Query('newStatus') newStatus: MachineStatus,
  ): Promise<Machine> {
    return await this.machinesService.changeStatus(id, user.tenantId, newStatus);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({summary: 'Eliminar máquina'})
  async delete(@Param('id') id: string, @GetUser() user: User): Promise<{ message: string }> {
    await this.machinesService.delete(id, user.tenantId);
    return { message: `Máquina ${id} eliminada` };
  }
}

