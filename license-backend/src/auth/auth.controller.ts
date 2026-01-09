import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AdminLoginRequestDto,
  CustomerLoginRequestDto,
  CustomerSignupRequestDto,
  AdminLoginResponseDto,
  CustomerLoginResponseDto,
  CustomerSignupResponseDto,
  SDKAuthRequestDto,
  SDKAuthResponseDto,
  SignupRequestDto,
  SignupResponseDto,
} from '../dto/auth.dto';
import { ErrorResponseDto } from '../dto/common.dto';

@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('api/admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, type: AdminLoginResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async adminLogin(@Body() loginDto: AdminLoginRequestDto) {
    return this.authService.adminLogin(loginDto);
  }

  @Post('api/customer/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer login' })
  @ApiResponse({ status: 200, type: CustomerLoginResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async customerLogin(@Body() loginDto: CustomerLoginRequestDto) {
    return this.authService.customerLogin(loginDto);
  }

  @Post('api/customer/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Customer signup' })
  @ApiResponse({ status: 201, type: CustomerSignupResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  async customerSignup(@Body() signupDto: CustomerSignupRequestDto) {
    return this.authService.customerSignup(signupDto);
  }

  @Post('api/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Unified user signup (admin or customer)' })
  @ApiResponse({ status: 201, type: SignupResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  async signup(@Body() signupDto: SignupRequestDto) {
    return this.authService.signup(signupDto);
  }

  @Post('sdk/auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SDK authentication' })
  @ApiResponse({ status: 200, type: SDKAuthResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async sdkAuth(@Body() authDto: SDKAuthRequestDto) {
    return this.authService.sdkAuth(authDto);
  }
}
