import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import {
  DollarSign,
  Truck,
  Barcode,
  ArrowLeft,
  Box,
  MapPin,
  Calendar,
} from "lucide-react-native";
import { ProductDetailsModalProps } from "@/types/product";
import { User } from "@/types/auth";
import { productService } from "@/services/product";

const ProductDetailsModal = ({
  product,
  visible,
  onClose,
  isDark,
}: ProductDetailsModalProps) => {
  if (!product) return null;

  const [warehousmen, setWarehousmen] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWarehousemen = async () => {
      if (!product.id) return;

      setIsLoading(true);
      try {
        const warehousemenData = await productService.getWareHousmen(
          product.id
        );
        // console.log("Fetched warehousmen:", warehousemenData);
        setWarehousmen(warehousemenData);
      } catch (error) {
        console.error("Error fetching warehousemen:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarehousemen();
  }, [product.id]);

  const DetailRow = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <View className="flex-row items-center bg-opacity-50 rounded-lg p-3 mb-2">
      <View
        className={`p-2 rounded-full ${isDark ? "bg-slate-800" : "bg-blue-50"}`}
      >
        {icon}
      </View>
      <View className="ml-3">
        <Text
          className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {label}
        </Text>
        <Text
          className={`text-base font-semibold ${
            isDark ? "text-white" : "text-slate-800"
          }`}
        >
          {value}
        </Text>
      </View>
    </View>
  );
  const WarehousemanCard = ({ editedByList }: { editedByList: any[] }) => {
    if (!editedByList || editedByList.length === 0) {
      return null;
    }

    // Sort entries by date, most recent first
    const sortedEntries = [...editedByList].sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
    );

    return (
      <View>
        {sortedEntries.map((editedBy, index) => {
          // Find the warehouseman details from the warehousmen array
          const warehouseman = warehousmen.find(
            (w) =>
              // Convert both to strings to handle potential type mismatches
              w.id.toString() === editedBy.warehousemanId.toString()
          );

          return (
            <View
              key={`${editedBy.warehousemanId}-${editedBy.at}`}
              className={`p-4 rounded-xl mb-3 ${
                isDark ? "bg-slate-800" : "bg-white"
              } shadow-sm`}
              style={styles.stockCard}
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text
                  className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-slate-800"
                  }`}
                >
                  {warehouseman?.name ||
                    `Unknown (ID: ${editedBy.warehousemanId})`}
                </Text>
              </View>

              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Calendar size={16} color={isDark ? "#94a3b8" : "#64748b"} />
                  <Text
                    className={`ml-2 ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Last updated: {new Date(editedBy.at).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const StockCard = ({ stock }: { stock: any }) => (
    <View
      className={`p-4 rounded-xl mb-3 ${
        isDark ? "bg-slate-800" : "bg-white"
      } shadow-sm`}
      style={styles.stockCard}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text
          className={`text-lg font-bold ${
            isDark ? "text-white" : "text-slate-800"
          }`}
        >
          {stock.name}
        </Text>
        <View
          className={`px-3 py-1 rounded-full ${
            stock.quantity > 0 ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Text
            className={stock.quantity > 0 ? "text-green-800" : "text-red-800"}
          >
            {stock.quantity > 0 ? "In Stock" : "Out of Stock"}
          </Text>
        </View>
      </View>

      <View className="space-y-2">
        <View className="flex-row items-center">
          <MapPin size={16} color={isDark ? "#94a3b8" : "#64748b"} />
          <Text
            className={`ml-2 ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            {stock.localisation?.city || "Location N/A"}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Box size={16} color={isDark ? "#94a3b8" : "#64748b"} />
          <Text
            className={`ml-2 ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            {stock.quantity} units available
          </Text>
        </View>

        <View className="flex-row items-center">
          <Calendar size={16} color={isDark ? "#94a3b8" : "#64748b"} />
          <Text
            className={`ml-2 ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView
        className={`flex-1 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}
      >
        {/* Header */}
        <View
          className={`p-4 ${isDark ? "bg-slate-800" : "bg-white"}`}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 items-center justify-center rounded-full bg-opacity-20"
          >
            <ArrowLeft size={24} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
          <Text
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Product Details
          </Text>
          <View style={{ width: 40 }} /> {/* Spacer for alignment */}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Product Image */}
          <View className="w-full my-8">
            <Image
              source={{ uri: product.image }}
              className="w-[80%] h-64 rounded-lg self-center"
              resizeMode="cover"
            />
          </View>

          {/* Product Info */}
          <View className="p-4">
            <View className="mb-6">
              <Text
                className={`text-2xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                {product.name}
              </Text>
              <Text
                className={`${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                {product.type}
              </Text>
            </View>

            {/* Details Grid */}
            <View className="mb-6">
              <DetailRow
                icon={
                  <DollarSign
                    size={20}
                    color={isDark ? "#94a3b8" : "#3b82f6"}
                  />
                }
                label="Price"
                value={`$${product.price.toFixed(2)}`}
              />
              <DetailRow
                icon={
                  <Truck size={20} color={isDark ? "#94a3b8" : "#3b82f6"} />
                }
                label="Supplier"
                value={product.supplier}
              />
              <DetailRow
                icon={
                  <Barcode size={20} color={isDark ? "#94a3b8" : "#3b82f6"} />
                }
                label="Barcode"
                value={product.barcode}
              />
            </View>

            {/* Stock Information */}
            <View>
              <Text
                className={`text-xl font-semibold mb-4 ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                Stock Information
              </Text>
              {product.stocks?.map((stock, index) => (
                <StockCard key={index} stock={stock} />
              ))}
            </View>
            <View>
              <Text
                className={`text-xl font-semibold mb-4 ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                Edit History
              </Text>
              {product.editedBy && product.editedBy.length > 0 ? (
                <WarehousemanCard editedByList={product.editedBy} />
              ) : (
                <Text
                  className={`${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  No edit history available
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stockCard: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
});

export default ProductDetailsModal;
