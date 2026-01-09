import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { Customer } from '../entities/customer.entity';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private jwtService: JwtService,
  ) {}

  async adminLogin(
    loginDto: AdminLoginRequestDto,
  ): Promise<AdminLoginResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email, role: UserRole.ADMIN },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      token,
      email: user.email,
      expires_in: 3600,
    };
  }

  async customerLogin(
    loginDto: CustomerLoginRequestDto,
  ): Promise<CustomerLoginResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email, role: UserRole.CUSTOMER },
      relations: ['customer'],
    });

    if (!user || !user.customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      token,
      name: user.customer.name,
      phone: user.customer.phone,
      expires_in: 3600,
    };
  }

  async customerSignup(
    signupDto: CustomerSignupRequestDto,
  ): Promise<CustomerSignupResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(signupDto.password, 10);

    const user = this.userRepository.create({
      email: signupDto.email,
      passwordHash,
      role: UserRole.CUSTOMER,
    });

    const savedUser = await this.userRepository.save(user);

    const customer = this.customerRepository.create({
      userId: savedUser.id,
      name: signupDto.name,
      phone: signupDto.phone,
    });

    await this.customerRepository.save(customer);

    const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Account created successfully',
      token,
      name: signupDto.name,
      phone: signupDto.phone,
      expires_in: 3600,
    };
  }

  async signup(signupDto: SignupRequestDto): Promise<SignupResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(signupDto.password, 10);

    const user = this.userRepository.create({
      email: signupDto.email,
      passwordHash,
      role: signupDto.role,
    });

    const savedUser = await this.userRepository.save(user);

    // Only create customer entity if role is CUSTOMER
    if (signupDto.role === UserRole.CUSTOMER) {
      if (!signupDto.name || !signupDto.phone) {
        throw new BadRequestException('Name and phone are required for customer registration');
      }

      const customer = this.customerRepository.create({
        userId: savedUser.id,
        name: signupDto.name,
        phone: signupDto.phone,
      });

      await this.customerRepository.save(customer);
    }

    const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Account created successfully',
      token,
      email: savedUser.email,
      role: savedUser.role,
      name: signupDto.name,
      phone: signupDto.phone,
      expires_in: 3600,
    };
  }

  async sdkAuth(authDto: SDKAuthRequestDto): Promise<SDKAuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: authDto.email, role: UserRole.CUSTOMER },
      relations: ['customer'],
    });

    if (!user || !user.customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      authDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate or reuse API key
    let apiKey = user.apiKey;
    if (!apiKey) {
      apiKey = `sk-sdk-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      user.apiKey = apiKey;
      await this.userRepository.save(user);
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      api_key: apiKey,
      token,
      name: user.customer.name,
      phone: user.customer.phone,
      expires_in: 3600,
    };
  }

  async validateUser(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['customer'],
    });
  }
}
