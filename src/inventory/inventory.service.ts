import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual } from 'typeorm';
import { StockTransaction, TransactionType } from './entities/stock-transaction.entity';
import { Product } from '../products/entities/product.entity';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(StockTransaction)
    private readonly transactionRepository: Repository<StockTransaction>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  //  تسجيل حركة مخزون وتحديث كمية المنتج تلقائيًا
  async createTransaction(dto: CreateStockTransactionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.productId },
      });

      if (!product) {
        throw new NotFoundException(`المنتج بالمعرف ${dto.productId} غير موجود`);
      }

      // ضبط كمية المنتج حسب نوع الحركة
      if (dto.type === TransactionType.IN) {
        product.stockQuantity += dto.quantity;
      } else if (dto.type === TransactionType.OUT) {
        if (product.stockQuantity < dto.quantity) {
          throw new BadRequestException(`المخزون الحالي (${product.stockQuantity}) لا يكفي لخصم (${dto.quantity})`);
        }
        product.stockQuantity -= dto.quantity;
      }

      await queryRunner.manager.save(product);

      const transaction = queryRunner.manager.create(StockTransaction, dto);
      const savedTransaction = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //  جلب سجل التنبيهات للمنتجات القريبة من النفاد (Low Stock Alerts)
  async getLowStockProducts() {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.stockQuantity <= product.minStockLevel')
      .leftJoinAndSelect('product.category', 'category')
      .getMany();
  }

  //  جلب جميع حركات المخزون
  async findAllTransactions() {
    return await this.transactionRepository.find({
      relations: {
        product: true,
      },
      order: { createdAt: 'DESC' },
    });
  }
}