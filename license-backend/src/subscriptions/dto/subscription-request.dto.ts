import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionRequestDto {
  @ApiProperty({ example: 'premium-plan' })
  @IsString()
  @IsNotEmpty()
  sku: string;
}
