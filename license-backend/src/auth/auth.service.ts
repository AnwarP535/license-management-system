import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { Customer } from '../entities/customer.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerSignupDto } from './dto/customer-signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserById(id: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async validateApiKey(apiKey: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { api_key: apiKey } });
    if (user) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async adminLogin(loginDto: AdminLoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user || user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.generateRefreshToken();
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days

    await this.userRepository.update(user.id, {
      refresh_token: refreshToken,
      refresh_token_expires_at: refreshTokenExpires,
    });

    return {
      success: true,
      token: accessToken,
      refresh_token: refreshToken,
      email: user.email,
      expires_in: 3600,
    };
  }

  async customerLogin(loginDto: CustomerLoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user || user.role !== UserRole.CUSTOMER) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const customer = await this.customerRepository.findOne({
      where: { user_id: user.id },
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.generateRefreshToken();
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days

    await this.userRepository.update(user.id, {
      refresh_token: refreshToken,
      refresh_token_expires_at: refreshTokenExpires,
    });

    return {
      success: true,
      token: accessToken,
      refresh_token: refreshToken,
      name: customer?.name || '',
      phone: customer?.phone || '',
      expires_in: 3600,
    };
  }

  async customerSignup(signupDto: CustomerSignupDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const user = this.userRepository.create({
      email: signupDto.email,
      password_hash: hashedPassword,
      role: UserRole.CUSTOMER,
    });

    const savedUser = await this.userRepository.save(user);

    const customer = this.customerRepository.create({
      user_id: savedUser.id,
      name: signupDto.name,
      phone: signupDto.phone,
    });

    await this.customerRepository.save(customer);

    const payload = { email: savedUser.email, sub: savedUser.id, role: savedUser.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.generateRefreshToken();
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days

    await this.userRepository.update(savedUser.id, {
      refresh_token: refreshToken,
      refresh_token_expires_at: refreshTokenExpires,
    });

    return {
      success: true,
      message: 'Account created successfully',
      token: accessToken,
      refresh_token: refreshToken,
      name: signupDto.name,
      phone: signupDto.phone,
      expires_in: 3600,
    };
  }

  async sdkLogin(loginDto: CustomerLoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user || user.role !== UserRole.CUSTOMER) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate or retrieve API key
    if (!user.api_key) {
      const apiKey = this.generateApiKey();
      await this.userRepository.update(user.id, { api_key: apiKey });
      user.api_key = apiKey;
    }

    const customer = await this.customerRepository.findOne({
      where: { user_id: user.id },
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      success: true,
      api_key: user.api_key,
      token: this.jwtService.sign(payload),
      name: customer?.name || '',
      phone: customer?.phone || '',
      expires_in: 3600,
    };
  }

  async refreshToken(refreshToken: string) {
    const user = await this.userRepository.findOne({
      where: { refresh_token: refreshToken },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!user.refresh_token_expires_at || user.refresh_token_expires_at < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    return {
      success: true,
      token: accessToken,
      expires_in: 3600,
    };
  }

  private generateApiKey(): string {
    const prefix = 'sk-sdk-';
    const randomBytes = require('crypto').randomBytes(16).toString('hex');
    return prefix + randomBytes;
  }

  private generateRefreshToken(): string {
    const randomBytes = require('crypto').randomBytes(32).toString('hex');
    return randomBytes;
  }
}
