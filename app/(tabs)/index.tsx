import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Pressable,
} from "react-native";
import { Search, MoreVertical, Sliders } from "lucide-react-native";
import { Product } from "@/types/product";
import ProductDetailsModal from "@/components/products/ProductDetailModal";
import EditProductModal from "@/components/products/EditProductModal";
import { productService } from "@/services/product";
import FilterModal from "@/components/products/FilterModal";

export default function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    supplier: "",
    type: "",
    stockStatus: "",
    minPrice: "",
    maxPrice: "",
  });

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const fetchedProducts = await productService.fetchProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Extract unique product types and suppliers
  const productTypes = useMemo(() => {
    const types = new Set<string>();
    products.forEach((product) => types.add(product.type));
    return Array.from(types);
  }, [products]);

  const suppliers = useMemo(() => {
    const supplierSet = new Set<string>();
    products.forEach((product) => supplierSet.add(product.supplier));
    return Array.from(supplierSet);
  }, [products]);

  // Calculate total stock for a product
  const getTotalStock = (stocks: Product["stocks"]) => {
    return stocks.reduce((total, stock) => total + stock.quantity, 0);
  };

  // Determine stock status based on total stock
  const getStockStatus = (totalStock: number) => {
    if (totalStock === 0) return { color: "bg-red-500", text: "Out of Stock" };
    if (totalStock < 10) return { color: "bg-yellow-500", text: "Low Stock" };
    return { color: "bg-green-500", text: "In Stock" };
  };
  
  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().split(" ");
      filtered = filtered.filter((product) => {
        const searchableText = [
          product.name,
          product.type,
          product.supplier,
          product.barcode,
          product.price.toString(),
        ]
          .join(" ")
          .toLowerCase();

        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    if (filters.type) {
      filtered = filtered.filter((product) => product.type === filters.type);
    }

    if (filters.supplier) {
      filtered = filtered.filter((product) => product.supplier === filters.supplier);
    }

    if (filters.stockStatus) {
      filtered = filtered.filter((product) => {
        const totalStock = getTotalStock(product.stocks);
        if (filters.stockStatus === "out_of_stock") return totalStock === 0;
        if (filters.stockStatus === "low_stock") return totalStock < 10;
        return totalStock >= 10;
      });
    }

    if (filters.minPrice) {
      filtered = filtered.filter((product) => product.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((product) => product.price <= parseFloat(filters.maxPrice));
    }

    return filtered;
  }, [products, searchQuery, filters]);

  const handleDelete = async (productId: number) => {
    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      Alert.alert("Error", "Failed to delete product");
    }
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleLongPress = (product: Product) => {
    Alert.alert("Product Options", "Choose an action", [
      {
        text: "Edit",
        onPress: () => setEditingProduct(product),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "Delete Product",
            "Are you sure you want to delete this product?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => handleDelete(product.id),
              },
            ]
          );
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

 // Render product item
 const renderProduct = ({ item }: { item: Product }) => {
  const totalStock = getTotalStock(item.stocks);
  const stockStatus = getStockStatus(totalStock);

  return (
    <Pressable
      onLongPress={() => handleLongPress(item)}
      onPress={() => setSelectedProduct(item)}
      className={`m-2 p-4 rounded-lg ${
        isDark ? "bg-slate-800" : "bg-white"
      } shadow-md`}
      android_ripple={{ color: isDark ? "#ffffff20" : "#00000020" }}
    >
      <View className="flex-row">
        <Image
          source={{ uri: item.image }}
          className="w-20 h-20 rounded-md"
        />
        <View className="flex-1 ml-4">
          <View className="flex-row justify-between items-start">
            <Text
              className={`font-bold text-lg flex-1 ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={() => handleLongPress(item)}
              className="p-1"
            >
              <MoreVertical
                size={20}
                color={isDark ? "#94a3b8" : "#64748b"}
              />
            </TouchableOpacity>
          </View>
          <Text
            className={`${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            Type: {item.type}
          </Text>
          <Text
            className={`${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            Supplier: {item.supplier}
          </Text>
          <Text
            className={`${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            Price: ${item.price}
          </Text>
          <View className="flex-row items-center mt-2">
            <View className={`px-2 py-1 rounded-full ${stockStatus.color}`}>
              <Text className="text-white text-sm">{stockStatus.text}</Text>
            </View>
            <Text
              className={`ml-2 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Total: {totalStock} units
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

return (
  <View className={`flex-1 ${isDark ? "bg-[#010326]" : "bg-slate-50"}`}>
    <View className="p-4">
      <View
        className={`flex-row items-center px-4 rounded-lg ${
          isDark ? "bg-[#202020]" : "bg-white"
        }`}
      >
        <Search size={20} color={isDark ? "#94a3b8" : "#64748b"} />
        <TextInput
          className={`flex-1 p-2 ml-2 ${
            isDark ? "text-white" : "text-black"
          }`}
          placeholder="Search by name, type, supp..."
          placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          className="p-2"
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Sliders size={20} color={isDark ? "#94a3b8" : "#64748b"} />
        </TouchableOpacity>
      </View>
    </View>
    <FlatList
      data={filteredProducts}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingBottom: 20 }}
      onRefresh={() => {
        setRefreshing(true);
        fetchProducts();
        setRefreshing(false);
      }}
      refreshing={refreshing}
      ListEmptyComponent={
        <View className="flex-1 justify-center items-center p-4">
          <Text
            className={`text-lg ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {isLoading ? "Loading..." : "No products found"}
          </Text>
        </View>
      }
    />
    <ProductDetailsModal
      product={selectedProduct}
      visible={!!selectedProduct}
      onClose={() => setSelectedProduct(null)}
      isDark={isDark}
    />
    <EditProductModal
      product={editingProduct}
      visible={!!editingProduct}
      onClose={() => setEditingProduct(null)}
      onUpdate={handleUpdateProduct}
      isDark={isDark}
    />
    <FilterModal
      isFilterModalVisible={isFilterModalVisible}
      setIsFilterModalVisible={setIsFilterModalVisible}
      filters={filters}
      setFilters={setFilters}
      isDark={isDark}
      productTypes={productTypes}
      suppliers={suppliers}
    />
  </View>
);
}