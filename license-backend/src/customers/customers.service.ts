import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import {
  CustomerCreateRequestDto,
  CustomerUpdateRequestDto,
  CustomerResponseDto,
} from '../dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ customers: CustomerResponseDto[]; pagination: any }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [customers, total] = await this.customerRepository.findAndCount({
      where,
      relations: ['user'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      withDeleted: false,
    });

    const customerDtos = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.user.email,
      phone: customer.phone,
      created_at: customer.createdAt,
      updated_at: customer.updatedAt,
    }));

    return {
      customers: customerDtos,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: number): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['user'],
      withDeleted: false,
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.user.email,
      phone: customer.phone,
      created_at: customer.createdAt,
      updated_at: customer.updatedAt,
    };
  }

  async create(
    createDto: CustomerCreateRequestDto,
  ): Promise<CustomerResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash('defaultPassword123', 10);
    const user = this.userRepository.create({
      email: createDto.email,
      passwordHash,
      role: UserRole.CUSTOMER,
    });

    const savedUser = await this.userRepository.save(user);

    const customer = this.customerRepository.create({
      userId: savedUser.id,
      name: createDto.name,
      phone: createDto.phone,
    });

    const savedCustomer = await this.customerRepository.save(customer);

    return {
      id: savedCustomer.id,
      name: savedCustomer.name,
      email: savedUser.email,
      phone: savedCustomer.phone,
      created_at: savedCustomer.createdAt,
      updated_at: savedCustomer.updatedAt,
    };
  }

  async update(
    id: number,
    updateDto: CustomerUpdateRequestDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['user'],
      withDeleted: false,
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (updateDto.name) {
      customer.name = updateDto.name;
    }
    if (updateDto.phone) {
      customer.phone = updateDto.phone;
    }

    const updatedCustomer = await this.customerRepository.save(customer);

    return {
      id: updatedCustomer.id,
      name: updatedCustomer.name,
      email: customer.user.email,
      phone: updatedCustomer.phone,
      created_at: updatedCustomer.createdAt,
      updated_at: updatedCustomer.updatedAt,
    };
  }

  async remove(id: number): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.customerRepository.softDelete(id);
  }
}
