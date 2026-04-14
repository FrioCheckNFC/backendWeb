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
import { CreateSectorDto, UpdateSectorDto, SectorResponseDto, UpdateSectorResponseDto } from './dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Sectors (Locales Físicos)')
@ApiBearerAuth()
@Controller('sectors')
@UseGuards(JwtAuthGuard)
export class SectorsController {
  constructor(private sectorsService: SectorsService) {}

  /**
   * POST /sectors
   * Crear un nuevo local
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo local físico' })
  @ApiResponse({
    status: 201,
    description: 'Local creado exitosamente',
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
   * Obtener todos los locales
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los locales' })
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
    description: 'Lista de locales',
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
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.sectorsService.findAll(user.tenantId, {
      isActive,
      skip,
      take,
    });
  }

  /**
   * GET /sectors/:id/details
   * Obtener un local con todas sus máquinas y NFC tags
   */
  @Get(':id/details')
  @ApiOperation({ summary: 'Obtener local con máquinas y NFC tags' })
  @ApiResponse({
    status: 200,
    description: 'Local encontrado con detalles',
    type: SectorResponseDto,
  })
  async findOneWithMachines(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<SectorResponseDto> {
    return this.sectorsService.findOneWithMachines(id, user.tenantId);
  }

  /**
   * GET /sectors/:id
   * Obtener un local específico
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener local por ID' })
  @ApiResponse({
    status: 200,
    description: 'Local encontrado',
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
   * Actualizar un local (obtiene tenantId automáticamente)
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar local (obtiene tenantId automáticamente)' })
  @ApiBody({
    type: UpdateSectorDto,
    required: true,
    examples: {
      ejemplo1: {
        summary: 'Actualización parcial - Solo nombre y descripción',
        value: {
          name: 'Bodegón El Sol - Actualizado',
          description: 'Sucursal principal actualizada con más máquinas',
        },
      },
      ejemplo2: {
        summary: 'Actualización completa con todo',
        value: {
          name: 'Bodegón El Sol',
          description: 'Sucursal principal con 12 máquinas',
          isActive: true,
          address: 'Av. Libertador 45, Este',
          latitude: -33.86880000,
          longitude: -56.16360000,
          contactName: 'Juan Pérez',
          phone: '+56998765432',
          email: 'juan@example.com',
          contactUserId: '51339c6d-2876-440d-addb-b4f2229c1928',
          color: '#FF5733',
          icon: 'fas-store',
          order: 1,
        },
      },
      ejemplo3: {
        summary: 'Actualización de ubicación GPS',
        value: {
          address: 'Av. Libertador 45, Este',
          latitude: -33.86880000,
          longitude: -56.16360000,
        },
      },
      ejemplo4: {
        summary: 'Actualización de contacto',
        value: {
          contactName: 'María García',
          phone: '+56987654321',
          contactUserId: '51339c6d-2876-440d-addb-b4f2229c1928',
        },
      },
      ejemplo5: {
        summary: 'Cambio de estado y apariencia',
        value: {
          isActive: true,
          color: '#FF5733',
          icon: 'fas-store-alt',
          order: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Local actualizado exitosamente',
    type: UpdateSectorResponseDto,
    examples: {
      example: {
        summary: 'Respuesta exitosa',
        value: {
          id: 'a7541a77-9af6-4d45-a9c2-b7415b572584',
          tenantId: 'ff89158e-a521-4168-8a9f-cecb78d6f408',
          name: 'Bodegón El Sol',
          description: 'Sucursal principal con 12 máquinas',
          isActive: true,
          address: 'Av. Libertador 45, Este',
          latitude: -33.86880000,
          longitude: -56.16360000,
          contactName: 'Juan Pérez',
          phone: '+56998765432',
          email: 'juan@example.com',
          contactUserId: '51339c6d-2876-440d-addb-b4f2229c1928',
          color: '#FF5733',
          icon: 'fas-store',
          order: 1,
          createdAt: '2026-04-07T18:51:40.580514Z',
          updatedAt: '2026-04-07T18:51:40.580514Z',
          deletedAt: null,
        },
      },
    },
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
    description: 'Local no encontrado',
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
   * Eliminar un local (soft delete)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar local' })
  @ApiResponse({
    status: 200,
    description: 'Local eliminado',
  })
  async delete(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.sectorsService.delete(id, user.tenantId);
  }
}
