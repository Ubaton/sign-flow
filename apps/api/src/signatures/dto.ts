import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { InputType, SignatureStatus } from '../entities/signature.entity.js';

class GeoLocationDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;
}

class DeviceDataDto {
  @IsString()
  userAgent!: string;

  @IsIn(['touch', 'pen', 'mouse'])
  inputType!: InputType;

  @IsBoolean()
  pressureSupported!: boolean;
}

export class CreateSignatureDto {
  @IsString()
  signature!: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GeoLocationDto)
  location?: GeoLocationDto | null;

  @ValidateNested()
  @Type(() => DeviceDataDto)
  deviceData!: DeviceDataDto;

  @IsString()
  siteUrl!: string;

  @IsString()
  pageName!: string;

  @IsOptional()
  @IsIn([SignatureStatus.PENDING, SignatureStatus.COMPLETED, SignatureStatus.FAILED])
  status?: SignatureStatus | null;

  @IsOptional()
  @IsString()
  statusTimeStamp?: string;

  @IsString()
  createdBy!: string;
}
