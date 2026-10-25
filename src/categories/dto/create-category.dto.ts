import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'اسم القسم يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'اسم القسم مطلوب' })
  name: string;

  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  @IsOptional()
  description?: string;
}