import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { SubscriptionPack } from './subscription-pack.entity';

export enum SubscriptionStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customer_id: number;

  @Column()
  pack_id: number;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.REQUESTED,
  })
  status: SubscriptionStatus;

  @CreateDateColumn()
  requested_at: Date;

  @Column({ nullable: true })
  approved_at: Date;

  @Column({ nullable: true })
  assigned_at: Date;

  @Column({ nullable: true })
  expires_at: Date;

  @Column({ nullable: true })
  deactivated_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Customer, (customer) => customer.subscriptions)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => SubscriptionPack)
  @JoinColumn({ name: 'pack_id' })
  pack: SubscriptionPack;
}
