export interface Washerman {
  _id: string;
  name: string;
  washermanId: string; // Unique identifier for the washerman
                                                // Add more fields if needed (e.g., email, phone)
}

export interface ServiceOption {
  _id: string;
  name: string;
  price: number;
}

export interface Service {
  _id: string;
  name: string;
  image: string;
  washerman: { _id: string; name: string }; // ✅ change here
  category: 'shirt' | 'pants' | 'suits' | 'bedding';
  basePrice: number;
  options?: ServiceOption[];
  totalspent:number;
}

export interface CartItem {
  serviceId: string;
  service: Service;
  quantity: number;
  selectedOptions: string[];
  totalPrice: number;
  price: number;
  washermanId : string; // Add washermanId to CartItem
  washerman: Washerman; // Add washerman object to CartItem
  name: string; // Add name to CartItem
}

export interface TimeSlot {
  _id: string;
  time: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  available: number;
  total: number;
  isAvailable: boolean;
  maximumorder: number; // Add maximum order field
}

export interface Order {
  _id: string;
  items: CartItem[];
  totalSpent: number;
  selectedDate: string;
  selectedTimeSlot: TimeSlot | null;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed';
}
