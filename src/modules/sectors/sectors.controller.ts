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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SectorsService } from './sectors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateSectorDto, UpdateSectorDto, SectorResponseDto } from './dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Sectors (Regiones y Comunas)')
@ApiBearerAuth()
@Controller('sectors')
@UseGuards(JwtAuthGuard)
export class SectorsController {
  constructor(private sectorsService: SectorsService) {}

  /**
   * POST /sectors
   * Crear un nuevo sector (región/comuna)
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo sector (región y comuna)' })
  @ApiResponse({
    status: 201,
    description: 'Sector creado exitosamente',
    type: SectorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o validaciones fallidas',
  })
  async create(
    @Body() createSectorDto: CreateSectorDto,
    @GetUser() user: User,
  ): Promise<SectorResponseDto> {
    // Asignar automáticamente el tenantId del usuario autenticado
    createSectorDto.tenantId = user.tenantId;
    return this.sectorsService.create(createSectorDto);
  }

  /**
   * GET /sectors
   * Obtener todos los sectores
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los sectores (filtrados por región y comuna)' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado activo',
  })
  @ApiQuery({
    name: 'comuna',
    required: false,
    type: String,
    description: 'Filtrar por comuna',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filtrar por ciudad/región',
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
    description: 'Lista de sectores',
    schema: {
      properties: {
        sectors: {
          type: 'array',
          items: { $ref: '#/components/schemas/SectorResponseDto' },
        },
        total: { type: 'number' },
      },
    },
  })
  async findAll(
    @GetUser() user: User,
    @Query('isActive') isActive?: boolean,
    @Query('comuna') comuna?: string,
    @Query('city') city?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.sectorsService.findAll(user.tenantId, {
      isActive,
      comuna,
      city,
      skip,
      take,
    });
  }

  /**
   * GET /sectors/:id
   * Obtener un sector específico
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener sector por ID' })
  @ApiResponse({
    status: 200,
    description: 'Sector encontrado',
    type: SectorResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<SectorResponseDto> {
    return this.sectorsService.findOne(id, user.tenantId);
  }

  /**
   * PATCH /sectors/:id
   * Actualizar un sector
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar sector (dirección, coordenadas, región y comuna)' })
  @ApiBody({
    type: UpdateSectorDto,
    required: true,
    examples: {
      ejemplo1: {
        summary: 'Cambio de dirección y coordenadas',
        value: {
          address: 'Nueva dirección 123',
          latitude: -33.45,
          longitude: -70.65,
        },
      },
      ejemplo2: {
        summary: 'Cambio de comuna',
        value: {
          comuna: 'Las Condes',
        },
      },
      ejemplo3: {
        summary: 'Cambio de ciudad/región',
        value: {
          city: 'Valparaíso',
        },
      },
      ejemplo4: {
        summary: 'Cambio de estado',
        value: {
          isActive: false,
        },
      },
      ejemplo5: {
        summary: 'Cambios múltiples',
        value: {
          address: 'Nueva dirección 456',
          latitude: -33.40,
          longitude: -70.63,
          comuna: 'Recoleta',
          city: 'Región Metropolitana',
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Sector actualizado exitosamente',
    type: SectorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido',
  })
  @ApiResponse({
    status: 404,
    description: 'Sector no encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSectorDto: UpdateSectorDto,
    @GetUser() user: User,
  ): Promise<SectorResponseDto> {
    return this.sectorsService.update(id, user.tenantId, updateSectorDto);
  }

  /**
   * DELETE /sectors/:id
   * Eliminar un sector (soft delete)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar sector' })
  @ApiResponse({
    status: 200,
    description: 'Sector eliminado',
  })
  async delete(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.sectorsService.delete(id, user.tenantId);
  }
}
