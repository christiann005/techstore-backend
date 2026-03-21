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
    public specifications: Record<string, any>,
    public rating: number,
    public reviews: Review[],
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public model3dUrl?: string, // El opcional DEBE ir al final o después de los obligatorios
  ) {}
}
