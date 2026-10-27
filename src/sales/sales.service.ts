import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource, // للتحكم بالمعاملات (Transactions)
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    // استخدام QueryRunner لضمان تنفيذ العملية ككتلة واحدة آمنة
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of createOrderDto.items) {
        //  البحث عن المنتج والتحقق من توفره
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.productId },
        });

        if (!product) {
          throw new NotFoundException(`المنتج بالمعرف ${itemDto.productId} غير موجود`);
        }

        //  التحقق من أن المخزون يكفي للكمية المطلوبة
        if (product.stockQuantity < itemDto.quantity) {
          throw new BadRequestException(
            `الكمية المطلوبة غير متوفرة للمنتج: ${product.name} (المتوفر: ${product.stockQuantity})`
          );
        }

        //  خصم الكمية من مخزون المنتج
        product.stockQuantity -= itemDto.quantity;
        await queryRunner.manager.save(product);

        //  حساب السعر الفرعي وعمل عنصر الفاتورة
        const subTotal = Number(product.price) * itemDto.quantity;
        totalAmount += subTotal;

        const orderItem = queryRunner.manager.create(OrderItem, {
          productId: product.id,
          quantity: itemDto.quantity,
          unitPrice: product.price,
        });

        orderItems.push(orderItem);
      }

      //  إنشاء وحفظ الفاتورة الرئيسية
      const order = queryRunner.manager.create(Order, {
        totalAmount,
        items: orderItems,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // تثبيت التغييرات في قاعدة البيانات
      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      // التراجع عن كل التغييرات إذا حدث أي خطأ
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // إغلاق الاتصال
      await queryRunner.release();
    }
  }

  //  جلب جميع المبيعات والفواتير
  async findAll() {
    return await this.orderRepository.find({
      relations: {
        items: {
          product: true, // تفعيل العلاقة المتداخلة بالشكل الصحيح
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  //  جلب فاتورة معينة برقم الـ ID
  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        items: {
          product: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('الفاتورة غير موجودة');
    }
    return order;
  }
}