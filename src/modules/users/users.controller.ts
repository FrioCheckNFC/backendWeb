import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Crear un nuevo usuario
   * POST /users
   */
  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario creado exitosamente',
    type: UserResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o tenant no encontrado' })
  @ApiResponse({ status: 409, description: 'El email o teléfono ya está registrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @GetUser() user: User,
  ): Promise<UserResponseDto> {
    const userRole = user.role?.[0] as UserRole;
    const userTenantId = user.tenantId;
    
    return await this.usersService.create(createUserDto, userRole, userTenantId);
  }

  /**
   * Obtener todos los usuarios
   * GET /users
   * - SUPER_ADMIN: ve todos los usuarios de todos los tenants
   * - ADMIN/SUPPORT: ven solo los usuarios de su tenant
   */
  @Get()
  @Roles('ADMIN', 'SUPPORT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Obtener todos los usuarios (filtrado por rol)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios',
    type: [UserResponseDto]
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll(@GetUser() user: User): Promise<UserResponseDto[]> {
    if (user.role.includes(UserRole.SUPER_ADMIN)) {
      return await this.usersService.findAll();
    } else {
      return await this.usersService.findByTenant(user.tenantId);
    }
  }

  /**
   * Buscar usuarios por nombre
   * GET /users/search/by-name?name=juan
   */
  @Get('search/by-name')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Buscar usuarios por nombre' })
  @ApiQuery({ name: 'name', required: true, description: 'Texto a buscar en nombre y apellido', example: 'Juan' })
  @ApiResponse({
    status: 200,
    description: 'Usuarios encontrados',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async searchByName(@Query('name') name: string): Promise<UserResponseDto[]> {
    return await this.usersService.searchByName(name);
  }

  /**
   * Obtener un usuario por ID
   * GET /users/:id
   */
  @Get(':id')
  @Roles('ADMIN', 'SUPPORT', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado',
    type: UserResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.usersService.findOne(id);
  }

  /**
   * Actualizar un usuario (PATCH - actualización parcial)
   * PATCH /users/:id
   */
  @Patch(':id')
  @Roles('ADMIN', 'SUPPORT', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar un usuario (parcial)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario actualizado',
    type: UserResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'El email o teléfono ya está registrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ): Promise<UserResponseDto> {
    const userRole = user.role?.[0] as UserRole;
    return await this.usersService.update(id, updateUserDto, userRole);
  }

  /**
   * Desactivar un usuario
   * DELETE /users/:id
   */
  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desactivar un usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario desactivado',
    type: UserResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async delete(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.usersService.delete(id);
  }

  /**
   * Eliminar un usuario permanentemente (hard delete)
   * DELETE /users/:id/permanent
   */
  @Delete(':id/permanent')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un usuario permanentemente' })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado permanentemente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async hardDelete(@Param('id') id: string): Promise<{ message: string }> {
    return await this.usersService.hardDelete(id);
  }
}
