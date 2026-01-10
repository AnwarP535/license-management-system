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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionPacksService } from './subscription-packs.service';
import { CreateSubscriptionPackDto } from './dto/create-subscription-pack.dto';
import { UpdateSubscriptionPackDto } from './dto/update-subscription-pack.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Subscription Pack Management')
@Controller('api/v1/admin/subscription-packs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class SubscriptionPacksController {
  constructor(private readonly packsService: SubscriptionPacksService) {}

  @Get()
  @ApiOperation({ summary: 'List subscription packs' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    const result = await this.packsService.findAll(page, limit);
    return { success: true, ...result };
  }

  @Post()
  @ApiOperation({ summary: 'Create subscription pack' })
  async create(@Body() createPackDto: CreateSubscriptionPackDto) {
    const pack = await this.packsService.create(createPackDto);
    return { success: true, pack };
  }

  @Put(':pack_id')
  @ApiOperation({ summary: 'Update subscription pack' })
  async update(
    @Param('pack_id', ParseIntPipe) id: number,
    @Body() updatePackDto: UpdateSubscriptionPackDto,
  ) {
    const pack = await this.packsService.update(id, updatePackDto);
    return { success: true, pack };
  }

  @Delete(':pack_id')
  @ApiOperation({ summary: 'Soft delete subscription pack' })
  async remove(@Param('pack_id', ParseIntPipe) id: number) {
    return await this.packsService.remove(id);
  }
}

@ApiTags('Customer Self-Service')
@Controller('api/v1/customer/subscription-packs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@ApiBearerAuth()
export class CustomerSubscriptionPacksController {
  constructor(private readonly packsService: SubscriptionPacksService) {}

  @Get()
  @ApiOperation({ summary: 'List available subscription packs' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 100,
  ) {
    const result = await this.packsService.findAvailable(page, limit);
    return { success: true, ...result };
  }
}
