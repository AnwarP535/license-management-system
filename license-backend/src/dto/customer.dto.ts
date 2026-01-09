import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CustomerCreateRequestDto {
  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1987654321' })
  @IsString()
  phone: string;
}

export class CustomerUpdateRequestDto {
  @ApiProperty({ example: 'Jane Smith Updated', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '+1987654321', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class CustomerResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Jane Smith' })
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiProperty({ example: '+1987654321' })
  phone: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
