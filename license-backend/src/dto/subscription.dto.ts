import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';
import { SubscriptionStatus } from '../entities/subscription.entity';

export class SubscriptionRequestDto {
  @ApiProperty({ example: 'premium-plan' })
  @IsString()
  sku: string;
}

export class AssignSubscriptionRequestDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  pack_id: number;
}

export class SubscriptionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  customer_id: number;

  @ApiProperty({ example: 1 })
  pack_id: number;

  @ApiProperty({ enum: SubscriptionStatus, example: 'active' })
  status: SubscriptionStatus;

  @ApiProperty({ example: 'Premium Plan' })
  pack_name: string;

  @ApiProperty({ example: 'premium-plan' })
  pack_sku: string;

  @ApiProperty({ example: 29.99 })
  price: number;

  @ApiProperty({ example: 12 })
  validity_months: number;

  @ApiProperty()
  requested_at: Date;

  @ApiProperty({ required: false })
  approved_at?: Date;

  @ApiProperty({ required: false })
  assigned_at?: Date;

  @ApiProperty({ required: false })
  expires_at?: Date;

  @ApiProperty({ required: false })
  deactivated_at?: Date;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

export class CustomerSubscriptionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  subscription: {
    id: number;
    pack: {
      name: string;
      sku: string;
      price: number;
      validity_months: number;
    };
    status: SubscriptionStatus;
    assigned_at: Date;
    expires_at: Date;
    is_valid: boolean;
  };
}

export class SubscriptionCreateResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Subscription request submitted successfully' })
  message: string;

  @ApiProperty()
  subscription: {
    id: number;
    status: SubscriptionStatus;
    requested_at: Date;
  };
}

export class DeactivateResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Subscription deactivated successfully' })
  message: string;

  @ApiProperty()
  deactivated_at: Date;
}

export class SubscriptionHistoryResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Object] })
  history: Array<{
    id: number;
    pack_name: string;
    status: SubscriptionStatus;
    assigned_at: Date;
    expires_at: Date;
  }>;

  @ApiProperty()
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
