import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCustomerDto {
  @ApiProperty({ example: 'Jane Smith Updated', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '+1987654321', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}
