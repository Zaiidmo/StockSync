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
  ActivityIndicator,
  useColorScheme,
  Image,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  Truck, 
  Barcode, 
  Tag, 
  MapPin, 
  Percent,
  Image as ImageIcon,
  Camera
} from 'lucide-react-native';
import { useRoute } from '@react-navigation/native';
import { productService } from '../services/product';
import * as ImagePicker from 'expo-image-picker';
import { Product } from '@/types/product';

type FormData = {
  name: string;
  type: string;
  price: string;
  solde: string;
  supplier: string;
  image: string;
  stockName: string;
  quantity: string;
  city: string;
  latitude: string;
  longitude: string;
}

interface FormField {
  label: string;
  key: keyof FormData;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  icon: React.ReactNode;
  required?: boolean;
  section?: string;
}

const initialFormState: FormData = {
  name: '',
  type: '',
  price: '',
  solde: '',
  supplier: '',
  image: '',
  stockName: '',
  quantity: '',
  city: '',
  latitude: '',
  longitude: '',
};

const FormField = React.memo(({ 
  field, 
  value, 
  onChange, 
  isDark 
}: { 
  field: FormField; 
  value: string; 
  onChange: (text: string) => void; 
  isDark: boolean;
}) => (
  <View className="mb-4">
    <Text className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
      {field.label} {field.required && '*'}
    </Text>
    <View className={`flex-row items-center border rounded-xl p-2 ${
      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <View className="p-2">
        {field.icon}
      </View>
      <TextInput
        className={`flex-1 px-2 ${isDark ? 'text-white' : 'text-black'}`}
        placeholder={field.placeholder}
        placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
        value={value}
        onChangeText={onChange}
        keyboardType={field.keyboardType || 'default'}
      />
    </View>
  </View>
));

export default function AddProductScreen() {
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePickerPermission, requestImagePickerPermission] = ImagePicker.useCameraPermissions();
  const route = useRoute();
  const { barcode } = route.params as { barcode: string };
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formFields: FormField[] = [
    {
      label: 'Product Name',
      key: 'name',
      placeholder: 'Enter product name',
      icon: <Package size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />,
      required: true,
      section: 'Product Information'
    },
    {
      label: 'Type',
      key: 'type',
      placeholder: 'Enter product type',
      icon: <Tag size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />,
      required: true,
      section: 'Product Information'
    },
    {
      label: 'Price',
      key: 'price',
      placeholder: 'Enter price',
      keyboardType: 'decimal-pad',
      icon: <DollarSign size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />,
      required: true,
      section: 'Product Information'
    },
    {
      label: 'Discount',
      key: 'solde',
      placeholder: 'Enter discount percentage',
      keyboardType: 'decimal-pad',
      icon: <Percent size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />,
      section: 'Product Information'
    },
    {
      label: 'Supplier',
      key: 'supplier',
      placeholder: 'Enter supplier name',
      icon: <Truck size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />,
      required: true,
      section: 'Product Information'
    },
    {
      label: 'Stock Location Name',
      key: 'stockName',
      placeholder: 'Enter stock location name',
      icon: <Package size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />,
      required: true,
      section: 'Stock Information'
    },
    {
      label: 'Initial Quantity',
      key: 'quantity',
      placeholder: 'Enter initial quantity',
      keyboardType: 'numeric',
      icon: <Package size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />,
      required: true,
      section: 'Stock Information'
    },
    {
      label: 'City',
      key: 'city',
      placeholder: 'Enter city name',
      icon: <MapPin size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />,
      required: true,
      section: 'Stock Information'
    },
    {
      label: 'Latitude',
      key: 'latitude',
      placeholder: 'Enter latitude',
      keyboardType: 'decimal-pad',
      icon: <MapPin size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />,
      required: true,
      section: 'Stock Information'
    },
    {
      label: 'Longitude',
      key: 'longitude',
      placeholder: 'Enter longitude',
      keyboardType: 'decimal-pad',
      icon: <MapPin size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />,
      required: true,
      section: 'Stock Information'
    }
  ];

  const pickImage = async () => {
    if (!imagePickerPermission?.granted) {
      const permission = await requestImagePickerPermission();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos');
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    if (!imagePickerPermission?.granted) {
      const permission = await requestImagePickerPermission();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos');
        return;
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const validateForm = (): boolean => {
    // Check required fields
    const requiredFields = formFields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.key]);
    
    if (missingFields.length > 0) {
      Alert.alert('Error', 'Please fill all required fields');
      return false;
    }

    // Validate numeric fields
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }

    if (formData.solde && (isNaN(Number(formData.solde)) || Number(formData.solde) < 0 || Number(formData.solde) > 100)) {
      Alert.alert('Error', 'Discount must be between 0 and 100');
      return false;
    }

    if (isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return false;
    }

    if (isNaN(Number(formData.latitude)) || isNaN(Number(formData.longitude))) {
      Alert.alert('Error', 'Please enter valid coordinates');
      return false;
    }

    // Validate image
    if (!formData.image) {
      Alert.alert('Error', 'Please add a product image');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const newProduct: Omit<Product, 'id'> = {
        name: formData.name,
        type: formData.type,
        barcode,
        price: Number(formData.price),
        solde: formData.solde ? Number(formData.solde) : undefined,
        supplier: formData.supplier,
        image: formData.image,
        stocks: [
          {
            name: formData.stockName,
            quantity: Number(formData.quantity),
            localisation: {
              city: formData.city,
              latitude: Number(formData.latitude),
              longitude: Number(formData.longitude)
            }
          }
        ],
        editedBy: [
          {
            warehousemanId: 1, // Should come from auth context
            at: new Date().toISOString()
          }
        ]
      };

      await productService.addProduct(newProduct);
      Alert.alert(
        'Success',
        'Product added successfully',
        [{ text: 'OK', onPress: () => router.push('/') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  

  const renderSection = (sectionName: string) => {
    const sectionFields = formFields.filter(field => field.section === sectionName);
    
    return (
      <View className="mb-6">
        <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
          {sectionName}
        </Text>
        {sectionFields.map((field) => (
          <FormField
            key={field.key}
            field={field}
            value={formData[field.key]}
            onChange={(text) => setFormData(prev => ({ ...prev, [field.key]: text }))}
            isDark={isDark}
          />
        ))}
      </View>
    );
  };

  return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      >
        {/* Header */}
        <SafeAreaView className={`p-4 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
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
        </SafeAreaView>
  
        <ScrollView className="flex-1 p-4">
          {/* Barcode Display */}
          <View className={`flex-row items-center p-4 mb-6 rounded-xl ${
            isDark ? 'bg-slate-800' : 'bg-white'
          } shadow-sm`}>
            <Barcode size={24} color={isDark ? '#94a3b8' : '#3b82f6'} />
            <View className="ml-3">
              <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Barcode
              </Text>
              <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                {barcode}
              </Text>
            </View>
          </View>
  
          {/* Image Upload Section */}
          <View className="mb-6">
            <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              Product Image *
            </Text>
            <View className={`border-2 border-dashed rounded-xl p-4 ${
              isDark ? 'border-slate-700' : 'border-slate-300'
            }`}>
              {formData.image ? (
                <View>
                  <Image
                    source={{ uri: formData.image }}
                    className="w-full h-48 rounded-lg mb-4"
                    resizeMode="cover"
                  />
                  <View className="flex-row justify-center space-x-4">
                    <TouchableOpacity
                      onPress={takePhoto}
                      className="flex-row items-center justify-center bg-blue-500 px-4 py-2 rounded-lg"
                    >
                      <Camera size={20} color="white" className="mr-2" />
                      <Text className="text-white font-medium">New Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={pickImage}
                      className="flex-row items-center justify-center bg-blue-500 px-4 py-2 rounded-lg"
                    >
                      <ImageIcon size={20} color="white" className="mr-2" />
                      <Text className="text-white font-medium">Choose Photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="items-center">
                  <View className="mb-4">
                    <ImageIcon size={48} color={isDark ? '#94a3b8' : '#3b82f6'} />
                  </View>
                  <Text className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Add a product image
                  </Text>
                  <View className="flex-row space-x-4">
                    <TouchableOpacity
                      onPress={takePhoto}
                      className="flex-row items-center justify-center bg-blue-500 px-4 py-2 rounded-lg"
                    >
                      <Camera size={20} color="white" className="mr-2" />
                      <Text className="text-white font-medium">Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={pickImage}
                      className="flex-row items-center justify-center bg-blue-500 px-4 py-2 rounded-lg"
                    >
                      <ImageIcon size={20} color="white" className="mr-2" />
                      <Text className="text-white font-medium">Choose Photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
  
          {/* Form Sections */}
          {renderSection('Product Information')}
          {renderSection('Stock Information')}
  
          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className={`mt-4 mb-8 p-4 rounded-xl ${
              isLoading ? 'bg-blue-300' : 'bg-blue-500'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Add Product
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }