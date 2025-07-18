


export type OrderStatus = 'booked' | 'in progress' | 'completed' | 'cancelled';

export interface OrderItem {
  name?: string;
  quantity: number;
  price: number;
}


export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  _id: string;
  guest?: {
    _id: string;
    name: string;
    email: string;
    contact?: string; // ✅ Add this line
    address?: Address;
  };
  washerman?: {
    _id: string;
    name: string;
    email?: string;
  };
  productId?: {
    _id: string;
    name?: string;
    category?: string;
    image?: string;
    price?: number;
    serviceType?: string; // ✅ Add this if you're using it
  };
  status: OrderStatus;
  date: string;
  slot?: {
    label?: string;
    range?: string;
  };
  quantity?: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  items?: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}
