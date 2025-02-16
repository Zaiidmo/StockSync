import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { Activity, Box, TrendingUp, TrendingDown, RefreshCcw } from "lucide-react-native";
import { statisticsService } from "@/services/statistics"; 
import { ProductStatistic, Statistics } from "@/types/statistics";

const StatisticCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  formatter = (v: any) => v 
}: { 
  title: string;
  value: any;
  icon: any;
  color: string;
  formatter?: (value: any) => string | number;
}) => (
  <View className="bg-white p-6 rounded-lg shadow-md mb-4">
    <View className="flex-row items-center">
      <Icon size={24} color={color} className="mr-2" />
      <Text className="text-lg font-bold text-slate-800">{title}</Text>
    </View>
    <Text className="text-3xl font-bold text-slate-900 mt-2">
      {formatter(value)}
    </Text>
  </View>
);

const ProductList = ({ 
  products, 
  color 
}: { 
  products: ProductStatistic[];
  color: string;
}) => (
  products.length > 0 ? (
    products.map((product, index) => (
      <View key={index} className="mt-2 flex-row justify-between items-center">
        <Text className="text-slate-700 flex-1">{product.name}</Text>
        <View className="bg-slate-100 px-3 py-1 rounded-full">
          <Text className="font-bold" style={{ color }}>
            {product.count}x
          </Text>
        </View>
      </View>
    ))
  ) : (
    <Text className="text-slate-500 mt-2 italic">No data available</Text>
  )
);

export default function StatisticsScreen() {
  const [statistics, setStatistics] = useState<Statistics>({
    totalProducts: 0,
    outOfStock: 0,
    totalStockValue: 0,
    mostAddedProducts: [],
    mostRemovedProducts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatistics = async () => {
    try {
      const data = await statisticsService.getStatistics();
      setStatistics(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setError("Failed to fetch statistics. Please try again later.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchStatistics();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-lg text-center mb-4">{error}</Text>
        <TouchableOpacity
          onPress={fetchStatistics}
          className="flex-row items-center bg-blue-500 px-4 py-2 rounded-lg"
        >
          <RefreshCcw size={20} color="white" />
          <Text className="text-white ml-2 font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  };

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 p-4"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <StatisticCard 
        title="Total Products"
        value={statistics.totalProducts}
        icon={Box}
        color="#3b82f6"
      />

      <StatisticCard 
        title="Out of Stock"
        value={statistics.outOfStock}
        icon={Activity}
        color="#ef4444"
      />

      <StatisticCard 
        title="Total Stock Value"
        value={statistics.totalStockValue}
        icon={Box}
        color="#10b981"
        formatter={formatCurrency}
      />

      <View className="bg-white p-6 rounded-lg shadow-md mb-4">
        <View className="flex-row items-center mb-4">
          <TrendingUp size={24} color="#3b82f6" className="mr-2" />
          <Text className="text-lg font-bold text-slate-800">Most Added Products</Text>
        </View>
        <ProductList products={statistics.mostAddedProducts} color="#3b82f6" />
      </View>

      <View className="bg-white p-6 rounded-lg shadow-md mb-4">
        <View className="flex-row items-center mb-4">
          <TrendingDown size={24} color="#ef4444" className="mr-2" />
          <Text className="text-lg font-bold text-slate-800">Most Removed Products</Text>
        </View>
        <ProductList products={statistics.mostRemovedProducts} color="#ef4444" />
      </View>
    </ScrollView>
  );
}