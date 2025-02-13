import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Package, DollarSign, Truck, Barcode } from 'lucide-react-native';
import { useRoute } from '@react-navigation/native';

interface FormField {
  label: string;
  key: keyof typeof initialFormState;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  icon: React.ReactNode;
}

const initialFormState = {
  name: '',
  type: '',
  price: '',
  supplier: '',
  quantity: '',
};

export default function AddProductScreen({ isDark }: { isDark: boolean }) {
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
  const { barcode } = route.params as { barcode: string };
    const router = useRouter();

  const formFields: FormField[] = [
    {
      label: 'Product Name',
      key: 'name',
      placeholder: 'Enter product name',
      icon: <Package size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />
    },
    {
      label: 'Type',
      key: 'type',
      placeholder: 'Enter product type',
      icon: <Package size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />
    },
    {
      label: 'Price',
      key: 'price',
      placeholder: 'Enter price',
      keyboardType: 'decimal-pad',
      icon: <DollarSign size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />
    },
    {
      label: 'Supplier',
      key: 'supplier',
      placeholder: 'Enter supplier name',
      icon: <Truck size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />
    },
    {
      label: 'Initial Quantity',
      key: 'quantity',
      placeholder: 'Enter initial quantity',
      keyboardType: 'numeric',
      icon: <Package size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />
    }
  ];

  const FormField = ({ field }: { field: FormField }) => (
    <View className="mb-4">
      <Text className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        {field.label} *
      </Text>
      <View className={`flex-row items-center border rounded-xl p-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <View className="p-2">
          {field.icon}
        </View>
        <TextInput
          className={`flex-1 px-2 ${isDark ? 'text-white' : 'text-black'}`}
          placeholder={field.placeholder}
          placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
          value={formData[field.key]}
          onChangeText={(text) => setFormData(prev => ({ ...prev, [field.key]: text }))}
          keyboardType={field.keyboardType || 'default'}
        />
      </View>
    </View>
  );

  const handleSubmit = async () => {
    // Validation logic here
    setIsLoading(true);
    try {
      // Submit logic here
      Alert.alert('Success', 'Product added successfully');
      router.push('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
    >
      {/* Header */}
      <View className={`p-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            Add New Product
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Barcode Display */}
        <View className={`flex-row items-center p-4 mb-6 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <Barcode size={24} color={isDark ? '#94a3b8' : '#3b82f6'} />
          <View className="ml-3">
            <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Barcode
            </Text>
            <Text className={`text-lg font-semibold text-black`}>
              {barcode}
            </Text>
          </View>
        </View>

        {/* Form Fields */}
        {formFields.map((field) => (
          <FormField key={field.key} field={field} />
        ))}

        {/* Submit Button */}
        <TouchableOpacity
          className={`mt-6 p-4 rounded-xl bg-blue-500 ${isLoading ? 'opacity-70' : ''}`}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-center">Add Product</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}