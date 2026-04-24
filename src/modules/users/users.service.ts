import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(Tenant)
    private tenantsRepo: Repository<Tenant>,
  ) {}

  /**
   * Crear un nuevo usuario
   * @param createUserDto DTO con datos del usuario
   * @returns Usuario creado (sin passwordHash)
   */
  async create(createUserDto: CreateUserDto, userRole?: UserRole, userTenantId?: string): Promise<UserResponseDto> {
    const { email, password, firstName, lastName, role, tenantId, phone } = createUserDto;

    // Validar que el email no exista
    const existingUser = await this.usersRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException(`El email ${email} ya está registrado`);
    }

    // Validar que el teléfono no exista (si se proporciona)
    if (phone) {
      const existingPhone = await this.usersRepo.findOne({ where: { phone } });
      if (existingPhone) {
        throw new ConflictException(`El teléfono ${phone} ya está registrado en otro usuario`);
      }
    }

    // Determinar el tenantId a asignar
    let finalTenantId: string;

    if (userRole === UserRole.SUPER_ADMIN) {
      // SUPER_ADMIN puede elegir cualquier tenant
      if (!tenantId) {
        throw new BadRequestException('El tenantId es requerido para SUPER_ADMIN');
      }
      finalTenantId = tenantId;
    } else {
      // ADMIN y SUPPORT deben ser asignados a su propio tenant
      if (!userTenantId) {
        throw new BadRequestException('No se puede asignar un tenant válido al usuario');
      }
      if (tenantId && tenantId !== userTenantId) {
        throw new ConflictException('No puedes asignar un usuario a otro tenant que no sea el tuyo');
      }
      finalTenantId = userTenantId;
    }

    // Validar que el tenant exista
    const tenant = await this.tenantsRepo.findOne({
      where: { id: finalTenantId, deletedAt: IsNull() },
    });

    if (!tenant) {
      throw new NotFoundException('El tenant no se encuentra registrado');
    }

    // Hash de la contraseña con bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear la instancia del usuario
    const user = this.usersRepo.create({
      email,
      passwordHash,
      firstName,
      lastName,
      role: [role as UserRole],
      tenantId: finalTenantId,
      phone,
      active: true,
    });

    // Guardar en la BD
    const savedUser = await this.usersRepo.save(user);

    // Retornar usuario sin passwordHash
    return this.mapUserToResponse(savedUser);
  }

  /**
   * Obtener todos los usuarios (solo para ADMIN y SUPPORT)
   */
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepo.find();
    return users.map(user => this.mapUserToResponse(user));
  }

  /**
   * Buscar usuarios por nombre o apellido
   */
  async searchByName(name: string): Promise<UserResponseDto[]> {
    const term = (name || '').trim();
    if (!term) {
      return [];
    }

    const users = await this.usersRepo.find({
      where: [
        { firstName: ILike(`%${term}%`) },
        { lastName: ILike(`%${term}%`) },
      ],
      order: { firstName: 'ASC', lastName: 'ASC' },
    });

    return users.map((user) => this.mapUserToResponse(user));
  }

  /**
   * Obtener un usuario por ID
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.mapUserToResponse(user);
  }

  /**
   * Obtener usuarios por tenant (multi-tenant)
   * @param tenantId UUID del tenant
   */
  async findByTenant(tenantId: string): Promise<UserResponseDto[]> {
    const users = await this.usersRepo.find({
      where: { tenantId },
    });
    return users.map(user => this.mapUserToResponse(user));
  }

  /**
   * Actualizar usuario (parcial)
   * @param id UUID del usuario
   * @param updateUserDto DTO con campos a actualizar
   * @param userRole Rol del usuario que realiza la actualización
   */
  async update(id: string, updateUserDto: UpdateUserDto, userRole?: UserRole): Promise<UserResponseDto> {
    const user = await this.usersRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Validar email si se intenta cambiar
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepo.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException(`El email ${updateUserDto.email} ya está registrado`);
      }
      user.email = updateUserDto.email;
    }

    // Validar teléfono si se intenta cambiar
    if (updateUserDto.phone !== undefined && updateUserDto.phone !== user.phone) {
      if (updateUserDto.phone) {
        const existingPhone = await this.usersRepo.findOne({
          where: { phone: updateUserDto.phone },
        });
        if (existingPhone) {
          throw new ConflictException(`El teléfono ${updateUserDto.phone} ya está registrado en otro usuario`);
        }
      }
      user.phone = updateUserDto.phone;
    }

    // Validar tenant - solo SUPER_ADMIN puede cambiar
    if (updateUserDto.tenantId && updateUserDto.tenantId !== user.tenantId) {
      if (userRole !== UserRole.SUPER_ADMIN) {
        throw new ConflictException('Solo SUPER_ADMIN puede cambiar el tenant de un usuario');
      }

      // Validar que el nuevo tenant exista
      const newTenant = await this.tenantsRepo.findOne({
        where: { id: updateUserDto.tenantId, deletedAt: IsNull() },
      });

      if (!newTenant) {
        throw new NotFoundException('El tenant no se encuentra registrado');
      }

      user.tenantId = updateUserDto.tenantId;
    }

    // Actualizar campos opcionales
    if (updateUserDto.firstName) user.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName) user.lastName = updateUserDto.lastName;
    if (updateUserDto.role) user.role = [updateUserDto.role];
    if (updateUserDto.active !== undefined) user.active = updateUserDto.active;

    const updatedUser = await this.usersRepo.save(user);
    return this.mapUserToResponse(updatedUser);
  }

  /**
   * Desactivar un usuario (soft delete lógico)
   * @param id UUID del usuario
   */
  async deactivate(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    user.active = false;
    const updatedUser = await this.usersRepo.save(user);
    return this.mapUserToResponse(updatedUser);
  }

  /**
   * Eliminar un usuario (hard delete)
   * @param id UUID del usuario
   */
  async hardDelete(id: string): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.usersRepo.remove(user);
    return { message: `Usuario ${id} eliminado correctamente` };
  }

  /**
   * Mantener compatibilidad: delete() realiza desactivación lógica
   * @param id UUID del usuario
   */
  async delete(id: string): Promise<UserResponseDto> {
    return this.deactivate(id);
  }

  /**
   * Obtener usuario por email (para login)
   * @param email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepo.findOne({
      where: { email },
    });
  }

  /**
   * Validar contraseña
   */
  async validatePassword(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  /**
   * Mapear User a UserResponseDto (sin passwordHash)
   */
  private mapUserToResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: Array.isArray(user.role) && user.role.length > 0 ? user.role[0] : UserRole.VENDOR,
      tenantId: user.tenantId,
      phone: user.phone,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
