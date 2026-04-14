import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';
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
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario creado exitosamente',
    type: UserResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @GetUser() user: User,
  ): Promise<UserResponseDto> {
    if (!createUserDto.tenantId) {
      createUserDto.tenantId = user.tenantId;
    }
    return await this.usersService.create(createUserDto);
  }

  /**
   * Obtener todos los usuarios
   * GET /users
   */
  @Get()
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios',
    type: [UserResponseDto]
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll(): Promise<UserResponseDto[]> {
    return await this.usersService.findAll();
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
   * Obtener usuarios por tenant
   * GET /users/tenant/:tenantId
   */
  @Get('tenant/:tenantId')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Obtener usuarios del tenant autenticado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuarios del tenant',
    type: [UserResponseDto]
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findByTenant(
    @GetUser() user: User,
  ): Promise<UserResponseDto[]> {
    return await this.usersService.findByTenant(user.tenantId);
  }

  /**
   * Actualizar un usuario (PATCH - actualización parcial)
   * PATCH /users/:id
   */
  @Patch(':id')
  @Roles('ADMIN', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
  @ApiOperation({ summary: 'Actualizar un usuario (parcial)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario actualizado',
    type: UserResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return await this.usersService.update(id, updateUserDto);
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
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return await this.usersService.delete(id);
  }
}
