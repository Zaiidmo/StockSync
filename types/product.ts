export interface Product {
  id: number;
  name: string;
  type: string;
  barcode: string;
  price: number;
  solde?: number;
  supplier: string;
  image: string;
  stocks: {
    id: number;
    name: string;
    quantity: number;
    localisation: {
      city: string;
      latitude: number;
      longitude: number;
    };
  }[];
  editedBy: {
    warehousemanId: number;
    at: string;
  }[];
}

export interface Stock {
  id: number;
  name: string;
  quantity: number;
  localisation: {
    city: string;
    latitude: number;
    longitude: number;
  };
}

export interface ProductDetailsModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
}
