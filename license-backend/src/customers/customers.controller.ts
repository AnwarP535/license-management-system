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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import {
  CustomerCreateRequestDto,
  CustomerUpdateRequestDto,
  CustomerResponseDto,
} from '../dto/customer.dto';
import { ErrorResponseDto, SuccessResponseDto } from '../dto/common.dto';

@ApiTags('Customer Management', 'Admin')
@Controller('api/v1/admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers' })
  @ApiResponse({ status: 200, type: [CustomerResponseDto] })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
  ) {
    const result = await this.customersService.findAll(page, limit, search);
    return {
      success: true,
      ...result,
    };
  }

  @Get(':customer_id')
  @ApiOperation({ summary: 'Get customer details' })
  @ApiResponse({ status: 200, type: CustomerResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  async findOne(@Param('customer_id', ParseIntPipe) id: number) {
    const customer = await this.customersService.findOne(id);
    return {
      success: true,
      customer,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create customer' })
  @ApiResponse({ status: 201, type: CustomerResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  async create(@Body() createDto: CustomerCreateRequestDto) {
    const customer = await this.customersService.create(createDto);
    return {
      success: true,
      customer,
    };
  }

  @Put(':customer_id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: 200, type: CustomerResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  async update(
    @Param('customer_id', ParseIntPipe) id: number,
    @Body() updateDto: CustomerUpdateRequestDto,
  ) {
    const customer = await this.customersService.update(id, updateDto);
    return {
      success: true,
      customer,
    };
  }

  @Delete(':customer_id')
  @ApiOperation({ summary: 'Soft delete customer' })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  async remove(@Param('customer_id', ParseIntPipe) id: number) {
    await this.customersService.remove(id);
    return {
      success: true,
      message: 'Customer deleted successfully',
    };
  }
}
