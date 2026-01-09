import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Customer } from '../entities/customer.entity';
import { Subscription } from '../entities/subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Subscription])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
