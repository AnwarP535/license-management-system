import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import {
  AdminSubscriptionsController,
  AdminCustomerSubscriptionsController,
  CustomerSubscriptionsController,
  SDKSubscriptionsController,
} from './subscriptions.controller';
import { Subscription } from '../entities/subscription.entity';
import { Customer } from '../entities/customer.entity';
import { User } from '../entities/user.entity';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { SubscriptionPacksModule } from '../subscription-packs/subscription-packs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Customer, User]),
    SubscriptionPacksModule,
  ],
  controllers: [
    AdminSubscriptionsController,
    AdminCustomerSubscriptionsController,
    CustomerSubscriptionsController,
    SDKSubscriptionsController,
  ],
  providers: [SubscriptionsService, ApiKeyGuard],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
