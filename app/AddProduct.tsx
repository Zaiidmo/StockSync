import React, { useState } from "react";
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
  SafeAreaView,
  SafeAreaViewBase,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Truck,
  Barcode,
  Tag,
  MapPin,
  Image as ImageIcon,
  Camera,
  ImageDown,
  CameraIcon,
} from "lucide-react-native";
import { useRoute } from "@react-navigation/native";
import { productService } from "../services/product";
import * as ImagePicker from "expo-image-picker";
import { Product } from "@/types/product";

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
};

interface FormField {
  label: string;
  key: keyof FormData;
  placeholder: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  icon: React.ReactNode;
  required?: boolean;
  section?: string;
}

const initialFormState: FormData = {
  name: "",
  type: "",
  price: "",
  solde: "",
  supplier: "",
  image: "",
  stockName: "",
  quantity: "",
  city: "",
  latitude: "",
  longitude: "",
};

const FormField = React.memo(
  ({
    field,
    value,
    onChange,
    isDark,
  }: {
    field: FormField;
    value: string;
    onChange: (text: string) => void;
    isDark: boolean;
  }) => (
    <View className="mb-4">
      <Text
        className={`text-sm font-medium mb-1 ${
          isDark ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {field.label} {field.required && "*"}
      </Text>
      <View
        className={`flex-row items-center rounded-xl p-2 ${
          isDark ? "bg-[#1F2937]" : "bg-[#F5F7FA] "
        }`}
      >
        <View className="p-2">{field.icon}</View>
        <TextInput
          className={`flex-1 px-2 ${isDark ? "text-white" : "text-black"}`}
          placeholder={field.placeholder}
          placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
          value={value}
          onChangeText={onChange}
          keyboardType={field.keyboardType || "default"}
        />
      </View>
    </View>
  )
);

export default function AddProductScreen() {
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
  const { barcode } = route.params as { barcode: string };
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const formFields: FormField[] = [
    {
      label: "Product Imge ",
      key: "image",
      placeholder: "Enter product Image Url",
      icon: <CameraIcon size={20} color={isDark ? "#94a3b8" : "#3b82f6"} />,
      required: true,
      section: "Product Information",
    },
    {
      label: "Product Name",
      key: "name",
      placeholder: "Enter product name",
      icon: <Package size={20} color={isDark ? "#94a3b8" : "#3b82f6"} />,
      required: true,
      section: "Product Information",
    },
    {
      label: "Type",
      key: "type",
      placeholder: "Enter product type",
      icon: <Tag size={20} color={isDark ? "#94a3b8" : "#3b82f6"} />,
      required: true,
      section: "Product Information",
    },
    {
      label: "Price",
      key: "price",
      placeholder: "Enter price",
      keyboardType: "decimal-pad",
      icon: <DollarSign size={20} color={isDark ? "#94a3b8" : "#3b82f6"} />,
      required: true,
      section: "Product Information",
    },
    {
      label: "Supplier",
      key: "supplier",
      placeholder: "Enter supplier name",
      icon: <Truck size={20} color={isDark ? "#94a3b8" : "#3b82f6"} />,
      required: true,
      section: "Product Information",
    },
    {
      label: "Stock Location Name",
      key: "stockName",
      placeholder: "Enter stock location name",
      icon: <Package size={20} color={isDark ? "#94a3b8" : "#3b82f6"} />,
      required: true,
      section: "Stock Information",
    },
    {
      label: "Initial Quantity",
      key: "quantity",
      placeholder: "Enter initial quantity",
      keyboardType: "numeric",
      icon: <Package size={20} color={isDark ? "#94a3b8" : "#3b82f6"} />,
      required: true,
      section: "Stock Information",
    },
    {
      label: "City",
      key: "city",
      placeholder: "Enter city name",
      icon: <MapPin size={20} color={isDark ? "#94a3b8" : "#3b82f6"} />,
      required: true,
      section: "Stock Information",
    },
    {
      label: "Latitude",
      key: "latitude",
      placeholder: "Enter latitude",
      keyboardType: "decimal-pad",
      icon: <MapPin size={20} color={isDark ? "#94a3b8" : "#3b82f6"} />,
      required: true,
      section: "Stock Information",
    },
    {
      label: "Longitude",
      key: "longitude",
      placeholder: "Enter longitude",
      keyboardType: "decimal-pad",
      icon: <MapPin size={20} color={isDark ? "#94a3b8" : "#3b82f6"} />,
      required: true,
      section: "Stock Information",
    },
  ];

  const validateForm = (): boolean => {
    // Check required fields
    const requiredFields = formFields.filter((field) => field.required);
    const missingFields = requiredFields.filter(
      (field) => !formData[field.key]
    );

    if (missingFields.length > 0) {
      Alert.alert("Error", "Please fill all required fields");
      return false;
    }

    // Validate numeric fields
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return false;
    }

    if (isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      Alert.alert("Error", "Please enter a valid quantity");
      return false;
    }

    if (isNaN(Number(formData.latitude)) || isNaN(Number(formData.longitude))) {
      Alert.alert("Error", "Please enter valid coordinates");
      return false;
    }

    // Validate image
    if (!formData.image) {
      Alert.alert("Error", "Please add a product image");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const newProduct: Omit<Product, "id"> = {
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
              longitude: Number(formData.longitude),
            },
          },
        ],
        editedBy: [
          {
            warehousemanId: 1, // Should come from auth context
            at: new Date().toISOString(),
          },
        ],
      };

      await productService.addProduct(newProduct);
      Alert.alert("Success", "Product added successfully", [
        { text: "OK", onPress: () => router.push("/") },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to add product");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = (sectionName: string) => {
    const sectionFields = formFields.filter(
      (field) => field.section === sectionName
    );

    return (
      <View className="mb-6">
        <Text
          className={`text-lg font-bold mb-4 ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          {sectionName}
        </Text>
        {sectionFields.map((field) => (
          <FormField
            key={field.key}
            field={field}
            value={formData[field.key]}
            onChange={(text) =>
              setFormData((prev) => ({ ...prev, [field.key]: text }))
            }
            isDark={isDark}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1" >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className={`flex-1 ${isDark ? "bg-[#111827]" : "bg-white"}`}
      >
        {/* Header */}
        <View
          className={`p-4 ${isDark ? "bg-black" : "bg-white"} shadow-sm`}
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center"
            >
              <ArrowLeft size={24} color={isDark ? "#fff" : "#000"} />
            </TouchableOpacity>
            <Text
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              Add New Product
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
  
        <ScrollView className="flex-1 p-4">
          {/* Barcode Display */}
          <View
            className={`flex-row items-center p-4 mb-6 rounded-xl ${
              isDark ? "bg-[#1F2937]" : "bg-[#F5F7FA] "
            } shadow-sm`}
          >
            <Barcode size={24} color={isDark ? "#94a3b8" : "#3b82f6"} />
            <View className="ml-3">
              <Text
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Barcode
              </Text>
              <Text
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                {barcode}
              </Text>
            </View>
          </View>
  
          {/* Form Sections */}
          {renderSection("Product Information")}
          {renderSection("Stock Information")}
  
          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className={`mt-4 mb-8 p-4 rounded-xl ${
              isLoading ? "bg-[#1f61b7]" : "bg-[#1f61b7]/80"
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
    </SafeAreaView>
  );
}
