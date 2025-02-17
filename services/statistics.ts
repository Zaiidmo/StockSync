import { Product } from "@/types/product";
import { Statistics } from "@/types/statistics";


const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const statisticsService = {
    getStatistics: async () => {
        try {
            const response = await fetch(`${BASE_URL}/statistics`);
            if (!response.ok) throw new Error("Failed to fetch statistics");
            return response.json();
        } catch (error) {
            console.error("Error fetching statistics:", error);
            throw error;
        }
    },
      async updateStatistics(statistics: Partial<Statistics>): Promise<Statistics> {
        try {
          const currentStats = await this.getStatistics();
          const updatedStats = {
            ...currentStats,
            ...statistics
          };
    
          const response = await fetch(`${BASE_URL}/statistics`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedStats)
          });
    
          if (!response.ok) {
            throw new Error('Failed to update statistics');
          }
    
          return await response.json();
        } catch (error) {
          console.error('Error in updateStatistics:', error);
          throw error;
        }
      },
      async calculateAndUpdateTotalStockValue(): Promise<void> {
        try {
          const response = await fetch(`${BASE_URL}/products`);
          const products: Product[] = await response.json();
          
          const totalValue = products.reduce((sum, product) => {
            const totalStock = product.stocks.reduce((stockSum, stock) => stockSum + stock.quantity, 0);
            return sum + (totalStock * product.price);
          }, 0);
    
          await this.updateStatistics({ totalStockValue: totalValue });
        } catch (error) {
          console.error('Error calculating total stock value:', error);
          throw error;
        }
      },
      async calculateAndUpdateOutOfStock(): Promise<void> {
        try {
          const response = await fetch(`${BASE_URL}/products`);
          const products: Product[] = await response.json();
          
          const outOfStock = products.filter(product => 
            product.stocks.every(stock => stock.quantity === 0)
          ).length;
    
          await this.updateStatistics({ outOfStock });
        } catch (error) {
          console.error('Error calculating out of stock products:', error);
          throw error;
        }
      },
      async recalculateAllStatistics(): Promise<void> {
        try {
          const response = await fetch(`${BASE_URL}/products`);
          const products: Product[] = await response.json();
          
          // Calculate total products
          const totalProducts = products.length;
          
          // Calculate out of stock
          const outOfStock = products.filter(product => 
            product.stocks.every(stock => stock.quantity === 0)
          ).length;
          
          // Calculate total stock value
          const totalStockValue = products.reduce((sum, product) => {
            const totalStock = product.stocks.reduce((stockSum, stock) => stockSum + stock.quantity, 0);
            return sum + (totalStock * product.price);
          }, 0);
    
          await this.updateStatistics({
            totalProducts,
            outOfStock,
            totalStockValue
          });
        } catch (error) {
          console.error('Error recalculating statistics:', error);
          throw error;
        }
      },
      async updateProductMovement(product: Product, isAdding: boolean): Promise<void> {
        try {
          const currentStats = await this.getStatistics();
          const listToUpdate = isAdding 
            ? currentStats.mostAddedProducts 
            : currentStats.mostRemovedProducts;
          
          const existingEntry = listToUpdate.find((p: any) => p.name === product.name);
          
          if (existingEntry) {
            existingEntry.count += 1;
          } else {
            listToUpdate.push({ name: product.name, count: 1 });
          }
          
          // Sort by count in descending order and keep top 3
          listToUpdate.sort((a: any, b:any) => b.count - a.count);
          const topProducts = listToUpdate.slice(0, 3);
          
          await this.updateStatistics({
            [isAdding ? 'mostAddedProducts' : 'mostRemovedProducts']: topProducts
          });
        } catch (error) {
          console.error('Error updating product movement:', error);
          throw error;
        }
      }
    }