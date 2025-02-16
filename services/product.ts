import { Product, Stock } from "@/types/product";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  getCurrentProduct: async (productId: number): Promise<Product> => {
    try {
      const response = await fetch(`${BASE_URL}/products/${productId}`);
      const product = await response.json();
      return product;
    } catch (error) {
      console.error("Error fetching current product:", error);
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
      // Create edit record
      const editRecord = await createEditRecord();
      
      // Prepare product data with edit record
      const productWithEdit = {
        ...productData,
        editedBy: [editRecord]
      };

      const response = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productWithEdit),
      });

      if (!response.ok) throw new Error("Failed to add product");
      return response.json();
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },
  updateProduct: async (productId: number, data: Partial<Product>): Promise<Product> => {
    try {
      // Validate required fields
      if (!data.name?.trim()) {
        throw new Error('Product name is required');
      }

      // Validate stocks data
      if (data.stocks) {
        data.stocks.forEach((stock) => {
          if (stock.quantity < 0) {
            throw new Error('Stock quantity cannot be negative');
          }
          if (!stock.name || !stock.localisation.city) {
            throw new Error('Stock name and city are required');
          }
        });
      }

      // Validate price is a positive number
      if (data.price !== undefined && data.price < 0) {
        throw new Error('Price must be a positive number');
      }

      // Get current product data
      const currentProduct: Product = await productService.getCurrentProduct(productId);

       // Create new edit record
       const editRecord = await createEditRecord();

       // Prepare update data with new edit record
       const updateData = {
         ...Object.fromEntries(
           Object.entries(data).filter(([_, value]) => value !== undefined)
         ),
         editedBy: [...(currentProduct.editedBy || []), editRecord]
       };
 

      const response = await fetch(`${BASE_URL}/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('No data received from server');
      }

      return response.json();
    } catch (error) {
      console.error('Error updating product:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }
      throw new Error('Failed to update product');
    }
  },
  deleteProduct: async (productId: number): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },
};

/* 
** Helper functiions
*/

// Helper function to get current user
const getCurrentUser = async () => {
  try {
    const userString = await AsyncStorage.getItem("user");
    if (!userString) throw new Error("No user found");
    return JSON.parse(userString);
  } catch (error) {
    console.error("Error getting current user:", error);
    throw new Error("Failed to get current user");
  }
};

// Helper to create edit record
const createEditRecord = async () => {
  const user = await getCurrentUser();
  return {
    warehousemanId: user.id,
    at: new Date().toLocaleDateString()
  };
};


