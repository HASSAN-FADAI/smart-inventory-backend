import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'SKU يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'SKU مطلوب' })
  sku: string;

  @IsString({ message: 'اسم المنتج يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'اسم المنتج مطلوب' })
  name: string;

  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'السعر يجب أن يكون رقماً' })
  @Min(0, { message: 'السعر لا يمكن أن يكون سالباً' })
  price: number;

  @IsNumber({}, { message: 'تكلفة المنتج يجب أن تكون رقماً' })
  @Min(0, { message: 'التكلفة لا يمكن أن تكون سالبة' })
  costPrice: number;

  @IsNumber({}, { message: 'الكمية يجب أن تكون رقماً' })
  @Min(0, { message: 'الكمية لا يمكن أن تكون سالبة' })
  stockQuantity: number;

  @IsNumber({}, { message: 'الحد الأدنى للمخزون يجب أن يكون رقماً' })
  @Min(0, { message: 'الحد الأدنى لا يمكن أن يكون سالباً' })
  minStockLevel: number;

  @IsUUID('4', { message: 'معرف القسم غير صالح' })
  @IsNotEmpty({ message: 'معرف القسم مطلوب' })
  categoryId: string;
}