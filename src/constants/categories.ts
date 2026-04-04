import { 
  Utensils, 
  Home, 
  Car, 
  Briefcase, 
  Gamepad2, 
  ShoppingBag, 
  HeartPulse, 
  Layers 
} from 'lucide-react-native';

export const CATEGORIES = [
  { id: '1', name: 'Food', icon: Utensils, color: '#FF9500' },
  { id: '2', name: 'Rent', icon: Home, color: '#5856D6' },
  { id: '3', name: 'Transport', icon: Car, color: '#007AFF' },
  { id: '4', name: 'Salary', icon: Briefcase, color: '#34C759' },
  { id: '5', name: 'Leisure', icon: Gamepad2, color: '#AF52DE' },
  { id: '6', name: 'Shopping', icon: ShoppingBag, color: '#FF2D55' },
  { id: '7', name: 'Health', icon: HeartPulse, color: '#FF3B30' },
  { id: '8', name: 'General', icon: Layers, color: '#8E8E93' },
];

export type CategoryName = typeof CATEGORIES[number]['name'];