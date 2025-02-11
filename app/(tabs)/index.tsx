import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  RefreshControl,
  useColorScheme,
  Modal,
  ScrollView 
} from 'react-native';
import { Search, SlidersHorizontal, X, ArrowLeft, MapPin, Package, DollarSign, Truck } from 'lucide-react-native';
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

interface FilterOptions {
  type: string[];
  supplier: string[];
  stockStatus: ('In Stock' | 'Low Stock' | 'Out of Stock')[];
}

export default function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    type: [],
    supplier: [],
    stockStatus: []
  });
  
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

  const applyFilters = (query: string = searchQuery) => {
    let filtered = products;

    // Apply search query
    if (query) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.type.toLowerCase().includes(query.toLowerCase()) ||
        product.supplier.toLowerCase().includes(query.toLowerCase()) ||
        product.barcode.includes(query)
      );
    }

    // Apply type filters
    if (filters.type.length > 0) {
      filtered = filtered.filter(product => filters.type.includes(product.type));
    }

    // Apply supplier filters
    if (filters.supplier.length > 0) {
      filtered = filtered.filter(product => filters.supplier.includes(product.supplier));
    }

    // Apply stock status filters
    if (filters.stockStatus.length > 0) {
      filtered = filtered.filter(product => {
        const status = getStockStatus(product.stocks).text;
        return filters.stockStatus.includes(status);
      });
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(text);
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

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View className={`flex-1 ${isDark ? 'bg-[#1f61b7]' : 'bg-slate-50/95'}`}>
        <View className="p-4">
          <View className="flex-row justify-between items-center">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              Filters
            </Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          <ScrollView className="mt-4">
            {/* Type Filter */}
            <FilterSection
              title="Product Type"
              options={Array.from(new Set(products.map(p => p.type)))}
              selected={filters.type}
              onSelect={(value) => {
                setFilters(prev => ({
                  ...prev,
                  type: prev.type.includes(value)
                    ? prev.type.filter(t => t !== value)
                    : [...prev.type, value]
                }));
              }}
            />

            {/* Supplier Filter */}
            <FilterSection
              title="Supplier"
              options={Array.from(new Set(products.map(p => p.supplier)))}
              selected={filters.supplier}
              onSelect={(value) => {
                setFilters(prev => ({
                  ...prev,
                  supplier: prev.supplier.includes(value)
                    ? prev.supplier.filter(s => s !== value)
                    : [...prev.supplier, value]
                }));
              }}
            />

            {/* Stock Status Filter */}
            <FilterSection
              title="Stock Status"
              options={['In Stock', 'Low Stock', 'Out of Stock']}
              selected={filters.stockStatus}
              onSelect={(value) => {
                setFilters(prev => ({
                  ...prev,
                  stockStatus: prev.stockStatus.includes(value as any)
                    ? prev.stockStatus.filter(s => s !== value)
                    : [...prev.stockStatus, value as any]
                }));
              }}
            />
          </ScrollView>

          <View className="flex-row justify-between mt-4">
            <TouchableOpacity
              className="px-4 py-2 rounded-lg bg-slate-300"
              onPress={() => {
                setFilters({ type: [], supplier: [], stockStatus: [] });
                applyFilters();
              }}
            >
              <Text>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-2 rounded-lg bg-blue-500"
              onPress={() => {
                applyFilters();
                setShowFilters(false);
              }}
            >
              <Text className="text-white">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const FilterSection = ({ 
    title, 
    options, 
    selected, 
    onSelect 
  }: { 
    title: string; 
    options: string[]; 
    selected: string[]; 
    onSelect: (value: string) => void; 
  }) => (
    <View className="mb-6">
      <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
        {title}
      </Text>
      <View className="flex-row flex-wrap">
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            className={`m-1 px-3 py-2 rounded-full ${
              selected.includes(option)
                ? 'bg-blue-500'
                : isDark ? 'bg-slate-700' : 'bg-slate-200'
            }`}
            onPress={() => onSelect(option)}
          >
            <Text className={selected.includes(option) ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-700'}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const ProductDetailsModal = () => {
    if (!selectedProduct) return null;

    return (
      <Modal
        visible={!!selectedProduct}
        animationType="slide"
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View className={`flex-1 ${isDark ? 'bg-[#1f61b7]' : 'bg-slate-50'}`}>
          <View className="p-4">
            <TouchableOpacity 
              onPress={() => setSelectedProduct(null)}
              className="mb-4"
            >
              <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            
            <ScrollView>
              <Image 
                source={{ uri: selectedProduct.image }} 
                className="w-full h-64 rounded-lg"
              />
              
              <View className="mt-4">
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  {selectedProduct.name}
                </Text>
                
                <View className="mt-4 space-y-3">
                  <DetailRow 
                    icon={<Package size={20} color={isDark ? '#94a3b8' : '#64748b'} />}
                    label="Type"
                    value={selectedProduct.type}
                  />
                  <DetailRow 
                    icon={<DollarSign size={20} color={isDark ? '#94a3b8' : '#64748b'} />}
                    label="Price"
                    value={`$${selectedProduct.price}`}
                  />
                  <DetailRow 
                    icon={<Truck size={20} color={isDark ? '#94a3b8' : '#64748b'} />}
                    label="Supplier"
                    value={selectedProduct.supplier}
                  />
                  <DetailRow 
                    icon={<MapPin size={20} color={isDark ? '#94a3b8' : '#64748b'} />}
                    label="Barcode"
                    value={selectedProduct.barcode}
                  />
                </View>

                <View className="mt-6">
                  <Text className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
                    Stock Information
                  </Text>
                  {selectedProduct.stocks.map((stock, index) => (
                    <View 
                      key={stock.id} 
                      className={`p-3 rounded-lg mb-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                        {stock.name}
                      </Text>
                      <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Location: {stock.localisation.city}
                      </Text>
                      <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Quantity: {stock.quantity} units
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="mt-6">
                  <Text className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
                    Edit History
                  </Text>
                  {selectedProduct.editedBy.map((edit, index) => (
                    <View 
                      key={index}
                      className={`p-3 rounded-lg mb-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Editor ID: {edit.warehousemanId}
                      </Text>
                      <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Date: {new Date(edit.at).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <View className="flex-row items-center">
      {icon}
      <Text className={`ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        {label}: <Text className="font-semibold">{value}</Text>
      </Text>
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => {
    const stockStatus = getStockStatus(item.stocks);
    const totalStock = getTotalStock(item.stocks);

    return (
      <TouchableOpacity 
        className={`m-2 p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md`}
        onPress={() => setSelectedProduct(item)}
      >
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
      </TouchableOpacity>

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
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <SlidersHorizontal size={20} color={isDark ? '#94a3b8' : '#64748b'} />
        </TouchableOpacity>
      </View>

      {/* Active Filters Display */}
      {(filters.type.length > 0 || filters.supplier.length > 0 || filters.stockStatus.length > 0) && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mt-2"
        >
          {filters.type.map(type => (
            <Chip 
              key={`type-${type}`} 
              label={type}
              onRemove={() => {
                setFilters(prev => ({
                  ...prev,
                  type: prev.type.filter(t => t !== type)
                }));
                applyFilters();
              }}
            />
          ))}
          {filters.supplier.map(supplier => (
            <Chip 
              key={`supplier-${supplier}`} 
              label={supplier}
              onRemove={() => {
                setFilters(prev => ({
                  ...prev,
                  supplier: prev.supplier.filter(s => s !== supplier)
                }));
                applyFilters();
              }}
            />
          ))}
          {filters.stockStatus.map(status => (
            <Chip 
              key={`status-${status}`} 
              label={status}
              onRemove={() => {
                setFilters(prev => ({
                  ...prev,
                  stockStatus: prev.stockStatus.filter(s => s !== status)
                }));
                applyFilters();
              }}
            />
          ))}
        </ScrollView>
      )}
    </View>

    <FlatList
      data={filteredProducts}
      renderItem={renderProduct}
      keyExtractor={item => item.id.toString()}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 20 }}
      ListEmptyComponent={
        <View className="flex-1 justify-center items-center p-4">
          <Text className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            No products found
          </Text>
        </View>
      }
    />

    <FilterModal />
    <ProductDetailsModal />
  </View>
);
}

// Chip component for displaying active filters
const Chip = ({ 
label, 
onRemove 
}: { 
label: string; 
onRemove: () => void; 
}) => {
const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';

return (
  <View className={`flex-row items-center px-3 py-1 mr-2 rounded-full ${
    isDark ? 'bg-slate-700' : 'bg-slate-200'
  }`}>
    <Text className={`mr-2 ${isDark ? 'text-white' : 'text-black'}`}>
      {label}
    </Text>
    <TouchableOpacity onPress={onRemove}>
      <X size={16} color={isDark ? '#fff' : '#000'} />
    </TouchableOpacity>
  </View>
);
};