import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionRequestDto } from './dto/subscription-request.dto';
import { AssignSubscriptionDto } from './dto/assign-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';

@ApiTags('Subscription Management')
@Controller('api/v1/admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminSubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all subscriptions' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('status') status?: string,
  ) {
    const result = await this.subscriptionsService.findAll(
      page,
      limit,
      status as any,
    );
    return { success: true, ...result };
  }

  @Post(':subscription_id/approve')
  @ApiOperation({ summary: 'Approve subscription request' })
  async approve(@Param('subscription_id', ParseIntPipe) id: number) {
    await this.subscriptionsService.approveSubscription(id);
    return { success: true, message: 'Subscription approved successfully' };
  }
}

@ApiTags('Subscription Management')
@Controller('api/v1/admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminCustomerSubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post(':customer_id/assign-subscription')
  @ApiOperation({ summary: 'Assign subscription to customer' })
  async assign(
    @Param('customer_id', ParseIntPipe) customerId: number,
    @Body() assignDto: AssignSubscriptionDto,
  ) {
    await this.subscriptionsService.assignSubscription(customerId, assignDto);
    return { success: true, message: 'Subscription assigned successfully' };
  }

  @Delete(':customer_id/subscription/:subscription_id')
  @ApiOperation({ summary: 'Unassign subscription' })
  async unassign(
    @Param('customer_id', ParseIntPipe) customerId: number,
    @Param('subscription_id', ParseIntPipe) subscriptionId: number,
  ) {
    return await this.subscriptionsService.unassignSubscription(
      customerId,
      subscriptionId,
    );
  }
}

@ApiTags('Customer Self-Service')
@Controller('api/v1/customer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@ApiBearerAuth()
export class CustomerSubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  @Get('subscription')
  @ApiOperation({ summary: "Get customer's current subscription" })
  async getCurrent(@CurrentUser() user: any) {
    const customer = await this.customerRepository.findOne({
      where: { user_id: user.id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    const subscription = await this.subscriptionsService.getCurrentSubscription(
      customer.id,
    );
    return { success: true, subscription };
  }

  @Post('subscription')
  @ApiOperation({ summary: 'Request new subscription' })
  async request(
    @CurrentUser() user: any,
    @Body() requestDto: SubscriptionRequestDto,
  ) {
    const customer = await this.customerRepository.findOne({
      where: { user_id: user.id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    const subscription = await this.subscriptionsService.requestSubscription(
      customer.id,
      requestDto,
    );
    return {
      success: true,
      message: 'Subscription request submitted successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        requested_at: subscription.requested_at,
      },
    };
  }

  @Delete('subscription')
  @ApiOperation({ summary: 'Deactivate current subscription' })
  async deactivate(@CurrentUser() user: any) {
    const customer = await this.customerRepository.findOne({
      where: { user_id: user.id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return await this.subscriptionsService.deactivateSubscription(customer.id);
  }

  @Get('subscription-history')
  @ApiOperation({ summary: 'Get subscription history' })
  async getHistory(
    @CurrentUser() user: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
  ) {
    const customer = await this.customerRepository.findOne({
      where: { user_id: user.id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    const result = await this.subscriptionsService.getSubscriptionHistory(
      customer.id,
      page,
      limit,
      sort,
    );
    return { success: true, ...result };
  }
}

@ApiTags('SDK Subscription')
@Controller('sdk/v1')
@UseGuards(ApiKeyGuard)
export class SDKSubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  @Get('subscription')
  @ApiOperation({ summary: 'Get current subscription (SDK)' })
  async getCurrent(@CurrentUser() user: any) {
    const customer = await this.customerRepository.findOne({
      where: { user_id: user.id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    const subscription = await this.subscriptionsService.getCurrentSubscription(
      customer.id,
    );
    return { success: true, subscription };
  }

  @Post('subscription')
  @ApiOperation({ summary: 'Request new subscription (SDK)' })
  async request(
    @CurrentUser() user: any,
    @Body() requestDto: { pack_sku: string },
  ) {
    const customer = await this.customerRepository.findOne({
      where: { user_id: user.id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    const subscription = await this.subscriptionsService.requestSubscription(
      customer.id,
      { sku: requestDto.pack_sku },
    );
    return {
      success: true,
      message: 'Subscription request submitted successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        requested_at: subscription.requested_at,
      },
    };
  }

  @Delete('subscription')
  @ApiOperation({ summary: 'Deactivate current subscription (SDK)' })
  async deactivate(@CurrentUser() user: any) {
    const customer = await this.customerRepository.findOne({
      where: { user_id: user.id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return await this.subscriptionsService.deactivateSubscription(customer.id);
  }

  @Get('subscription-history')
  @ApiOperation({ summary: 'Get subscription history (SDK)' })
  async getHistory(
    @CurrentUser() user: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
  ) {
    const customer = await this.customerRepository.findOne({
      where: { user_id: user.id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    const result = await this.subscriptionsService.getSubscriptionHistory(
      customer.id,
      page,
      limit,
      sort,
    );
    return { success: true, ...result };
  }
}
