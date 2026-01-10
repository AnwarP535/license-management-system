import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { SubscriptionPack } from '../entities/subscription-pack.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPack)
    private packRepository: Repository<SubscriptionPack>,
  ) {}

  async getDashboardData() {
    const totalCustomers = await this.customerRepository.count();
    
    const activeSubscriptions = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });

    const pendingRequests = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.REQUESTED },
    });

    // Calculate total revenue from all active subscriptions
    // Revenue is calculated from subscriptions that are currently active
    const activeSubs = await this.subscriptionRepository.find({
      where: { 
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['pack'],
    });

    let totalRevenue = 0;
    for (const sub of activeSubs) {
      if (sub.pack && sub.pack.price) {
        const price = typeof sub.pack.price === 'string' 
          ? parseFloat(sub.pack.price) 
          : Number(sub.pack.price);
        if (!isNaN(price)) {
          totalRevenue += price;
        }
      }
    }

    // Get recent activities
    const recentSubscriptions = await this.subscriptionRepository.find({
      relations: ['customer', 'pack'],
      order: { updated_at: 'DESC' },
      take: 10,
    });

    const recentActivities = recentSubscriptions.map((sub) => ({
      type: this.getActivityType(sub.status),
      customer: sub.customer?.name || 'Unknown',
      pack: sub.pack?.name || 'Unknown',
      timestamp: sub.updated_at,
    }));

    return {
      total_customers: totalCustomers,
      active_subscriptions: activeSubscriptions,
      pending_requests: pendingRequests,
      total_revenue: totalRevenue,
      recent_activities: recentActivities,
    };
  }

  private getActivityType(status: SubscriptionStatus): string {
    switch (status) {
      case SubscriptionStatus.REQUESTED:
        return 'subscription_requested';
      case SubscriptionStatus.APPROVED:
        return 'subscription_approved';
      case SubscriptionStatus.ACTIVE:
        return 'subscription_activated';
      case SubscriptionStatus.INACTIVE:
        return 'subscription_deactivated';
      case SubscriptionStatus.EXPIRED:
        return 'subscription_expired';
      default:
        return 'subscription_updated';
    }
  }
}
