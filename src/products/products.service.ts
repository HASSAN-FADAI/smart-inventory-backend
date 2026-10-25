import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  //  إنشاء منتج جديد
  async create(createProductDto: CreateProductDto) {
    // التأكد أن القسم موجود أولاً
    await this.categoriesService.findOne(createProductDto.categoryId);

    // التحقق من أن الـ SKU غير مستخدم مسبقاً
    const existingSku = await this.productRepository.findOne({
      where: { sku: createProductDto.sku },
    });
    if (existingSku) {
      throw new ConflictException('هذا الـ SKU مستخدم مسبقاً لمنتج آخر');
    }

    // التحقق من أن اسم المنتج غير مكرر
    const existingName = await this.productRepository.findOne({
      where: { name: createProductDto.name },
    });
    if (existingName) {
      throw new ConflictException('هذا المنتج موجود مسبقاً');
    }

    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  //  جلب جميع المنتجات مع بيانات القسم المرتبط بها
  async findAll() {
    return await this.productRepository.find({ relations:{category:true} });
  }

  // جلب منتج معين برقم الـ ID
  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {category:true},
    });
    if (!product) {
      throw new NotFoundException('المنتج غير موجود');
    }
    return product;
  }

  //  تحديث بيانات منتج
  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    // إذا تم تحديث القسم، نتأكد أنه موجود
    if (updateProductDto.categoryId) {
      await this.categoriesService.findOne(updateProductDto.categoryId);
    }

    // إذا تم تغيير الـ SKU، نتأكد أنه غير مكرر
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
      });
      if (existingSku) {
        throw new ConflictException('هذا الـ SKU مستخدم مسبقاً');
      }
    }

    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  // 5. حذف منتج
  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { success: true, message: 'تم حذف المنتج بنجاح' };
  }
}