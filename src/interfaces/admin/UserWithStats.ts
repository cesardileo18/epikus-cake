export interface UserWithStats {
  id: string;
  email: string;
  username?: string;
  role?: string;
  createdAt?: any;
  lastLogin?: any;
  orderCount: number;
  totalSpent: number;
  orders: any[];
}
