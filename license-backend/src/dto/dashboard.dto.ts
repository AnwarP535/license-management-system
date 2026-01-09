import { ApiProperty } from '@nestjs/swagger';

export class DashboardResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: {
    total_customers: number;
    active_subscriptions: number;
    pending_requests: number;
    total_revenue: number;
    recent_activities: Array<{
      type: string;
      customer: string;
      pack: string;
      timestamp: Date;
    }>;
  };
}
