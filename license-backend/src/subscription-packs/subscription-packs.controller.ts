import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionPacksService } from './subscription-packs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import {
  SubscriptionPackCreateRequestDto,
  SubscriptionPackUpdateRequestDto,
  SubscriptionPackResponseDto,
} from '../dto/subscription-pack.dto';
import { ErrorResponseDto, SuccessResponseDto } from '../dto/common.dto';

@ApiTags('Subscription Pack Management', 'Admin')
@Controller('api/v1/admin/subscription-packs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class SubscriptionPacksController {
  constructor(private readonly packsService: SubscriptionPacksService) {}

  @Get()
  @ApiOperation({ summary: 'List subscription packs' })
  @ApiResponse({ status: 200, type: [SubscriptionPackResponseDto] })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    const result = await this.packsService.findAll(page, limit);
    return {
      success: true,
      ...result,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create subscription pack' })
  @ApiResponse({ status: 201, type: SubscriptionPackResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  async create(@Body() createDto: SubscriptionPackCreateRequestDto) {
    const pack = await this.packsService.create(createDto);
    return {
      success: true,
      pack,
    };
  }

  @Put(':pack_id')
  @ApiOperation({ summary: 'Update subscription pack' })
  @ApiResponse({ status: 200, type: SubscriptionPackResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  async update(
    @Param('pack_id', ParseIntPipe) id: number,
    @Body() updateDto: SubscriptionPackUpdateRequestDto,
  ) {
    const pack = await this.packsService.update(id, updateDto);
    return {
      success: true,
      pack,
    };
  }

  @Delete(':pack_id')
  @ApiOperation({ summary: 'Soft delete subscription pack' })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  async remove(@Param('pack_id', ParseIntPipe) id: number) {
    await this.packsService.remove(id);
    return {
      success: true,
      message: 'Subscription pack deleted successfully',
    };
  }
}
