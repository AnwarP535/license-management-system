import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { Customer } from '../entities/customer.entity';
import { SubscriptionPack } from '../entities/subscription-pack.entity';
import { SubscriptionPacksService } from '../subscription-packs/subscription-packs.service';
import {
  SubscriptionRequestDto,
  AssignSubscriptionRequestDto,
  CustomerSubscriptionResponseDto,
  SubscriptionCreateResponseDto,
  DeactivateResponseDto,
  SubscriptionHistoryResponseDto,
  SubscriptionResponseDto,
} from '../dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private packsService: SubscriptionPacksService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: SubscriptionStatus,
  ): Promise<{ subscriptions: SubscriptionResponseDto[]; pagination: any }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [subscriptions, total] = await this.subscriptionRepository.findAndCount({
      where,
      relations: ['customer', 'pack'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const subscriptionDtos = subscriptions.map((sub) => ({
      id: sub.id,
      customer_id: sub.customerId,
      pack_id: sub.packId,
      status: sub.status,
      pack_name: sub.pack.name,
      pack_sku: sub.pack.sku,
      price: parseFloat(sub.pack.price.toString()),
      validity_months: sub.pack.validityMonths,
      requested_at: sub.requestedAt,
      approved_at: sub.approvedAt,
      assigned_at: sub.assignedAt,
      expires_at: sub.expiresAt,
      deactivated_at: sub.deactivatedAt,
      created_at: sub.createdAt,
      updated_at: sub.updatedAt,
    }));

    return {
      subscriptions: subscriptionDtos,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async getCustomerSubscription(
    customerId: number,
  ): Promise<CustomerSubscriptionResponseDto> {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        customerId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['pack'],
      order: { assignedAt: 'DESC' },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    const now = new Date();
    const is_valid = subscription.expiresAt && subscription.expiresAt > now;

    return {
      success: true,
      subscription: {
        id: subscription.id,
        pack: {
          name: subscription.pack.name,
          sku: subscription.pack.sku,
          price: parseFloat(subscription.pack.price.toString()),
          validity_months: subscription.pack.validityMonths,
        },
        status: subscription.status,
        assigned_at: subscription.assignedAt,
        expires_at: subscription.expiresAt,
        is_valid: is_valid && subscription.status === SubscriptionStatus.ACTIVE,
      },
    };
  }

  async requestSubscription(
    customerId: number,
    requestDto: SubscriptionRequestDto,
  ): Promise<SubscriptionCreateResponseDto> {
    // Check if customer has active subscription
    const activeSubscription = await this.subscriptionRepository.findOne({
      where: {
        customerId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (activeSubscription) {
      throw new BadRequestException('Customer already has an active subscription');
    }

    const pack = await this.packsService.findBySku(requestDto.sku);
    if (!pack) {
      throw new NotFoundException('Subscription pack not found');
    }

    const subscription = this.subscriptionRepository.create({
      customerId,
      packId: pack.id,
      status: SubscriptionStatus.REQUESTED,
    });

    const savedSubscription = await this.subscriptionRepository.save(subscription);

    return {
      success: true,
      message: 'Subscription request submitted successfully',
      subscription: {
        id: savedSubscription.id,
        status: savedSubscription.status,
        requested_at: savedSubscription.requestedAt,
      },
    };
  }

  async approveSubscription(subscriptionId: number): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== SubscriptionStatus.REQUESTED) {
      throw new BadRequestException('Subscription is not in requested status');
    }

    subscription.status = SubscriptionStatus.APPROVED;
    subscription.approvedAt = new Date();
    await this.subscriptionRepository.save(subscription);
  }

  async assignSubscription(
    customerId: number,
    assignDto: AssignSubscriptionRequestDto,
  ): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check for active subscription
    const activeSubscription = await this.subscriptionRepository.findOne({
      where: {
        customerId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (activeSubscription) {
      throw new BadRequestException('Customer already has an active subscription');
    }

    const pack = await this.packsService.findOne(assignDto.pack_id);
    if (!pack) {
      throw new NotFoundException('Subscription pack not found');
    }

    // Check for existing requested subscription
    let subscription = await this.subscriptionRepository.findOne({
      where: {
        customerId,
        packId: assignDto.pack_id,
        status: SubscriptionStatus.REQUESTED,
      },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.ACTIVE;
      subscription.approvedAt = new Date();
      subscription.assignedAt = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + pack.validity_months);
      subscription.expiresAt = expiresAt;
    } else {
      subscription = this.subscriptionRepository.create({
        customerId,
        packId: assignDto.pack_id,
        status: SubscriptionStatus.ACTIVE,
        approvedAt: new Date(),
        assignedAt: new Date(),
      });
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + pack.validity_months);
      subscription.expiresAt = expiresAt;
    }

    await this.subscriptionRepository.save(subscription);
  }

  async deactivateSubscription(
    customerId: number,
  ): Promise<DeactivateResponseDto> {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        customerId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    subscription.status = SubscriptionStatus.INACTIVE;
    subscription.deactivatedAt = new Date();
    await this.subscriptionRepository.save(subscription);

    return {
      success: true,
      message: 'Subscription deactivated successfully',
      deactivated_at: subscription.deactivatedAt,
    };
  }

  async unassignSubscription(
    customerId: number,
    subscriptionId: number,
  ): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        id: subscriptionId,
        customerId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = SubscriptionStatus.INACTIVE;
    subscription.deactivatedAt = new Date();
    await this.subscriptionRepository.save(subscription);
  }

  async getSubscriptionHistory(
    customerId: number,
    page: number = 1,
    limit: number = 10,
    sort: 'asc' | 'desc' = 'desc',
  ): Promise<SubscriptionHistoryResponseDto> {
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await this.subscriptionRepository.findAndCount({
      where: { customerId },
      relations: ['pack'],
      skip,
      take: limit,
      order: { assignedAt: sort === 'asc' ? 'ASC' : 'DESC' },
    });

    const history = subscriptions.map((sub) => ({
      id: sub.id,
      pack_name: sub.pack.name,
      status: sub.status,
      assigned_at: sub.assignedAt,
      expires_at: sub.expiresAt,
    }));

    return {
      success: true,
      history,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }
}
