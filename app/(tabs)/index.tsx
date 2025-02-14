import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Search } from "lucide-react-native";
import { Product } from "@/types/product";
import ProductDetailsModal from "@/components/products/ProductDetailModal";
import { productService } from "@/services/product";

export default function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const searchTerms = searchQuery.toLowerCase().split(" ");
    
    return products.filter(product => {
      const searchableText = [
        product.name,
        product.type,
        product.supplier,
        product.barcode,
        product.price.toString()
      ].join(" ").toLowerCase();

      // Match all search terms (AND logic)
      return searchTerms.every(term => searchableText.includes(term));
    });
  }, [products, searchQuery]);

  const getTotalStock = (stocks: Product["stocks"]) => {
    return stocks.reduce((total, stock) => total + stock.quantity, 0);
  };

  const getStockStatus = (stocks: Product["stocks"]) => {
    const total = getTotalStock(stocks);
    if (total === 0) return { color: "bg-red-500", text: "Out of Stock" };
    if (total < 10) return { color: "bg-yellow-500", text: "Low Stock" };
    return { color: "bg-green-500", text: "In Stock" };
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const stockStatus = getStockStatus(item.stocks);
    const totalStock = getTotalStock(item.stocks);

    return (
      <TouchableOpacity
        className={`m-2 p-4 rounded-lg ${
          isDark ? "bg-slate-800" : "bg-white"
        } shadow-md`}
        onPress={() => setSelectedProduct(item)}
      >
        <View className="flex-row">
          <Image
            source={{ uri: item.image }}
            className="w-20 h-20 rounded-md"
          />
          <View className="flex-1 ml-4">
            <Text
              className={`font-bold text-lg ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {item.name}
            </Text>
            <Text className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Type: {item.type}
            </Text>
            <Text className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>
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
      </TouchableOpacity>
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
    </View>
  );
}