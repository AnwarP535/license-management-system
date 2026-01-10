import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPack } from '../entities/subscription-pack.entity';
import { CreateSubscriptionPackDto } from './dto/create-subscription-pack.dto';
import { UpdateSubscriptionPackDto } from './dto/update-subscription-pack.dto';

@Injectable()
export class SubscriptionPacksService {
  constructor(
    @InjectRepository(SubscriptionPack)
    private packRepository: Repository<SubscriptionPack>,
  ) {}

  async create(createPackDto: CreateSubscriptionPackDto) {
    const pack = this.packRepository.create(createPackDto);
    return await this.packRepository.save(pack);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [packs, total] = await this.packRepository.findAndCount({
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      packs,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async findAvailable(page: number = 1, limit: number = 100) {
    const skip = (page - 1) * limit;
    const [packs, total] = await this.packRepository.findAndCount({
      where: { deleted_at: null },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      packs,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: number) {
    const pack = await this.packRepository.findOne({ where: { id } });
    if (!pack) {
      throw new NotFoundException('Subscription pack not found');
    }
    return pack;
  }

  async findBySku(sku: string) {
    const pack = await this.packRepository.findOne({ where: { sku } });
    if (!pack) {
      throw new NotFoundException('Subscription pack not found');
    }
    return pack;
  }

  async update(id: number, updatePackDto: UpdateSubscriptionPackDto) {
    const pack = await this.packRepository.findOne({ where: { id } });
    if (!pack) {
      throw new NotFoundException('Subscription pack not found');
    }

    Object.assign(pack, updatePackDto);
    return await this.packRepository.save(pack);
  }

  async remove(id: number) {
    const pack = await this.packRepository.findOne({ where: { id } });
    if (!pack) {
      throw new NotFoundException('Subscription pack not found');
    }

    await this.packRepository.softDelete(id);
    return { success: true, message: 'Subscription pack deleted successfully' };
  }
}
