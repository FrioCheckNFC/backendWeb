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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateLocationDto, UpdateLocationDto, LocationResponseDto } from './dto';

@ApiTags('Stores')
@ApiBearerAuth()
@Controller('stores')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  /**
   * POST /stores
   * Crear una nueva tienda/local
   */
  @Post()
  @ApiOperation({ summary: 'Crear una nueva store' })
  @ApiResponse({
    status: 201,
    description: 'Store creada exitosamente',
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
   * GET /stores
   * Obtener todas las stores de un tenant
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las stores' })
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
    description: 'Lista de stores',
    schema: {
      properties: {
        stores: {
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
   * GET /stores/search/:name
   * Buscar stores por nombre
   */
  @Get('search/:name')
  @ApiOperation({ summary: 'Buscar stores por nombre' })
  @ApiResponse({
    status: 200,
    description: 'Stores encontradas',
    type: [LocationResponseDto],
  })
  async findByName(
    @Param('name') name: string,
    @GetUser() user: User,
  ): Promise<LocationResponseDto[]> {
    return this.locationsService.findByName(user.tenantId, name);
  }

  /**
   * GET /stores/:id
   * Obtener una store específica
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una store por ID' })
  @ApiResponse({
    status: 200,
    description: 'Store encontrada',
    type: LocationResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<LocationResponseDto> {
    return this.locationsService.findOne(id, user.tenantId);
  }

  /**
   * PATCH /stores/:id
   * Actualizar una store
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una store' })
  @ApiResponse({
    status: 200,
    description: 'Store actualizada',
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
   * DELETE /stores/:id
   * Eliminar una store (soft delete)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una store' })
  @ApiResponse({
    status: 200,
    description: 'Store eliminada',
  })
  async delete(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.locationsService.delete(id, user.tenantId);
  }
}
