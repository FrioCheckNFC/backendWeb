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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { CreateTicketDto, TicketResponseDto } from './dto';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear un nuevo ticket',
    description: 'Crea un ticket usando el tenant y usuario autenticado. El backend asigna automáticamente tenant_id y created_by_id desde el JWT.'
  })
  @ApiBody({
    type: CreateTicketDto,
    required: true,
    description: 'Payload para crear ticket. tenant_id y created_by_id se completan automáticamente desde el token JWT.',
    examples: {
      ejemplo_base: {
        summary: 'Ejemplo base',
        description: 'Ticket alineado a columnas reales en BD',
        value: {
          machineId: '660e8400-e29b-41d4-a716-446655440000',
          title: 'Falla en SN-RF-00001',
          description: 'La máquina no enfría correctamente.',
          priority: 'high',
          status: 'open',
        },
      },
      ejemplo_con_asignacion: {
        summary: 'Ejemplo con técnico asignado',
        description: 'Permite asignar assigned_to_id al crear si el usuario es TECHNICIAN',
        value: {
          machineId: '660e8400-e29b-41d4-a716-446655440001',
          priority: 'critical',
          status: 'assigned',
          title: 'Máquina no dispensa productos',
          description: 'Revisar módulo dispensador',
          assignedToId: '660e8400-e29b-41d4-a716-446655440111',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket creado exitosamente',
    type: TicketResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o faltantes',
  })
  async create(
    @Body() data: CreateTicketDto,
    @GetUser('id') userId: string,
    @GetUser('tenantId') tenantId: string,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.create(data, userId, tenantId);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los tickets',
    description: 'Obtiene todos los tickets del tenant autenticado. El tenantId se extrae del token JWT, no es necesario enviarlo como parámetro. Cada ticket incluye información completa de máquina y usuarios relacionados.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TicketStatus,
    description: 'Filtrar por estado del ticket',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: TicketPriority,
    description: 'Filtrar por prioridad del ticket',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Registros a saltar (paginación)',
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Cantidad de registros a retornar',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tickets obtenida exitosamente',
    type: TicketResponseDto,
    isArray: true,
  })
  async findAll(
    @GetUser('tenantId') tenantId: string,
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: TicketPriority,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<{ tickets: TicketResponseDto[]; total: number }> {
    return this.ticketsService.findAll(
      tenantId,
      status,
      priority,
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un ticket por ID',
    description: 'Obtiene un ticket específico del tenant autenticado. El tenantId se extrae del token JWT. Incluye información completa de máquina y usuarios relacionados.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID del ticket',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket obtenido exitosamente',
    type: TicketResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket no encontrado',
  })
  async findOne(
    @Param('id') id: string,
    @GetUser('tenantId') tenantId: string,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un ticket',
    description: 'Actualiza los datos de un ticket. El tenantId se extrae del token JWT. Retorna el ticket actualizado con información completa de relaciones.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID del ticket a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket actualizado exitosamente',
    type: TicketResponseDto,
  })
  async update(
    @Param('id') id: string,
    @GetUser('tenantId') tenantId: string,
    @Body() data: Partial<Ticket>,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.update(id, tenantId, data);
  }

  @Patch(':id/assign')
  @ApiOperation({
    summary: 'Asignar un ticket a un técnico',
    description: 'Asigna un ticket a un técnico específico. El tenantId se extrae del token JWT. Retorna el ticket con información completa actualizada.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID del ticket',
  })
  @ApiQuery({
    name: 'assignedToId',
    required: true,
    description: 'ID del técnico al que se asignará el ticket',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket asignado exitosamente',
    type: TicketResponseDto,
  })
  async assign(
    @Param('id') id: string,
    @GetUser('tenantId') tenantId: string,
    @Query('assignedToId') assignedToId: string,
  ): Promise<TicketResponseDto> {
    if (!assignedToId) throw new BadRequestException('assignedToId requerido');
    return this.ticketsService.assign(id, tenantId, assignedToId);
  }

  @Patch(':id/in-progress')
  @ApiOperation({
    summary: 'Marcar ticket como en progreso',
    description: 'Cambia el estado del ticket a "en progreso". El tenantId se extrae del token JWT. Retorna el ticket actualizado con información completa.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID del ticket',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket marcado como en progreso',
    type: TicketResponseDto,
  })
  async markInProgress(
    @Param('id') id: string,
    @GetUser('tenantId') tenantId: string,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.markInProgress(id, tenantId);
  }

  @Patch(':id/resolve')
  @ApiOperation({
    summary: 'Marcar un ticket como resuelto',
    description: 'Cambia el estado del ticket a "resuelto". El tenantId se extrae del token JWT. Retorna el ticket actualizado con información completa.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID del ticket',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket marcado como resuelto',
    type: TicketResponseDto,
  })
  async resolve(
    @Param('id') id: string,
    @GetUser('tenantId') tenantId: string,
    @Body('resolutionNotes') resolutionNotes?: string,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.resolve(id, tenantId, resolutionNotes);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un ticket',
    description: 'Elimina un ticket del tenant autenticado. El tenantId se extrae del token JWT.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID del ticket a eliminar',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket eliminado exitosamente',
  })
  async delete(
    @Param('id') id: string,
    @GetUser('tenantId') tenantId: string,
  ): Promise<{ message: string }> {
    await this.ticketsService.delete(id, tenantId);
    return { message: `Ticket ${id} eliminado` };
  }
}
