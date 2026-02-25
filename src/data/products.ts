export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  description: string;
  sizes: string[];
  reviews: { name: string; rating: number; comment: string; date?: string }[];
  sku?: string;
  materials?: string;
  care?: string;
  stock?: Record<string, number>;
  color?: string;
  type?: string;
  occasion?: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Sparkle Princess Dress',
    price: 1499,
    image: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    category: 'Age 7-9',
    description: 'A shimmering princess dress perfect for parties and magical moments.',
    sizes: ['7-8','9-10','11-12','12-13'],
    reviews: [
      { name: 'Amelia', rating: 5, comment: 'Absolutely beautiful, my daughter loves it!', date: '2024-11-01' },
      { name: 'Sophia', rating: 4, comment: 'Great quality and perfect fit.' },
    ],
    sku: 'SP-001',
    materials: 'Outer: 100% Polyester Tulle; Lining: 100% Cotton',
    care: 'Delicate wash or hand wash, lay flat to dry',
    stock: { '7-8': 5, '9-10': 8, '11-12': 3, '12-13': 6 },
    color: 'Pink',
    type: 'Party',
    occasion: 'Birthday',
  },
  {
    id: 2,
    name: 'Pink Tulle Party Dress',
    price: 799,
    image: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    category: 'Age 8-10',
    description: 'Layers of soft tulle for twirls and smiles at every occasion.',
    sizes: ['7-8','9-10','11-12','12-13'],
    reviews: [
      { name: 'Ella', rating: 5, comment: 'Perfect for her birthday party!', date: '2024-10-15' },
    ],
    sku: 'PT-002',
    materials: 'Outer: Polyester Tulle; Lining: Cotton',
    care: 'Hand wash cold, gentle steam',
    stock: { '7-8': 4, '9-10': 7, '11-12': 4, '12-13': 2 },
    color: 'Pink',
    type: 'Party',
    occasion: 'Birthday',
  },
  {
    id: 3,
    name: 'Floral Summer Dress',
    price: 699,
    image: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    category: 'Age 9-11',
    description: 'Lightweight floral dress for sunny days and outdoor fun.',
    sizes: ['7-8','9-10','11-12','12-13'],
    reviews: [
      { name: 'Mia', rating: 4, comment: 'Lovely print and comfy fabric.' },
    ],
    sku: 'FS-003',
    materials: '100% Cotton',
    care: 'Machine wash cold, line dry',
    stock: { '7-8': 3, '9-10': 5, '11-12': 9, '12-13': 4 },
    color: 'Lavender',
    type: 'Casual',
    occasion: 'School Event',
  },
  {
    id: 4,
    name: 'Unicorn Dream Dress',
    price: 999,
    image: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    category: 'Age 7-9',
    description: 'Magical unicorn accents and pastel hues for dreamers.',
    sizes: ['7-8','9-10','11-12','12-13'],
    reviews: [
      { name: 'Olivia', rating: 5, comment: 'Unicorn details are adorable!' },
    ],
    sku: 'UD-004',
    materials: 'Polyester blend; decorative accents',
    care: 'Delicate wash, avoid bleach',
    stock: { '7-8': 10, '9-10': 6, '11-12': 2, '12-13': 1 },
    color: 'Sky Blue',
    type: 'Western',
    occasion: 'Birthday',
  },
  {
    id: 5,
    name: 'Teen Elegance Dress',
    price: 1799,
    image: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    category: 'Age 11-13',
    description: 'Elegant silhouette crafted for growing style and confidence.',
    sizes: ['7-8','9-10','11-12','12-13'],
    reviews: [
      { name: 'Charlotte', rating: 4, comment: 'Very premium feel.' },
    ],
    sku: 'TE-005',
    materials: 'Polyester-crepe; cotton lining',
    care: 'Machine wash cold; hang dry',
    stock: { '7-8': 2, '9-10': 4, '11-12': 7, '12-13': 5 },
    color: 'Red',
    type: 'Ethnic',
    occasion: 'Wedding',
  },
  {
    id: 6,
    name: 'Birthday Princess Gown',
    price: 2199,
    image: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    category: 'Age 10-12',
    description: 'Statement gown for unforgettable birthday celebrations.',
    sizes: ['7-8','9-10','11-12','12-13'],
    reviews: [
      { name: 'Ava', rating: 5, comment: 'Made her day so special!' },
    ],
    sku: 'BP-006',
    materials: 'Embellished polyester; satin lining',
    care: 'Spot clean; gentle steam',
    stock: { '7-8': 6, '9-10': 3, '11-12': 3, '12-13': 2 },
    color: 'Pink',
    type: 'Party',
    occasion: 'Birthday',
  },
];
