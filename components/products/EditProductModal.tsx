import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Minus, Plus, X } from 'lucide-react-native';
import { Product, StockFormData } from '@/types/product';
import { productService } from '@/services/product';

interface EditProductModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onUpdate: (updatedProduct: Product) => void;
  isDark: boolean;
}

export default function EditProductModal({
  product,
  visible,
  onClose,
  onUpdate,
  isDark,
}: EditProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [stocksData, setStocksData] = useState<Product['stocks']>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        type: product.type,
        price: product.price,
        supplier: product.supplier,
        barcode: product.barcode,
      });
      // Keep the full stock data structure including localisation
      setStocksData(product.stocks.map(stock => ({
        ...stock,
        quantity: stock.quantity,
      })));
    }
  }, [product]);

  const handleUpdateStock = (index: number, quantity: number) => {
    setStocksData(prev => {
      const newStocks = [...prev];
      newStocks[index] = {
        ...newStocks[index],
        quantity: Math.max(0, quantity), // Prevent negative quantities
      };
      return newStocks;
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }

    if (formData.price !== undefined && formData.price < 0) {
      Alert.alert('Error', 'Price must be a positive number');
      return false;
    }

    // Validate stocks
    for (const stock of stocksData) {
      if (stock.quantity < 0) {
        Alert.alert('Error', 'Stock quantity cannot be negative');
        return false;
      }
      if (!stock.name || !stock.localisation?.city) {
        Alert.alert('Error', 'Stock name and city are required');
        return false;
      }
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!product || isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updatedProduct = await productService.updateProduct(product.id, {
        ...formData,
        stocks: stocksData, // Include the full stocks data
      });
      
      onUpdate(updatedProduct);
      onClose();
      Alert.alert('Success', 'Product updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <View
          className={`rounded-t-3xl p-6 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          } shadow-lg`}
          style={{ maxHeight: '80%' }}
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text
              className={`text-xl font-bold ${
                isDark ? 'text-white' : 'text-black'
              }`}
            >
              Edit Product
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-full bg-slate-100"
            >
              <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="space-y-4">
              <View>
                <Text
                  className={`text-sm mb-1 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Name
                </Text>
                <TextInput
                  className={`p-3 rounded-lg ${
                    isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-black'
                  }`}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                />
              </View>

              <View>
                <Text
                  className={`text-sm mb-1 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Type
                </Text>
                <TextInput
                  className={`p-3 rounded-lg ${
                    isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-black'
                  }`}
                  value={formData.type}
                  onChangeText={(text) => setFormData({ ...formData, type: text })}
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                />
              </View>

              <View>
                <Text
                  className={`text-sm mb-1 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Price
                </Text>
                <TextInput
                  className={`p-3 rounded-lg ${
                    isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-black'
                  }`}
                  value={formData.price?.toString()}
                  onChangeText={(text) =>
                    setFormData({ ...formData, price: parseFloat(text) || 0 })
                  }
                  keyboardType="decimal-pad"
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                />
              </View>

              <View>
                <Text
                  className={`text-sm mb-1 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Supplier
                </Text>
                <TextInput
                  className={`p-3 rounded-lg ${
                    isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-black'
                  }`}
                  value={formData.supplier}
                  onChangeText={(text) =>
                    setFormData({ ...formData, supplier: text })
                  }
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                />
              </View>

              <View>
                <Text
                  className={`text-sm mb-1 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Barcode
                </Text>
                <TextInput
                  className={`p-3 rounded-lg ${
                    isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-black'
                  }`}
                  value={formData.barcode}
                  onChangeText={(text) =>
                    setFormData({ ...formData, barcode: text })
                  }
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                />
              </View>

              {/* Stock management section */}
              <View className="mt-6">
                <Text
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-white' : 'text-black'
                  }`}
                >
                  Stock Management
                </Text>
                {stocksData.map((stock, index) => (
                  <View
                    key={`${stock.name}-${index}`}
                    className={`p-4 rounded-lg mb-4 ${
                      isDark ? 'bg-slate-700' : 'bg-slate-100'
                    }`}
                  >
                    <Text
                      className={`font-semibold mb-2 ${
                        isDark ? 'text-white' : 'text-black'
                      }`}
                    >
                      {stock.name} - {stock.localisation.city}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <TouchableOpacity
                        onPress={() =>
                          handleUpdateStock(index, stock.quantity - 1)
                        }
                        className="bg-blue-500 p-2 rounded-full"
                      >
                        <Minus size={20} color="white" />
                      </TouchableOpacity>
                      <TextInput
                        className={`flex-1 text-center mx-4 p-2 rounded ${
                          isDark ? 'text-white' : 'text-black'
                        }`}
                        value={stock.quantity.toString()}
                        onChangeText={(text) =>
                          handleUpdateStock(index, parseInt(text) || 0)
                        }
                        keyboardType="numeric"
                      />
                      <TouchableOpacity
                        onPress={() =>
                          handleUpdateStock(index, stock.quantity + 1)
                        }
                        className="bg-blue-500 p-2 rounded-full"
                      >
                        <Plus size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleUpdate}
                className="bg-blue-500 p-4 rounded-lg mt-6"
              >
                <Text className="text-white text-center font-semibold">
                  Update Product
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}