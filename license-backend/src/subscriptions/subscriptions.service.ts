import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { Customer } from '../entities/customer.entity';
import { SubscriptionPack } from '../entities/subscription-pack.entity';
import { SubscriptionPacksService } from '../subscription-packs/subscription-packs.service';
import { SubscriptionRequestDto } from './dto/subscription-request.dto';
import { AssignSubscriptionDto } from './dto/assign-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private packsService: SubscriptionPacksService,
  ) {}

  async requestSubscription(customerId: number, requestDto: SubscriptionRequestDto) {
    // Check for active subscription
    const activeSubscription = await this.subscriptionRepository.findOne({
      where: {
        customer_id: customerId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (activeSubscription) {
      throw new BadRequestException('Customer already has an active subscription');
    }

    // Find pack by SKU
    const pack = await this.packsService.findBySku(requestDto.sku);

    // Create subscription request
    const subscription = this.subscriptionRepository.create({
      customer_id: customerId,
      pack_id: pack.id,
      status: SubscriptionStatus.REQUESTED,
    });

    return await this.subscriptionRepository.save(subscription);
  }

  async approveSubscription(subscriptionId: number) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: ['pack'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== SubscriptionStatus.REQUESTED) {
      throw new BadRequestException('Subscription is not in requested status');
    }

    // Check if customer has an active subscription
    const activeSubscription = await this.subscriptionRepository.findOne({
      where: {
        customer_id: subscription.customer_id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (activeSubscription) {
      // Deactivate current subscription
      activeSubscription.status = SubscriptionStatus.INACTIVE;
      activeSubscription.deactivated_at = new Date();
      await this.subscriptionRepository.save(activeSubscription);
    }

    // Auto-activate the approved subscription
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + subscription.pack.validity_months);

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.approved_at = new Date();
    subscription.assigned_at = new Date();
    subscription.expires_at = expiresAt;
    
    return await this.subscriptionRepository.save(subscription);
  }

  async assignSubscription(customerId: number, assignDto: AssignSubscriptionDto) {
    // Check for active subscription
    const activeSubscription = await this.subscriptionRepository.findOne({
      where: {
        customer_id: customerId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (activeSubscription) {
      // Deactivate current subscription
      activeSubscription.status = SubscriptionStatus.INACTIVE;
      activeSubscription.deactivated_at = new Date();
      await this.subscriptionRepository.save(activeSubscription);
    }

    // Check if there's an approved subscription waiting
    const approvedSubscription = await this.subscriptionRepository.findOne({
      where: {
        customer_id: customerId,
        status: SubscriptionStatus.APPROVED,
      },
      relations: ['pack'],
    });

    if (approvedSubscription && approvedSubscription.pack_id === assignDto.pack_id) {
      // Activate the approved subscription
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + approvedSubscription.pack.validity_months);

      approvedSubscription.status = SubscriptionStatus.ACTIVE;
      approvedSubscription.assigned_at = new Date();
      approvedSubscription.expires_at = expiresAt;
      return await this.subscriptionRepository.save(approvedSubscription);
    }

    // Create new subscription directly
    const pack = await this.packsService.findOne(assignDto.pack_id);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + pack.validity_months);

    const subscription = this.subscriptionRepository.create({
      customer_id: customerId,
      pack_id: assignDto.pack_id,
      status: SubscriptionStatus.ACTIVE,
      assigned_at: new Date(),
      expires_at: expiresAt,
      approved_at: new Date(),
    });

    return await this.subscriptionRepository.save(subscription);
  }

  async unassignSubscription(customerId: number, subscriptionId: number) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, customer_id: customerId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === SubscriptionStatus.ACTIVE) {
      subscription.status = SubscriptionStatus.INACTIVE;
      subscription.deactivated_at = new Date();
      await this.subscriptionRepository.save(subscription);
    }

    return { success: true, message: 'Subscription unassigned successfully' };
  }

  async deactivateSubscription(customerId: number) {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        customer_id: customerId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    subscription.status = SubscriptionStatus.INACTIVE;
    subscription.deactivated_at = new Date();
    await this.subscriptionRepository.save(subscription);

    return {
      success: true,
      message: 'Subscription deactivated successfully',
      deactivated_at: subscription.deactivated_at,
    };
  }

  async getCurrentSubscription(customerId: number) {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        customer_id: customerId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['pack'],
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    const now = new Date();
    const is_valid = subscription.expires_at && subscription.expires_at > now;

    return {
      id: subscription.id,
      pack: {
        name: subscription.pack.name,
        sku: subscription.pack.sku,
        price: parseFloat(subscription.pack.price.toString()),
        validity_months: subscription.pack.validity_months,
      },
      status: subscription.status,
      assigned_at: subscription.assigned_at ? subscription.assigned_at.toISOString() : null,
      expires_at: subscription.expires_at ? subscription.expires_at.toISOString() : null,
      is_valid,
    };
  }

  async getSubscriptionHistory(
    customerId: number,
    page: number = 1,
    limit: number = 10,
    sort: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;
    const [subscriptions, total] = await this.subscriptionRepository.findAndCount({
      where: { customer_id: customerId },
      relations: ['pack'],
      skip,
      take: limit,
      order: { created_at: sort.toUpperCase() as 'ASC' | 'DESC' },
    });

    return {
      history: subscriptions.map((s) => ({
        id: s.id,
        pack_name: s.pack.name,
        status: s.status,
        assigned_at: s.assigned_at ? s.assigned_at.toISOString() : null,
        expires_at: s.expires_at ? s.expires_at.toISOString() : null,
      })),
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: SubscriptionStatus,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [subscriptions, total] = await this.subscriptionRepository.findAndCount({
      where,
      relations: ['pack', 'customer'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        customer_id: s.customer_id,
        pack_id: s.pack_id,
        status: s.status,
        pack_name: s.pack.name,
        pack_sku: s.pack.sku,
        price: parseFloat(s.pack.price.toString()),
        validity_months: s.pack.validity_months,
        requested_at: s.requested_at,
        approved_at: s.approved_at,
        assigned_at: s.assigned_at,
        expires_at: s.expires_at,
        deactivated_at: s.deactivated_at,
        created_at: s.created_at,
        updated_at: s.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async updateExpiredSubscriptions() {
    const now = new Date();
    await this.subscriptionRepository.update(
      {
        status: SubscriptionStatus.ACTIVE,
        expires_at: LessThan(now),
      },
      {
        status: SubscriptionStatus.EXPIRED,
      },
    );
  }
}
