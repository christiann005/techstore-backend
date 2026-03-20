export class Review {
  constructor(
    public readonly userName: string,
    public readonly rating: number,
    public readonly comment: string,
    public readonly createdAt?: Date,
  ) {}
}

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
    public model3dUrl?: string, // Para visor 3D inmersivo
    public specifications: Record<string, any>, 
 // Para specs técnicas (CPU, RAM, etc.)
    public rating: number,
    public reviews: Review[],
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
