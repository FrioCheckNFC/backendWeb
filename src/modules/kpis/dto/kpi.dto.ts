// filepath: src/modules/kpis/dto/kpi.dto.ts
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsObject,
} from 'class-validator';
import { KpiType, KpiCategory, KpiCalculationType, KpiFrequency } from '../entities/kpi.entity';

export class CreateKpiDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(KpiType)
  type?: KpiType;

  @IsOptional()
  @IsEnum(KpiCategory)
  category?: KpiCategory;

  @IsNumber()
  targetValue: number;

  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(KpiCalculationType)
  calculationType?: KpiCalculationType;

  @IsOptional()
  @IsString()
  formula?: string;

  @IsOptional()
  @IsEnum(KpiFrequency)
  frequency?: KpiFrequency;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsObject()
  dataConfig?: Record<string, any>;

  @IsOptional()
  @IsString()
  sectorId?: string;
}

export class UpdateKpiDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(KpiType)
  type?: KpiType;

  @IsOptional()
  @IsEnum(KpiCategory)
  category?: KpiCategory;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(KpiCalculationType)
  calculationType?: KpiCalculationType;

  @IsOptional()
  @IsString()
  formula?: string;

  @IsOptional()
  @IsEnum(KpiFrequency)
  frequency?: KpiFrequency;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsObject()
  dataConfig?: Record<string, any>;
}

export class KpiResponseDto {
  id: string;
  tenantId: string;
  userId?: string;
  sectorId?: string;
  type: KpiType;
  name: string;
  description?: string;
  category: KpiCategory;
  targetValue: number;
  currentValue: number;
  startDate: Date;
  endDate: Date;
  calculationType: KpiCalculationType;
  formula?: string;
  frequency: KpiFrequency;
  isGlobal: boolean;
  dataConfig?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class KpiFilterDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsString()
  sectorId?: string;

  @IsOptional()
  @IsNumber()
  skip?: number;

  @IsOptional()
  @IsNumber()
  take?: number;
}