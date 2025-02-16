export interface Statistics {
    totalProducts: number;
    outOfStock: number;
    totalStockValue: number;
    mostAddedProducts: { name: string; count: number }[];
    mostRemovedProducts: { name: string; count: number }[];
}

export interface ProductStatistic {
    name: string;
    count: number;
  }