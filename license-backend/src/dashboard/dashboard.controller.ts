import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { DashboardResponseDto } from '../dto/dashboard.dto';
import { ErrorResponseDto } from '../dto/common.dto';

@ApiTags('Dashboard', 'Admin')
@Controller('api/v1/admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get admin dashboard data' })
  @ApiResponse({ status: 200, type: DashboardResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async getDashboard() {
    return this.dashboardService.getDashboardData();
  }
}
