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
import { SubscriptionPacksModule } from '../subscription-packs/subscription-packs.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Customer]),
    SubscriptionPacksModule,
    AuthModule,
  ],
  controllers: [
    AdminSubscriptionsController,
    AdminCustomerSubscriptionsController,
    CustomerSubscriptionsController,
    SDKSubscriptionsController,
  ],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
