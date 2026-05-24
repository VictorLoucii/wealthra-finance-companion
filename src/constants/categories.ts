import { 
  Utensils, Home, Car, Briefcase, Gamepad2, ShoppingBag, HeartPulse, Layers,
  Banknote, Laptop, Gift, ShoppingBasket, Carrot, Apple, Coins, Handshake 
} from 'lucide-react-native';

export const CATEGORIES = [
  { id: '12', name: 'Groceries', icon: ShoppingBasket, color: '#FFCC00', type: 'expense' },
  { id: '13', name: 'Vegetables', icon: Carrot, color: '#4CD964', type: 'expense' },
  { id: '14', name: 'Fruits', icon: Apple, color: '#FF5A5F', type: 'expense' },
  { id: '1', name: 'Eat Out', icon: Utensils, color: '#FF9500', type: 'expense' },
  { id: '2', name: 'Rent', icon: Home, color: '#5856D6', type: 'expense' },
  { id: '3', name: 'Transport', icon: Car, color: '#007AFF', type: 'expense' },
  { id: '5', name: 'Leisure', icon: Gamepad2, color: '#AF52DE', type: 'expense' },
  { id: '6', name: 'Shopping', icon: ShoppingBag, color: '#FF2D55', type: 'expense' },
  { id: '7', name: 'Health', icon: HeartPulse, color: '#FF3B30', type: 'expense' },
  { id: '15', name: 'Lend', icon: Handshake, color: '#E28743', type: 'expense' },
  { id: '4', name: 'Salary', icon: Briefcase, color: '#34C759', type: 'income' },
  { id: '9', name: 'Stipend', icon: Banknote, color: '#2E8B57', type: 'income' },
  { id: '10', name: 'Freelance', icon: Laptop, color: '#059669', type: 'income' },
  { id: '16', name: 'Pocket Money', icon: Coins, color: '#14B8A6', type: 'income' },
  { id: '11', name: 'Refunds', icon: Gift, color: '#10B981', type: 'income' },
  { id: '8', name: 'General', icon: Layers, color: '#8E8E93', type: 'both' },
];

export type CategoryName = typeof CATEGORIES[number]['name'];