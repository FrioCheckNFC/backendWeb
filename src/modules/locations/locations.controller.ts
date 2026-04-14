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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateLocationDto, UpdateLocationDto, LocationResponseDto } from './dto';

@ApiTags('Locations')
@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  /**
   * POST /locations
   * Crear una nueva ubicación
   */
  @Post()
  @ApiOperation({ summary: 'Crear una nueva ubicación' })
  @ApiResponse({
    status: 201,
    description: 'Ubicación creada exitosamente',
    type: LocationResponseDto,
  })
  async create(
    @Body() createLocationDto: CreateLocationDto,
    @GetUser() user: User,
  ): Promise<LocationResponseDto> {
    createLocationDto.tenantId = user.tenantId;
    return this.locationsService.create(createLocationDto);
  }

  /**
   * GET /locations
   * Obtener todas las ubicaciones de un tenant
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las ubicaciones' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado activo',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Registros a saltar',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Registros a tomar',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ubicaciones',
    schema: {
      properties: {
        locations: {
          type: 'array',
          items: { $ref: '#/components/schemas/LocationResponseDto' },
        },
        total: { type: 'number' },
      },
    },
  })
  async findAll(
    @GetUser() user: User,
    @Query('isActive') isActive?: boolean,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.locationsService.findAll(user.tenantId, {
      isActive,
      skip,
      take,
    });
  }

  /**
   * GET /locations/search/:name
   * Buscar ubicaciones por nombre
   */
  @Get('search/:name')
  @ApiOperation({ summary: 'Buscar ubicaciones por nombre' })
  @ApiResponse({
    status: 200,
    description: 'Ubicaciones encontradas',
    type: [LocationResponseDto],
  })
  async findByName(
    @Param('name') name: string,
    @GetUser() user: User,
  ): Promise<LocationResponseDto[]> {
    return this.locationsService.findByName(user.tenantId, name);
  }

  /**
   * GET /locations/:id
   * Obtener una ubicación específica
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ubicación por ID' })
  @ApiResponse({
    status: 200,
    description: 'Ubicación encontrada',
    type: LocationResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<LocationResponseDto> {
    return this.locationsService.findOne(id, user.tenantId);
  }

  /**
   * PATCH /locations/:id
   * Actualizar una ubicación
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una ubicación' })
  @ApiResponse({
    status: 200,
    description: 'Ubicación actualizada',
    type: LocationResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @GetUser() user: User,
  ): Promise<LocationResponseDto> {
    return this.locationsService.update(id, user.tenantId, updateLocationDto);
  }

  /**
   * DELETE /locations/:id
   * Eliminar una ubicación (soft delete)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una ubicación' })
  @ApiResponse({
    status: 200,
    description: 'Ubicación eliminada',
  })
  async delete(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.locationsService.delete(id, user.tenantId);
  }
}
