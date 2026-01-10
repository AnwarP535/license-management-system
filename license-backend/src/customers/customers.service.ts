import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createCustomerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Create user account
    const hashedPassword = await bcrypt.hash('defaultPassword123', 10);
    const user = this.userRepository.create({
      email: createCustomerDto.email,
      password_hash: hashedPassword,
      role: UserRole.CUSTOMER,
    });
    const savedUser = await this.userRepository.save(user);

    // Create customer profile
    const customer = this.customerRepository.create({
      user_id: savedUser.id,
      name: createCustomerDto.name,
      phone: createCustomerDto.phone,
    });

    return await this.customerRepository.save(customer);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [customers, total] = await this.customerRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    return {
      customers: customers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.user?.email,
        phone: c.phone,
        created_at: c.created_at,
        updated_at: c.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: number) {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.user?.email,
      phone: customer.phone,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    };
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customerRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async remove(id: number) {
    const customer = await this.customerRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.customerRepository.softDelete(id);
    return { success: true, message: 'Customer deleted successfully' };
  }
}
