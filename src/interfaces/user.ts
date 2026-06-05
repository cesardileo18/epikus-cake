export type UserRole = 'admin' | 'customer' | 'viewer' | string;

export interface User {
  id: string;
  email: string;
  username?: string;
  role?: UserRole;
  createdAt?: any;
  lastLogin?: any;
}

export interface OrderSummary {
  id: string;
  userId?: string;
  total?: number;
  status?: string;
  createdAt?: any;
}

export interface Order extends OrderSummary {}

export interface UserWithStats extends User {
  orderCount: number;
  totalSpent: number;
  orders: Order[];
}
