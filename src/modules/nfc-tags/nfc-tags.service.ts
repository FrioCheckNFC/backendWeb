import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, IsNull } from 'typeorm';
import * as crypto from 'crypto';
import { NfcTag } from './entities/nfc-tag.entity';
import { Machine } from '../machines/entities/machine.entity';
import { CreateNfcTagDto } from './dto/create-nfc-tag.dto';
import { UpdateNfcTagDto } from './dto/update-nfc-tag.dto';

@Injectable()
export class NfcTagsService {
  constructor(
    @InjectRepository(NfcTag)
    private nfcTagsRepo: Repository<NfcTag>,
    @InjectRepository(Machine)
    private machineRepo: Repository<Machine>,
  ) {}

  /**
   * Crear un nuevo tag NFC
   */
  async create(tenantId: string, data: CreateNfcTagDto): Promise<NfcTag> {
    const { uid, machineId } = data;

    // Validar que uid + tenant sea único
    const existing = await this.nfcTagsRepo.findOne({
      where: { uid, tenantId, deletedAt: IsNull() },
    });
    if (existing) {
      throw new ConflictException(
        `El tag NFC con UID ${uid} ya existe en este tenant`,
      );
    }

    // Obtener la máquina para traer su serial_number
    const machine = await this.machineRepo.findOne({
      where: { id: machineId, tenantId, deletedAt: IsNull() },
    });

    if (!machine) {
      throw new NotFoundException(
        `Máquina con ID ${machineId} no encontrada en este tenant`,
      );
    }

    // Generar tenant_id_obfuscated (primeros 8 caracteres del tenantId)
    const tenantIdObfuscated = tenantId.substring(0, 8);

    // Generar integrity_checksum basado en uid + machineSerialId + tenantIdObfuscated
    const checksumData = `${data.uid}:${machine.serialNumber}:${tenantIdObfuscated}`;
    const integrityChecksum = crypto
      .createHash('sha256')
      .update(checksumData)
      .digest('hex')
      .substring(0, 24); // Usar primeros 24 caracteres

    const nfcTag = this.nfcTagsRepo.create({
      ...data,
      tenantId,
      machineSerialId: machine.serialNumber, // Asignar automáticamente el serial_number de la máquina
      tenantIdObfuscated, // Asignar automáticamente el tenant ofuscado
      integrityChecksum, // Asignar automáticamente el checksum de integridad
    });
    return this.nfcTagsRepo.save(nfcTag);
  }

  /**
   * Obtener todos los tags NFC de un tenant
   */
  async findAll(
    tenantId: string,
    machineId?: string,
    skip = 0,
    take = 20,
  ): Promise<{ tags: NfcTag[]; total: number }> {
    const where: FindOptionsWhere<NfcTag> = { tenantId, deletedAt: IsNull() };

    if (machineId) {
      where.machineId = machineId;
    }

    const [tags, total] = await this.nfcTagsRepo.findAndCount({
      where,
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    return { tags, total };
  }

  /**
   * Obtener un tag NFC por ID
   */
  async findOne(id: string, tenantId: string): Promise<NfcTag> {
    const nfcTag = await this.nfcTagsRepo.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!nfcTag) {
      throw new NotFoundException(`Tag NFC con ID ${id} no encontrado`);
    }

    return nfcTag;
  }

  /**
   * Obtener tag NFC por UID
   */
  async findByUid(uid: string, tenantId: string): Promise<NfcTag> {
    const nfcTag = await this.nfcTagsRepo.findOne({
      where: { uid, tenantId, deletedAt: IsNull() },
    });

    if (!nfcTag) {
      throw new NotFoundException(`Tag NFC con UID ${uid} no encontrado`);
    }

    return nfcTag;
  }

  /**
   * Obtener tags de una máquina específica
   */
  async findByMachine(
    machineId: string,
    tenantId: string,
  ): Promise<NfcTag[]> {
    return this.nfcTagsRepo.find({
      where: { machineId, tenantId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar un tag NFC
   */
  async update(
    id: string,
    tenantId: string,
    data: UpdateNfcTagDto,
  ): Promise<NfcTag> {
    const nfcTag = await this.findOne(id, tenantId);

    Object.assign(nfcTag, data);
    return this.nfcTagsRepo.save(nfcTag);
  }

  /**
   * Bloquear un tag NFC
   */
  async lock(id: string, tenantId: string): Promise<NfcTag> {
    const nfcTag = await this.findOne(id, tenantId);

    if (nfcTag.isLocked) {
      throw new BadRequestException('El tag NFC ya está bloqueado');
    }

    nfcTag.isLocked = true;
    return this.nfcTagsRepo.save(nfcTag);
  }

  /**
   * Desbloquear un tag NFC
   */
  async unlock(id: string, tenantId: string): Promise<NfcTag> {
    const nfcTag = await this.findOne(id, tenantId);

    if (!nfcTag.isLocked) {
      throw new BadRequestException('El tag NFC no está bloqueado');
    }

    nfcTag.isLocked = false;
    return this.nfcTagsRepo.save(nfcTag);
  }

  /**
   * Activar un tag NFC
   */
  async activate(id: string, tenantId: string): Promise<NfcTag> {
    const nfcTag = await this.findOne(id, tenantId);

    if (nfcTag.isActive) {
      throw new BadRequestException('El tag NFC ya está activo');
    }

    nfcTag.isActive = true;
    return this.nfcTagsRepo.save(nfcTag);
  }

  /**
   * Desactivar un tag NFC
   */
  async deactivate(id: string, tenantId: string): Promise<NfcTag> {
    const nfcTag = await this.findOne(id, tenantId);

    if (!nfcTag.isActive) {
      throw new BadRequestException('El tag NFC ya está inactivo');
    }

    nfcTag.isActive = false;
    return this.nfcTagsRepo.save(nfcTag);
  }

  /**
   * Eliminar un tag NFC (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<void> {
    const nfcTag = await this.findOne(id, tenantId);
    await this.nfcTagsRepo.softRemove(nfcTag);
  }
}
