import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export enum TransactionType {
  IN = 'IN',           // توريد جديد
  OUT = 'OUT',         // تعديل يدوي للخروج/تالف
  ADJUSTMENT = 'ADJUSTMENT', // تسوية مخزونية
}

@Entity('stock_transactions')
export class StockTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column('int')
  quantity: number; // الكمية المضافة أو المخصومة

  @Column({ nullable: true })
  reason?: string; // سبب الحركة (مثال: شحنة جديدة من المورد، بضاعة تالفة)

  @CreateDateColumn()
  createdAt: Date;
}