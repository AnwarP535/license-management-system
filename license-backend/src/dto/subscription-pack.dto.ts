import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class SubscriptionPackCreateRequestDto {
  @ApiProperty({ example: 'Premium Plan' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Full access to all features' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'premium-plan' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 12, minimum: 1, maximum: 12 })
  @IsNumber()
  @Min(1)
  @Max(12)
  validity_months: number;
}

export class SubscriptionPackUpdateRequestDto {
  @ApiProperty({ example: 'Premium Plan', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Full access to all features', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'premium-plan', required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: 29.99, required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 12, minimum: 1, maximum: 12, required: false })
  @IsNumber()
  @Min(1)
  @Max(12)
  @IsOptional()
  validity_months?: number;
}

export class SubscriptionPackResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Premium Plan' })
  name: string;

  @ApiProperty({ example: 'Full access to all features' })
  description: string;

  @ApiProperty({ example: 'premium-plan' })
  sku: string;

  @ApiProperty({ example: 29.99 })
  price: number;

  @ApiProperty({ example: 12 })
  validity_months: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
