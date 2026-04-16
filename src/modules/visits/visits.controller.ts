import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VisitsService } from './visits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Visit, VisitStatus } from './entities/visit.entity';
import { CreateVisitDto, CheckOutVisitDto } from './dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Visits')
@ApiBearerAuth()
@Controller('visits')
@UseGuards(JwtAuthGuard)
export class VisitsController {
  constructor(private visitsService: VisitsService) {}

  @Post()
  @ApiOperation({ summary: 'Iniciar una nueva visita (check-in)' })
  async create(
    @Body() createVisitDto: CreateVisitDto,
    @GetUser() user: User,
  ): Promise<Visit> {
    // Validar que el usuario fue extraído correctamente
    if (!user) {
      throw new BadRequestException('No se pudo obtener el usuario autenticado');
    }

    // Obtener tenantId y userId del usuario autenticado
    const data = {
      ...createVisitDto,
      tenantId: createVisitDto.tenantId || user.tenantId,
      userId: createVisitDto.userId || user.id,
      checkInTimestamp: createVisitDto.checkInTimestamp
        ? new Date(createVisitDto.checkInTimestamp)
        : new Date(),
    };
    return this.visitsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las visitas (Automático - obtiene tenantId del usuario)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrar por ID del usuario' })
  @ApiQuery({ name: 'machineId', required: false, description: 'Filtrar por ID de la máquina' })
  @ApiQuery({ name: 'status', required: false, enum: VisitStatus, description: 'Filtrar por estado (ABIERTA, CERRADA, ANULADA)' })
  @ApiQuery({ name: 'skip', required: false, type: 'number', description: 'Cantidad de registros a saltar (default: 0)' })
  @ApiQuery({ name: 'take', required: false, type: 'number', description: 'Cantidad de registros a obtener (default: 20)' })
  async findAll(
    @GetUser() user: User,
    @Query('userId') userId?: string,
    @Query('machineId') machineId?: string,
    @Query('status') status?: VisitStatus,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<{ visits: Visit[]; total: number }> {
    // Obtener tenantId del usuario autenticado
    const tenantId = user.tenantId;
    
    return this.visitsService.findAll(
      tenantId,
      userId,
      machineId,
      status,
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una visita por ID (Automático - obtiene tenantId del usuario)' })
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Visit> {
    return this.visitsService.findOne(id, user.tenantId);
  }

  @Patch(':id/checkout')
  @ApiOperation({ summary: 'Realizar check-out de una visita (Automático - obtiene tenantId del usuario)' })
  async checkout(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() checkOutVisitDto: CheckOutVisitDto,
  ): Promise<Visit> {
    // Convertir fechas string a Date
    const data = {
      ...checkOutVisitDto,
      checkOutTimestamp: checkOutVisitDto.checkOutTimestamp
        ? new Date(checkOutVisitDto.checkOutTimestamp)
        : undefined,
    };
    return this.visitsService.checkout(id, user.tenantId, data);
  }

  @Patch(':id/update')
  @ApiOperation({ summary: 'Actualizar una visita (Automático - obtiene tenantId del usuario)' })
  async update(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() data: Partial<Visit>,
  ): Promise<Visit> {
    return this.visitsService.update(id, user.tenantId, data);
  }

  @Get('user/:userId/range')
  @ApiOperation({ summary: 'Obtener visitas de un usuario en un rango de fechas (Automático - obtiene tenantId del usuario)' })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'Fecha inicial (ISO 8601)', example: '2026-01-01T00:00:00.000Z' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'Fecha final (ISO 8601)', example: '2026-01-31T23:59:59.999Z' })
  async findByUserDateRange(
    @Param('userId') userId: string,
    @GetUser() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Visit[]> {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate y endDate requeridos');
    }
    return this.visitsService.findByUserDateRange(
      user.tenantId,
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
