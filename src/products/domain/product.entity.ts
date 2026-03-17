export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public sku: string, // Código único del producto
    public brand: string,
    public description: string,
    public basePrice: number,
    public categories: string[],
    public images: string[],
    public specifications: Record<string, any>, // Para specs técnicas (CPU, RAM, etc.)
    public rating: number,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
