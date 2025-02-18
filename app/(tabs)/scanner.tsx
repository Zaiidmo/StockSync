import {
  CameraView,
  BarcodeScanningResult,
  useCameraPermissions,
} from "expo-camera";
import { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Vibration,
  Dimensions,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import {  Camera, X } from "lucide-react-native";
import { Product } from "@/types/product";
import { productService } from "../../services/product";
import ProductDetailsModal from "@/components/products/ProductDetailModal";

export const screenOptions = {
  headerShown: true,
  headerBackVisible: false,
};

const ScannerScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastScanRef = useRef<number>(0);
  const SCAN_COOLDOWN = 2000;

  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const validateBarcode = (barcode: string): boolean => {
    // Basic validation for common barcode formats
    const cleanBarcode = barcode.trim();

    // Check if barcode contains only digits
    if (!/^\d+$/.test(cleanBarcode)) {
      return false;
    }

    // Check common barcode lengths
    const validLengths = [8, 12, 13, 14];
    if (!validLengths.includes(cleanBarcode.length)) {
      return false;
    }

    return true;
  };

  const handleScan = useCallback(
    async (barcode: string) => {
      if (!validateBarcode(barcode)) {
        Alert.alert(
          "Invalid Barcode",
          "The scanned barcode appears to be invalid. Please try again or enter manually.",
          [{ text: "OK", onPress: () => setIsScanning(true) }]
        );
        return;
      }

      setIsLoading(true);
      try {
        const result = await productService.checkProduct(barcode);
        if (result.status && result.product) {
          Vibration.vibrate(100); 
          setSelectedProduct(result.product);
        } else {
          Alert.alert(
            "Product Not Found",
            "Would you like to add this product?",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => {
                  setIsScanning(true);
                  setShowManualInput(false);
                },
              },
              {
                text: "Add Product",
                onPress: () =>
                  router.push({
                    pathname: "/AddProduct",
                    params: { barcode },
                  }),
              },
            ]
          );
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to check product. Please check your connection and try again."
        );
        setIsScanning(true);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const handleBarCodeScanned = useCallback(
    ({ data, type }: BarcodeScanningResult) => {
      const now = Date.now();
      if (now - lastScanRef.current < SCAN_COOLDOWN) {
        return;
      }

      lastScanRef.current = now;
      setIsScanning(false);
      handleScan(data);
    },
    [handleScan]
  );

  const handleManualSubmit = async () => {
    if (!manualBarcode.trim()) {
      Alert.alert("Error", "Please enter a barcode");
      return;
    }
    await handleScan(manualBarcode);
    setManualBarcode("");
    setShowManualInput(false);
  };

  if (!permission?.granted) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg text-center mb-4">
          Camera permission is required to scan barcodes
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { width } = Dimensions.get("window");
  const SCAN_AREA_SIZE = width * 0.7;

  return (
    <View className="flex-1">
      <CameraView
        className="flex-1"
        onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code39",
            "code128",
          ],
        }}
      >
        {/* Scanning overlay */}
        <View className="flex-1 bg-black/50">
          <View className="flex-1 justify-center items-center">
            {/* Scanning area */}
            <View
              style={{
                width: SCAN_AREA_SIZE,
                height: SCAN_AREA_SIZE,
              }}
              className="border-2 border-white rounded-lg overflow-hidden"
            >
              <View className="flex-1 bg-transparent" />
              {isScanning && (
                <View
                  className="h-0.5 bg-blue-500 absolute w-full"
                  style={{
                    top: "50%",
                    shadowColor: "#3b82f6",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 5,
                  }}
                />
              )}
            </View>

            {/* Guidance text */}
            <Text className="text-white text-center mt-4 px-4">
              {isScanning
                ? "Position barcode within the frame"
                : "Processing barcode..."}
            </Text>
          </View>

          {/* Control buttons */}
          <View className="flex-row justify-center gap-4 px-4 mb-32">
            <TouchableOpacity
              className={`flex-1 ${isDark ? "bg-[#1f61b7]/80" : "bg-blue-600"} p-4 rounded-xl items-center flex-row justify-center space-x-2`}
              onPress={() => setIsScanning(true)}
            >
              <Camera size={20} color="white" />
              <Text className="text-white font-bold">Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 ${isDark ? "bg-[#1f61b7]/80" : "bg-blue-600"} p-4 rounded-xl items-center flex-row justify-center space-x-2`}
              onPress={() => setShowManualInput(!showManualInput)}
            >
              <X size={20} color="white" />
              <Text className="text-white font-bold">Manual</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading indicator */}
        {isLoading && (
          <View className="absolute top-1/2 left-0 right-0 items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-white mt-2">Processing...</Text>
          </View>
        )}
      </CameraView>

      {/* Manual input modal */}
      {showManualInput && (
        <View
          className={`absolute h-full left-0 right-0 ${
            isDark ? "bg-[#111827]" : "bg-[#F5F7FA]"
          } p-4 flex items-center justify-center`}
        >
          <TextInput
            className={`shadow-xl ${
              isDark ? "bg-[#1F2937] text-white" : "bg-white border-1 text-black"
            } rounded-xl p-4 mb-4 w-full`}
            placeholder="Enter barcode number"
            placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
            value={manualBarcode}
            keyboardType="numeric"
            onChangeText={setManualBarcode}
            maxLength={14}
          />
          <View className="flex-row gap-4">
            <TouchableOpacity
              className="bg-red-500/80 p-4 rounded-xl items-center"
              onPress={() => setShowManualInput(false)}
            >
              <Text className="text-white font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`${isDark ? "bg-[#1f61b7]/80" : "bg-[#3b82f6]/80" } p-4 rounded-xl items-center`}
              onPress={handleManualSubmit}
            >
              <Text className="text-white font-bold">Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ProductDetailsModal
        product={selectedProduct}
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isDark={isDark}
      />
    </View>
  );
};

export default ScannerScreen;
