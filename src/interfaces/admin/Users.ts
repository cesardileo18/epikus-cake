export interface User {
  id: string;
  email: string;
  username?: string;
  role?: string;
  createdAt?: any;
  lastLogin?: any;
}

export interface Order {
  id: string;
  userId?: string;
  total?: number;
  status?: string;
  createdAt?: any;
}

export interface UserWithStats extends User {
  orderCount: number;
  totalSpent: number;
  orders: Order[];
}