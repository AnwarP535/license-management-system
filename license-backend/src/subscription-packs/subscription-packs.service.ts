import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPack } from '../entities/subscription-pack.entity';
import {
  SubscriptionPackCreateRequestDto,
  SubscriptionPackUpdateRequestDto,
  SubscriptionPackResponseDto,
} from '../dto/subscription-pack.dto';

@Injectable()
export class SubscriptionPacksService {
  constructor(
    @InjectRepository(SubscriptionPack)
    private packRepository: Repository<SubscriptionPack>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ packs: SubscriptionPackResponseDto[]; pagination: any }> {
    const skip = (page - 1) * limit;

    const [packs, total] = await this.packRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      withDeleted: false,
    });

    const packDtos = packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      description: pack.description,
      sku: pack.sku,
      price: parseFloat(pack.price.toString()),
      validity_months: pack.validityMonths,
      created_at: pack.createdAt,
      updated_at: pack.updatedAt,
    }));

    return {
      packs: packDtos,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: number): Promise<SubscriptionPackResponseDto> {
    const pack = await this.packRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!pack) {
      throw new NotFoundException('Subscription pack not found');
    }

    return {
      id: pack.id,
      name: pack.name,
      description: pack.description,
      sku: pack.sku,
      price: parseFloat(pack.price.toString()),
      validity_months: pack.validityMonths,
      created_at: pack.createdAt,
      updated_at: pack.updatedAt,
    };
  }

  async findBySku(sku: string): Promise<SubscriptionPack | null> {
    return this.packRepository.findOne({
      where: { sku },
      withDeleted: false,
    });
  }

  async create(
    createDto: SubscriptionPackCreateRequestDto,
  ): Promise<SubscriptionPackResponseDto> {
    const existingPack = await this.packRepository.findOne({
      where: { sku: createDto.sku },
      withDeleted: false,
    });

    if (existingPack) {
      throw new ConflictException('SKU already exists');
    }

    const pack = this.packRepository.create({
      name: createDto.name,
      description: createDto.description,
      sku: createDto.sku,
      price: createDto.price,
      validityMonths: createDto.validity_months,
    });

    const savedPack = await this.packRepository.save(pack);

    return {
      id: savedPack.id,
      name: savedPack.name,
      description: savedPack.description,
      sku: savedPack.sku,
      price: parseFloat(savedPack.price.toString()),
      validity_months: savedPack.validityMonths,
      created_at: savedPack.createdAt,
      updated_at: savedPack.updatedAt,
    };
  }

  async update(
    id: number,
    updateDto: SubscriptionPackUpdateRequestDto,
  ): Promise<SubscriptionPackResponseDto> {
    const pack = await this.packRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!pack) {
      throw new NotFoundException('Subscription pack not found');
    }

    if (updateDto.sku && updateDto.sku !== pack.sku) {
      const existingPack = await this.packRepository.findOne({
        where: { sku: updateDto.sku },
        withDeleted: false,
      });

      if (existingPack) {
        throw new ConflictException('SKU already exists');
      }
    }

    if (updateDto.name) pack.name = updateDto.name;
    if (updateDto.description !== undefined) pack.description = updateDto.description;
    if (updateDto.sku) pack.sku = updateDto.sku;
    if (updateDto.price) pack.price = updateDto.price;
    if (updateDto.validity_months) pack.validityMonths = updateDto.validity_months;

    const updatedPack = await this.packRepository.save(pack);

    return {
      id: updatedPack.id,
      name: updatedPack.name,
      description: updatedPack.description,
      sku: updatedPack.sku,
      price: parseFloat(updatedPack.price.toString()),
      validity_months: updatedPack.validityMonths,
      created_at: updatedPack.createdAt,
      updated_at: updatedPack.updatedAt,
    };
  }

  async remove(id: number): Promise<void> {
    const pack = await this.packRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!pack) {
      throw new NotFoundException('Subscription pack not found');
    }

    await this.packRepository.softDelete(id);
  }
}
