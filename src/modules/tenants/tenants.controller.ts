import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard) // Todos los endpoints requieren JWT + rol
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  // GET /api/v1/tenants — Listar todos los tenants (solo SUPER_ADMIN)
  @Get()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar todos los tenants (solo SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de tenants' })
  findAll() {
    return this.tenantsService.findAll();
  }

  // GET /api/v1/tenants/me — Obtener el tenant del usuario autenticado
  @Get('me')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
  @ApiOperation({ summary: 'Obtener informacion del tenant del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Tenant del usuario autenticado' })
  @ApiResponse({ status: 404, description: 'Tenant no encontrado' })
  findMyTenant(@GetUser() user: User) {
    return this.tenantsService.findOne(user.tenantId);
  }

  // GET /api/v1/tenants/:id — Obtener un tenant por ID (solo SUPER_ADMIN)
  @Get(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Obtener un tenant por ID (solo SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Tenant encontrado' })
  @ApiResponse({ status: 404, description: 'Tenant no encontrado' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  // POST /api/v1/tenants — Crear un tenant nuevo (solo SUPER_ADMIN)
  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear un tenant nuevo (solo SUPER_ADMIN)' })
  @ApiResponse({ status: 201, description: 'Tenant creado' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  // PUT /api/v1/tenants/:id — Actualizar un tenant (solo SUPER_ADMIN)
  @Put(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar un tenant (solo SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Tenant actualizado' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  // DELETE /api/v1/tenants/:id — Eliminar un tenant (soft delete, solo SUPER_ADMIN)
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Eliminar un tenant (soft delete, solo SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Tenant eliminado' })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
