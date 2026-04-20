import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { NfcTagsService } from './nfc-tags.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { NfcTag } from './entities/nfc-tag.entity';
import { CreateNfcTagDto, UpdateNfcTagDto, NfcTagListResponseDto } from './dto';
import { User } from '../users/entities/user.entity';

@ApiTags('NFC Tags')
@ApiBearerAuth()
@Controller('nfc-tags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NfcTagsController {
  constructor(private nfcTagsService: NfcTagsService) {}

  @Post()
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Crear un nuevo tag NFC' })
  @ApiBody({
    type: CreateNfcTagDto,
    required: true,
    examples: {
      ejemplo1: {
        summary: 'Tag NFC básico',
        description: 'machine_serial_id, tenant_name e integrity_checksum se generan automáticamente',
        value: {
          machineId: '595b8f06-5fc4-42f3-854a-2f1b8e1732d1',
          uid: 'NFC-68212T',
          tagModel: 'NTAG-215',
          hardwareModel: 'NTAG215',
          isActive: true,
        },
      },
      ejemplo2: {
        summary: 'Tag NFC minimal',
        description: 'Solo los campos obligatorios',
        value: {
          machineId: '595b8f06-5fc4-42f3-854a-2f1b8e1732d1',
          uid: 'NFC-68212T',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tag NFC creado exitosamente',
    type: NfcTag,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o UID duplicado',
  })
  async create(
    @Body() data: CreateNfcTagDto,
    @GetUser() user: User,
  ): Promise<NfcTag> {
    return await this.nfcTagsService.create(user.tenantId, data);
  }

  @Get()
  @Roles('ADMIN', 'SUPPORT', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
  @ApiOperation({ summary: 'Listar tags NFC (Automático - obtiene tenantId del usuario)' })
  @ApiQuery({
    name: 'machineId',
    required: false,
    description: 'Filtrar por máquina',
    example: '595b8f06-5fc4-42f3-854a-2f1b8e1732d1',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Registros a saltar',
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Cantidad a retornar',
    example: 20,
    schema: { minimum: 1, maximum: 100 },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tags NFC obtenida exitosamente',
    type: NfcTagListResponseDto,
    example: {
      tags: [
        {
          id: 'eda94cc6-2f1b-465c-8881-6d479c2ab452',
          tenantId: 'ff89158e-a521-4168-8a9f-cecb78d6f408',
          machineId: '595b8f06-5fc4-42f3-854a-2f1b8e1732d1',
          uid: 'NFC-68212T',
          tagModel: 'NTAG-215',
          hardwareModel: 'NTAG215',
          machineSerialId: 'SN-RF-00001',
          tenantName: 'SuperFrio Refrigeración',
          integrityChecksum: 'k57fbxtpm6tvrfg19a074a',
          isLocked: false,
          isActive: true,
          createdAt: '2026-03-30T15:13:37.475249Z',
          updatedAt: '2026-03-30T15:13:37.475249Z',
          deletedAt: null,
        },
      ],
      total: 1,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado',
  })
  async findAll(
    @GetUser() user: User,
    @Query('machineId') machineId?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number = 20,
  ): Promise<{ tags: NfcTag[]; total: number }> {
    return await this.nfcTagsService.findAll(user.tenantId, machineId, skip, take);
  }

  @Get('by-uid/:uid')
  @Roles('ADMIN', 'SUPPORT', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
  @ApiOperation({ summary: 'Obtener tag NFC por UID (Automático - obtiene tenantId del usuario)' })
  @ApiResponse({
    status: 200,
    description: 'Tag NFC encontrado',
    type: NfcTag,
  })
  @ApiResponse({
    status: 404,
    description: 'Tag NFC no encontrado',
  })
  async findByUid(
    @Param('uid') uid: string,
    @GetUser() user: User,
  ): Promise<NfcTag> {
    return await this.nfcTagsService.findByUid(uid, user.tenantId);
  }

  @Get('machine/:machineId')
  @Roles('ADMIN', 'SUPPORT', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
  @ApiOperation({ summary: 'Obtener tags NFC de una máquina (Automático - obtiene tenantId del usuario)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tags de la máquina',
  })
  async findByMachine(
    @Param('machineId') machineId: string,
    @GetUser() user: User,
  ): Promise<NfcTag[]> {
    return await this.nfcTagsService.findByMachine(machineId, user.tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPPORT', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
  @ApiOperation({ summary: 'Obtener tag NFC por ID (Automático - obtiene tenantId del usuario)' })
  @ApiResponse({
    status: 200,
    description: 'Tag NFC encontrado',
    type: NfcTag,
  })
  @ApiResponse({
    status: 404,
    description: 'Tag NFC no encontrado',
  })
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<NfcTag> {
    return await this.nfcTagsService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Actualizar tag NFC' })
  @ApiBody({ type: UpdateNfcTagDto })
  @ApiResponse({
    status: 200,
    description: 'Tag NFC actualizado',
    type: NfcTag,
  })
  @ApiResponse({
    status: 404,
    description: 'Tag NFC no encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() data: UpdateNfcTagDto,
    @GetUser() user: User,
  ): Promise<NfcTag> {
    return await this.nfcTagsService.update(id, user.tenantId, data);
  }

  @Patch(':id/lock')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Bloquear tag NFC' })
  @ApiResponse({
    status: 200,
    description: 'Tag NFC bloqueado',
    type: NfcTag,
  })
  async lock(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<NfcTag> {
    return await this.nfcTagsService.lock(id, user.tenantId);
  }

  @Patch(':id/unlock')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Desbloquear tag NFC' })
  @ApiResponse({
    status: 200,
    description: 'Tag NFC desbloqueado',
    type: NfcTag,
  })
  async unlock(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<NfcTag> {
    return await this.nfcTagsService.unlock(id, user.tenantId);
  }

  @Patch(':id/activate')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Activar tag NFC' })
  @ApiResponse({
    status: 200,
    description: 'Tag NFC activado',
    type: NfcTag,
  })
  async activate(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<NfcTag> {
    return await this.nfcTagsService.activate(id, user.tenantId);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Desactivar tag NFC' })
  @ApiResponse({
    status: 200,
    description: 'Tag NFC desactivado',
    type: NfcTag,
  })
  async deactivate(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<NfcTag> {
    return await this.nfcTagsService.deactivate(id, user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar tag NFC' })
  @ApiResponse({
    status: 200,
    description: 'Tag NFC eliminado',
  })
  @ApiResponse({
    status: 404,
    description: 'Tag NFC no encontrado',
  })
  async delete(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    await this.nfcTagsService.delete(id, user.tenantId);
    return { message: `Tag NFC ${id} eliminado` };
  }
}
