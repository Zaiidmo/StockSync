// src/services/productService.ts

import { Product, Stock } from "@/types/product";

const BASE_URL = "http://192.168.1.28:3000";

export const productService = {
  fetchProducts: async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${BASE_URL}/products`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    } 
  },

  checkProduct: async (
    barcode: string
  ): Promise<{ status: boolean; product?: Product }> => {
    try {
      const response = await fetch(`${BASE_URL}/products?barcode=${barcode}`);
      const products = await response.json();

      if (products.length > 0) {
        return { status: true, product: products[0] };
      }
      return { status: false };
    } catch (error) {
      console.error("Error checking product:", error);
      throw error;
    }
  },

  addProduct: async (productData: Partial<Product>): Promise<Product> => {
    try {
      const response = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error("Failed to add product");
      return response.json();
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },

  updateStock: async (
    productId: number,
    warehouseId: number,
    quantity: number
  ): Promise<Product> => {
    try {
      // Get current product
      const response = await fetch(`${BASE_URL}/products/${productId}`);
      const product = await response.json();

      // Update stock quantity
      const stockIndex = product.stocks.findIndex(
        (s: Stock) => s.id === warehouseId
      );
      if (stockIndex >= 0) {
        product.stocks[stockIndex].quantity += quantity;
      }

      // Add edit history
      product.editedBy.push({
        warehousemanId: warehouseId,
        at: new Date().toISOString().split("T")[0],
      });

      // Update product
      const updateResponse = await fetch(`${BASE_URL}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (!updateResponse.ok) throw new Error("Failed to update stock");
      return updateResponse.json();
    } catch (error) {
      console.error("Error updating stock:", error);
      throw error;
    }
  },
};
