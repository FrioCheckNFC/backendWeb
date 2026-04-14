import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  /**
   * Crear un nuevo usuario
   * @param createUserDto DTO con datos del usuario
   * @returns Usuario creado (sin passwordHash)
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, firstName, lastName, role, tenantId, phone } = createUserDto;

    // Validar que el email no exista
    const existingUser = await this.usersRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException(`El email ${email} ya está registrado`);
    }

    // Hash de la contraseña con bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear la instancia del usuario
    const user = this.usersRepo.create({
      email,
      passwordHash,
      firstName,
      lastName,
      role: role as UserRole,
      tenantId,
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
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
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

    // Actualizar campos opcionales
    if (updateUserDto.firstName) user.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName) user.lastName = updateUserDto.lastName;
    if (updateUserDto.role) user.role = updateUserDto.role;
    if (updateUserDto.phone !== undefined) user.phone = updateUserDto.phone;
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
  async delete(id: string): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.usersRepo.remove(user);
    return { message: `Usuario ${id} eliminado correctamente` };
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
      role: user.role,
      tenantId: user.tenantId,
      phone: user.phone,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
