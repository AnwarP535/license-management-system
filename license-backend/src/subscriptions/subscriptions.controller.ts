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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SubscriptionStatus } from '../entities/subscription.entity';
import { UserRole } from '../entities/user.entity';
import {
  SubscriptionRequestDto,
  AssignSubscriptionRequestDto,
  CustomerSubscriptionResponseDto,
  SubscriptionCreateResponseDto,
  DeactivateResponseDto,
  SubscriptionHistoryResponseDto,
} from '../dto/subscription.dto';
import { ErrorResponseDto, SuccessResponseDto } from '../dto/common.dto';

@ApiTags('Subscription Management', 'Admin')
@Controller('api/v1/admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminSubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all subscriptions' })
  @ApiResponse({ status: 200 })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('status') status?: SubscriptionStatus,
  ) {
    const result = await this.subscriptionsService.findAll(page, limit, status);
    return {
      success: true,
      ...result,
    };
  }

  @Post(':subscription_id/approve')
  @ApiOperation({ summary: 'Approve subscription request' })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  async approve(@Param('subscription_id', ParseIntPipe) id: number) {
    await this.subscriptionsService.approveSubscription(id);
    return {
      success: true,
      message: 'Subscription approved successfully',
    };
  }
}

@ApiTags('Subscription Management', 'Admin')
@Controller('api/v1/admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminCustomerSubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post(':customer_id/assign-subscription')
  @ApiOperation({ summary: 'Assign subscription to customer' })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  async assign(
    @Param('customer_id', ParseIntPipe) customerId: number,
    @Body() assignDto: AssignSubscriptionRequestDto,
  ) {
    await this.subscriptionsService.assignSubscription(customerId, assignDto);
    return {
      success: true,
      message: 'Subscription assigned successfully',
    };
  }

  @Delete(':customer_id/subscription/:subscription_id')
  @ApiOperation({ summary: 'Unassign subscription' })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  async unassign(
    @Param('customer_id', ParseIntPipe) customerId: number,
    @Param('subscription_id', ParseIntPipe) subscriptionId: number,
  ) {
    await this.subscriptionsService.unassignSubscription(customerId, subscriptionId);
    return {
      success: true,
      message: 'Subscription unassigned successfully',
    };
  }
}

@ApiTags('Customer Self-Service', 'Subscription')
@Controller('api/v1/customer')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomerSubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('subscription')
  @ApiOperation({ summary: "Get customer's current subscription" })
  @ApiResponse({ status: 200, type: CustomerSubscriptionResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  async getCurrent(@CurrentUser() user: any) {
    return this.subscriptionsService.getCustomerSubscription(user.userId);
  }

  @Post('subscription')
  @ApiOperation({ summary: 'Request new subscription' })
  @ApiResponse({ status: 201, type: SubscriptionCreateResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  async request(
    @CurrentUser() user: any,
    @Body() requestDto: SubscriptionRequestDto,
  ) {
    return this.subscriptionsService.requestSubscription(user.userId, requestDto);
  }

  @Delete('subscription')
  @ApiOperation({ summary: 'Deactivate current subscription' })
  @ApiResponse({ status: 200, type: DeactivateResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  async deactivate(@CurrentUser() user: any) {
    return this.subscriptionsService.deactivateSubscription(user.userId);
  }

  @Get('subscription-history')
  @ApiOperation({ summary: 'Get subscription history' })
  @ApiResponse({ status: 200, type: SubscriptionHistoryResponseDto })
  async getHistory(
    @CurrentUser() user: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
  ) {
    return this.subscriptionsService.getSubscriptionHistory(
      user.userId,
      page,
      limit,
      sort,
    );
  }
}

@ApiTags('SDK Subscription', 'SDK')
@Controller('sdk/v1')
@UseGuards(ApiKeyGuard)
export class SDKSubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('subscription')
  @ApiOperation({ summary: 'Get current subscription (SDK)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  async getCurrent(@CurrentUser() user: any) {
    return this.subscriptionsService.getCustomerSubscription(user.userId);
  }

  @Post('subscription')
  @ApiOperation({ summary: 'Request new subscription (SDK)' })
  @ApiResponse({ status: 201, type: SubscriptionCreateResponseDto })
  async request(
    @CurrentUser() user: any,
    @Body() requestDto: { pack_sku: string },
  ) {
    return this.subscriptionsService.requestSubscription(user.userId, {
      sku: requestDto.pack_sku,
    });
  }

  @Delete('subscription')
  @ApiOperation({ summary: 'Deactivate current subscription (SDK)' })
  @ApiResponse({ status: 200, type: DeactivateResponseDto })
  async deactivate(@CurrentUser() user: any) {
    return this.subscriptionsService.deactivateSubscription(user.userId);
  }

  @Get('subscription-history')
  @ApiOperation({ summary: 'Get subscription history (SDK)' })
  @ApiResponse({ status: 200, type: SubscriptionHistoryResponseDto })
  async getHistory(
    @CurrentUser() user: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
  ) {
    return this.subscriptionsService.getSubscriptionHistory(
      user.userId,
      page,
      limit,
      sort,
    );
  }
}
