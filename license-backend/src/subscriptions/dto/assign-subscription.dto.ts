import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignSubscriptionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  pack_id: number;
}
