import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionPackDto {
  @ApiProperty({ example: 'Premium Plan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Full access to all features' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'premium-plan' })
  @IsString()
  @IsNotEmpty()
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
