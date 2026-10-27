import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TransactionType } from '../entities/stock-transaction.entity';

export class CreateStockTransactionDto {
  @IsUUID('4', { message: 'معرف المنتج غير صالح' })
  @IsNotEmpty({ message: 'معرف المنتج مطلوب' })
  productId: string;

  @IsEnum(TransactionType, { message: 'نوع الحركة غير صالح (IN, OUT, ADJUSTMENT)' })
  @IsNotEmpty({ message: 'نوع الحركة مطلوب' })
  type: TransactionType;

  @IsInt({ message: 'الكمية يجب أن تكون رقمًا صحيحًا' })
  @Min(1, { message: 'الكمية يجب أن تكون 1 على الأقل' })
  quantity: number;

  @IsString({ message: 'السبب يجب أن يكون نصًا' })
  @IsOptional()
  reason?: string;
}