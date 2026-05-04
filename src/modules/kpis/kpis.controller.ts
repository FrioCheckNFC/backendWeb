// filepath: src/modules/kpis/kpis.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { KpisService } from './kpis.service';
import { CreateKpiDto, UpdateKpiDto, KpiFilterDto } from './dto/kpi.dto';
import { UserRole } from '../users/entities/user.entity';

interface AuthenticatedRequest {
  user: {
    id: string;
    tenantId: string;
    role: UserRole[];
  };
}

@Controller('kpis')
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  // ============================================================================
  // Endpoints públicos (sin autenticación) - para testing
  // ============================================================================

  /**
   * GET /kpis/health - Health check público
   */
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      message: 'Kpis module is running',
      timestamp: new Date(),
    };
  }

  /**
   * GET /kpis/dashboard - Dashboard de KPIs (público para testing)
   */
  @Get('dashboard')
  async getDashboard(@Req() req: AuthenticatedRequest) {
    // Si no hay usuario logueado, usar un tenantId de prueba
    const tenantId = req.user?.tenantId || '89922b21-f473-4bea-a883-066440630b68';
    return this.kpisService.getDashboardKpis(tenantId);
  }

  /**
   * GET /kpis/global - KPIs globales (público para testing)
   */
  @Get('global')
  async getGlobalKpis() {
    return this.kpisService.getGlobalKpis();
  }

  /**
   * GET /kpis/support - KPIs personales (público para testing)
   */
  @Get('support')
  async getSupportKpis(@Req() req: AuthenticatedRequest) {
    const tenantId = req.user?.tenantId || '89922b21-f473-4bea-a883-066440630b68';
    const userId = req.user?.id || '24d62240-260e-4c78-a47c-81ee263b8463';
    return this.kpisService.getSupportKpis(tenantId, userId);
  }

  // ============================================================================
  // Endpoints que requieren autenticación
  // ============================================================================

  /**
   * POST /kpis - Crear un nuevo KPI
   */
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createKpiDto: CreateKpiDto,
  ) {
    return this.kpisService.create(
      req.user.tenantId,
      req.user.id,
      createKpiDto,
    );
  }

  /**
   * GET /kpis - Obtener todos los KPIs del tenant
   */
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() filters: KpiFilterDto,
  ) {
    return this.kpisService.findAll(req.user.tenantId, filters);
  }

  /**
   * GET /kpis/:id - Obtener un KPI específico
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.kpisService.findOne(req.user.tenantId, id);
  }

  /**
   * PUT /kpis/:id - Actualizar un KPI
   */
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateKpiDto: UpdateKpiDto,
  ) {
    return this.kpisService.update(req.user.tenantId, id, updateKpiDto);
  }

  /**
   * DELETE /kpis/:id - Eliminar un KPI (soft delete)
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.kpisService.remove(req.user.tenantId, id);
  }
}