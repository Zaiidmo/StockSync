import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  RefreshControl,
  useColorScheme 
} from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Product {
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
    }
  }[];
  editedBy: {
    warehousemanId: number;
    at: string;
  }[];
}

export default function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://172.20.10.3:3000/products');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(text.toLowerCase()) ||
      product.type.toLowerCase().includes(text.toLowerCase()) ||
      product.supplier.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const getTotalStock = (stocks: Product['stocks']) => {
    return stocks.reduce((total, stock) => total + stock.quantity, 0);
  };

  const getStockStatus = (stocks: Product['stocks']) => {
    const total = getTotalStock(stocks);
    if (total === 0) return { color: 'bg-red-500', text: 'Out of Stock' };
    if (total < 10) return { color: 'bg-yellow-500', text: 'Low Stock' };
    return { color: 'bg-green-500', text: 'In Stock' };
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const stockStatus = getStockStatus(item.stocks);
    const totalStock = getTotalStock(item.stocks);

    return (
      <View className={`m-2 p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
        <View className="flex-row">
          <Image 
            source={{ uri: item.image }} 
            className="w-20 h-20 rounded-md"
          />
          <View className="flex-1 ml-4">
            <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-black'}`}>
              {item.name}
            </Text>
            <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Type: {item.type}
            </Text>
            <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Price: ${item.price}
            </Text>
            <View className="flex-row items-center mt-2">
              <View className={`px-2 py-1 rounded-full ${stockStatus.color}`}>
                <Text className="text-white text-sm">{stockStatus.text}</Text>
              </View>
              <Text className={`ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Total: {totalStock} units
              </Text>
            </View>
          </View>
        </View>
        
        <View className="mt-2">
          <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
            Stock Locations:
          </Text>
          {item.stocks.map((stock, index) => (
            <Text key={index} className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {stock.name} ({stock.localisation.city}): {stock.quantity} units
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <View className="p-4">
        <View className={`flex-row items-center px-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <Search size={20} color={isDark ? '#94a3b8' : '#64748b'} />
          <TextInput
            className={`flex-1 p-2 ml-2 ${isDark ? 'text-white' : 'text-black'}`}
            placeholder="Search products..."
            placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <TouchableOpacity>
            <SlidersHorizontal size={20} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}