export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public fullName: string,
    public role: UserRole,
    public addresses: string[],
    public isVerified: boolean,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public password?: string, // Opcional al final
  ) {}
}
