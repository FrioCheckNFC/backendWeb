import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { DashboardService } from './dashboard.service';
import {
  DashboardSummaryResponseDto,
  MachinesStatusResponseDto,
  TicketsResponseDto,
  VisitsResponseDto,
} from './dto';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/summary
   * Obtener resumen general del dashboard
   * Devuelve: activos, tickets, visitas y métricas generales
   */
  @Get('summary')
  @ApiOperation({
    summary: 'Resumen general del dashboard',
    description:
      'Obtiene métricas consolidadas de máquinas, tickets y visitas',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen exitoso',
    type: DashboardSummaryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros inválidos',
  })
  async getSummary(
    @GetUser() user: User,
  ): Promise<DashboardSummaryResponseDto> {
    return this.dashboardService.getSummary(user.tenantId);
  }

  /**
   * GET /dashboard/machines-status
   * Obtener estado de máquinas con conteo por estado
   */
  @Get('machines-status')
  @ApiOperation({
    summary: 'Estado de máquinas',
    description:
      'Obtiene conteo de máquinas por estado (activas, inactivas, mantenimiento, etc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de estado exitosos',
    type: MachinesStatusResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros inválidos',
  })
  async getMachinesStatus(
    @GetUser() user: User,
  ): Promise<MachinesStatusResponseDto> {
    return this.dashboardService.getMachinesStatus(user.tenantId);
  }

  /**
   * GET /dashboard/tickets
   * Obtener información de tickets abiertos y métricas
   */
  @Get('tickets')
  @ApiOperation({
    summary: 'Información de tickets',
    description:
      'Obtiene estadísticas de tickets (abiertos, por prioridad, tiempo promedio de resolución)',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de tickets exitosos',
    type: TicketsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros inválidos',
  })
  async getTickets(
    @GetUser() user: User,
  ): Promise<TicketsResponseDto> {
    return this.dashboardService.getTickets(user.tenantId);
  }

  /**
   * GET /dashboard/visits
   * Obtener información de visitas por período
   */
  @Get('visits')
  @ApiOperation({
    summary: 'Información de visitas',
    description:
      'Obtiene estadísticas de visitas (por período, tipo, duración promedio, escaneos NFC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de visitas exitosos',
    type: VisitsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros inválidos',
  })
  async getVisits(
    @GetUser() user: User,
  ): Promise<VisitsResponseDto> {
    return this.dashboardService.getVisits(user.tenantId);
  }
}
