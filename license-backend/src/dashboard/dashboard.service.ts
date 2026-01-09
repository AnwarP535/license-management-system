import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { DashboardResponseDto } from '../dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async getDashboardData(): Promise<DashboardResponseDto> {
    const totalCustomers = await this.customerRepository.count({
      withDeleted: false,
    });

    const activeSubscriptions = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });

    const pendingRequests = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.REQUESTED },
    });

    const activeSubs = await this.subscriptionRepository.find({
      where: { status: SubscriptionStatus.ACTIVE },
      relations: ['pack'],
    });

    const totalRevenue = activeSubs.reduce((sum, sub) => {
      return sum + parseFloat(sub.pack.price.toString());
    }, 0);

    const recentSubscriptions = await this.subscriptionRepository.find({
      relations: ['customer', 'pack'],
      order: { updatedAt: 'DESC' },
      take: 10,
    });

    const recentActivities = recentSubscriptions.map((sub) => ({
      type: `${sub.status}_subscription`,
      customer: sub.customer.name,
      pack: sub.pack.name,
      timestamp: sub.updatedAt,
    }));

    return {
      success: true,
      data: {
        total_customers: totalCustomers,
        active_subscriptions: activeSubscriptions,
        pending_requests: pendingRequests,
        total_revenue: totalRevenue,
        recent_activities: recentActivities,
      },
    };
  }
}
