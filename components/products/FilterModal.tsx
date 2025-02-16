import React from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

interface FilterModalProps {
  isFilterModalVisible: boolean;
  setIsFilterModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  filters: {
    supplier: string;
    type: string;
    stockStatus: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string; 
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      supplier: string;
      type: string;
      stockStatus: string;
      minPrice: string;
      maxPrice: string;
      sortBy: string; 
    }>
  >;
  isDark: boolean;
  productTypes: string[];
  suppliers: string[];
}

export default function FilterModal({
  isFilterModalVisible,
  setIsFilterModalVisible,
  filters,
  setFilters,
  isDark,
  productTypes,
  suppliers,
}: FilterModalProps) {
  return (
    <Modal
      transparent={true}
      visible={isFilterModalVisible}
      onRequestClose={() => setIsFilterModalVisible(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className={`w-11/12 p-4 rounded-lg ${isDark ? "bg-slate-800" : "bg-white"}`}>
          <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}>Filters</Text>
          <ScrollView>
            {/* Product Type Selection */}
            <View className="mt-4">
              <Text className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>Type</Text>
              <View className="flex-row flex-wrap mt-1">
                <TouchableOpacity
                  className={`p-2 px-4 rounded-full mr-2 mb-2 ${
                    filters.type === "" ? (isDark ? "bg-blue-700" : "bg-blue-200") : (isDark ? "bg-slate-700" : "bg-slate-100")
                  }`}
                  onPress={() => setFilters({ ...filters, type: "" })}
                >
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>All Types</Text>
                </TouchableOpacity>
                {productTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    className={`p-2 px-4 rounded-full mr-2 mb-2 ${
                      filters.type === type ? (isDark ? "bg-blue-700" : "bg-blue-200") : (isDark ? "bg-slate-700" : "bg-slate-100")
                    }`}
                    onPress={() => setFilters({ ...filters, type })}
                  >
                    <Text className={`${isDark ? "text-white" : "text-black"}`}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Supplier Selection */}
            <View className="mt-4">
              <Text className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>Supplier</Text>
              <View className="flex-row flex-wrap mt-1">
                <TouchableOpacity
                  className={`p-2 px-4 rounded-full mr-2 mb-2 ${
                    filters.supplier === "" ? (isDark ? "bg-blue-700" : "bg-blue-200") : (isDark ? "bg-slate-700" : "bg-slate-100")
                  }`}
                  onPress={() => setFilters({ ...filters, supplier: "" })}
                >
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>All Suppliers</Text>
                </TouchableOpacity>
                {suppliers.map((supplier) => (
                  <TouchableOpacity
                    key={supplier}
                    className={`p-2 px-4 rounded-full mr-2 mb-2 ${
                      filters.supplier === supplier ? (isDark ? "bg-blue-700" : "bg-blue-200") : (isDark ? "bg-slate-700" : "bg-slate-100")
                    }`}
                    onPress={() => setFilters({ ...filters, supplier })}
                  >
                    <Text className={`${isDark ? "text-white" : "text-black"}`}>{supplier}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Stock Status Selection */}
            <View className="mt-4">
              <Text className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>Stock Status</Text>
              <View className="flex-row flex-wrap mt-1">
                <TouchableOpacity
                  className={`p-2 px-4 rounded-full mr-2 mb-2 ${
                    filters.stockStatus === "" ? (isDark ? "bg-blue-700" : "bg-blue-200") : (isDark ? "bg-slate-700" : "bg-slate-100")
                  }`}
                  onPress={() => setFilters({ ...filters, stockStatus: "" })}
                >
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`p-2 px-4 rounded-full mr-2 mb-2 ${
                    filters.stockStatus === "out_of_stock" ? (isDark ? "bg-red-700" : "bg-red-200") : (isDark ? "bg-slate-700" : "bg-slate-100")
                  }`}
                  onPress={() => setFilters({ ...filters, stockStatus: "out_of_stock" })}
                >
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>Out of Stock</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`p-2 px-4 rounded-full mr-2 mb-2 ${
                    filters.stockStatus === "low_stock" ? (isDark ? "bg-yellow-700" : "bg-yellow-200") : (isDark ? "bg-slate-700" : "bg-slate-100")
                  }`}
                  onPress={() => setFilters({ ...filters, stockStatus: "low_stock" })}
                >
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>Low Stock</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`p-2 px-4 rounded-full mr-2 mb-2 ${
                    filters.stockStatus === "in_stock" ? (isDark ? "bg-green-700" : "bg-green-200") : (isDark ? "bg-slate-700" : "bg-slate-100")
                  }`}
                  onPress={() => setFilters({ ...filters, stockStatus: "in_stock" })}
                >
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>In Stock</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Price Range Inputs */}
            <View className="mt-4">
              <Text className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>Price Range</Text>
              <View className="flex-row mt-1">
                <TextInput
                  className={`flex-1 p-2 mr-2 rounded-lg ${isDark ? "bg-slate-700 text-white" : "bg-slate-100 text-black"}`}
                  placeholder="Min Price"
                  placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
                  value={filters.minPrice}
                  onChangeText={(text) => setFilters({ ...filters, minPrice: text })}
                  keyboardType="numeric"
                />
                <TextInput
                  className={`flex-1 p-2 rounded-lg ${isDark ? "bg-slate-700 text-white" : "bg-slate-100 text-black"}`}
                  placeholder="Max Price"
                  placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
                  value={filters.maxPrice}
                  onChangeText={(text) => setFilters({ ...filters, maxPrice: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Sort Section */}
            <View className="mt-4">
              <Text className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>Sort By</Text>
              <View className="flex-row flex-wrap mt-1">
                <TouchableOpacity
                  className={`p-2 px-4 rounded-full mr-2 mb-2 ${
                    filters.sortBy === "" ? (isDark ? "bg-blue-700" : "bg-blue-200") : (isDark ? "bg-slate-700" : "bg-slate-100")
                  }`}
                  onPress={() => setFilters({ ...filters, sortBy: "" })}
                >
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>None</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`p-2 px-4 rounded-full mr-2 mb-2 ${
                    filters.sortBy === "name" ? (isDark ? "bg-blue-700" : "bg-blue-200") : (isDark ? "bg-slate-700" : "bg-slate-100")
                  }`}
                  onPress={() => setFilters({ ...filters, sortBy: "name" })}
                >
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>Name</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`p-2 px-4 rounded-full mr-2 mb-2 ${
                    filters.sortBy === "price" ? (isDark ? "bg-blue-700" : "bg-blue-200") : (isDark ? "bg-slate-700" : "bg-slate-100")
                  }`}
                  onPress={() => setFilters({ ...filters, sortBy: "price" })}
                >
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>Price</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`p-2 px-4 rounded-full mr-2 mb-2 ${
                    filters.sortBy === "stock" ? (isDark ? "bg-blue-700" : "bg-blue-200") : (isDark ? "bg-slate-700" : "bg-slate-100")
                  }`}
                  onPress={() => setFilters({ ...filters, sortBy: "stock" })}
                >
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>Stock</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          <View className="flex-row justify-end mt-4">
            <TouchableOpacity
              className={`p-2 px-4 rounded-lg ${isDark ? "bg-slate-700" : "bg-slate-100"}`}
              onPress={() => setIsFilterModalVisible(false)}
            >
              <Text className={`${isDark ? "text-white" : "text-black"}`}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`p-2 px-4 rounded-lg ml-2 ${isDark ? "bg-blue-700" : "bg-blue-200"}`}
              onPress={() => setIsFilterModalVisible(false)}
            >
              <Text className={`${isDark ? "text-white" : "text-black"}`}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}