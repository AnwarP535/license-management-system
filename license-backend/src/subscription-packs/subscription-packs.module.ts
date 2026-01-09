import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPacksService } from './subscription-packs.service';
import { SubscriptionPacksController } from './subscription-packs.controller';
import { SubscriptionPack } from '../entities/subscription-pack.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPack])],
  controllers: [SubscriptionPacksController],
  providers: [SubscriptionPacksService],
  exports: [SubscriptionPacksService],
})
export class SubscriptionPacksModule {}
