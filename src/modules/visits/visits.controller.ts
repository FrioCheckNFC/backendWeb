import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
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
import { Visit } from './entities/visit.entity';
import { CreateVisitDto, UpdateVisitDto } from './dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Visits')
@ApiBearerAuth()
@Controller('visits')
@UseGuards(JwtAuthGuard)
export class VisitsController {
  constructor(private visitsService: VisitsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva visita' })
  async create(
    @Body() createVisitDto: CreateVisitDto,
    @GetUser() user: User,
  ): Promise<Visit> {
    if (!user) {
      throw new BadRequestException('No se pudo obtener el usuario autenticado');
    }

    return this.visitsService.create(user.tenantId, user.id, createVisitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las visitas (Automático - obtiene tenantId del usuario)' })
  @ApiQuery({ name: 'technicianId', required: false, description: 'Filtrar por ID del tecnico' })
  @ApiQuery({ name: 'machineId', required: false, description: 'Filtrar por ID de la máquina' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filtrar por tipo de visita' })
  @ApiQuery({ name: 'skip', required: false, type: 'number', description: 'Cantidad de registros a saltar (default: 0)' })
  @ApiQuery({ name: 'take', required: false, type: 'number', description: 'Cantidad de registros a obtener (default: 20)' })
  async findAll(
    @GetUser() user: User,
    @Query('technicianId') technicianId?: string,
    @Query('machineId') machineId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<{ visits: Visit[]; total: number }> {
    const tenantId = user.tenantId;

    return this.visitsService.findAll(
      tenantId,
      technicianId,
      machineId,
      status,
      type,
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

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una visita (Automático - obtiene tenantId del usuario)' })
  async update(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() data: UpdateVisitDto,
  ): Promise<Visit> {
    return this.visitsService.update(id, user.tenantId, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una visita (Automático - obtiene tenantId del usuario)' })
  async delete(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    await this.visitsService.delete(id, user.tenantId);
    return { message: `Visita ${id} eliminada` };
  }
}
