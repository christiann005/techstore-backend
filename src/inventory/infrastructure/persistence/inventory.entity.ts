import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventory')
export class InventoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  productId: string; // Referencia al producto de MongoDB

  @Column({ type: 'int', default: 0 })
  stock: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
