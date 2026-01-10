import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubscriptionPackDto {
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
