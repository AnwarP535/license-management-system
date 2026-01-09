import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class AdminLoginRequestDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin_password' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class CustomerLoginRequestDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'customer_password' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class CustomerSignupRequestDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'customer_password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phone: string;
}

export class SignupRequestDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'user_password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ 
    example: 'customer', 
    enum: UserRole,
    description: 'User role: admin or customer'
  })
  @IsEnum(UserRole)
  role: UserRole;
}

export class AdminLoginResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'jwt_token_here' })
  token: string;

  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  @ApiProperty({ example: 3600 })
  expires_in: number;
}

export class CustomerLoginResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'jwt_token_here' })
  token: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '+1234567890' })
  phone: string;

  @ApiProperty({ example: 3600 })
  expires_in: number;
}

export class CustomerSignupResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Account created successfully' })
  message: string;

  @ApiProperty({ example: 'jwt_token_here' })
  token: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '+1234567890' })
  phone: string;

  @ApiProperty({ example: 3600 })
  expires_in: number;
}

export class SignupResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Account created successfully' })
  message: string;

  @ApiProperty({ example: 'jwt_token_here' })
  token: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'admin', enum: UserRole })
  role: UserRole;

  @ApiProperty({ example: 'John Doe', required: false })
  name?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  phone?: string;

  @ApiProperty({ example: 3600 })
  expires_in: number;
}

export class SDKAuthRequestDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'customer_password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'sk-sdk-123456789', description: 'SDK API key for authentication' })
  @IsString()
  api_key: string;
}

export class SDKAuthResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'sk-sdk-1234567890abcdef' })
  api_key: string;

  @ApiProperty({ example: 'jwt_token_here', required: false })
  token?: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '+1234567890' })
  phone: string;

  @ApiProperty({ example: 3600 })
  expires_in: number;
}
