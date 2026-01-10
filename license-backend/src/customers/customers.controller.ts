import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Customer Management')
@Controller('api/v1/admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
  ) {
    const result = await this.customersService.findAll(page, limit, search);
    return { success: true, ...result };
  }

  @Post()
  @ApiOperation({ summary: 'Create customer' })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customersService.create(createCustomerDto);
    return { success: true, customer };
  }

  @Get(':customer_id')
  @ApiOperation({ summary: 'Get customer details' })
  async findOne(@Param('customer_id', ParseIntPipe) id: number) {
    const customer = await this.customersService.findOne(id);
    return { success: true, customer };
  }

  @Put(':customer_id')
  @ApiOperation({ summary: 'Update customer' })
  async update(
    @Param('customer_id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const customer = await this.customersService.update(id, updateCustomerDto);
    return { success: true, customer };
  }

  @Delete(':customer_id')
  @ApiOperation({ summary: 'Soft delete customer' })
  async remove(@Param('customer_id', ParseIntPipe) id: number) {
    return await this.customersService.remove(id);
  }
}
