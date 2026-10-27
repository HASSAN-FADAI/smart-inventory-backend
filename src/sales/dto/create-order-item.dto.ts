import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID('4', { message: 'معرف المنتج غير صالح' })
  @IsNotEmpty({ message: 'معرف المنتج مطلوب' })
  productId: string;

  @IsNumber({}, { message: 'الكمية يجب أن تكون رقماً' })
  @Min(1, { message: 'الكمية يجب أن تكون 1 على الأقل' })
  quantity: number;
}