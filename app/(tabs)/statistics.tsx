import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  useColorScheme,
} from "react-native";
import {
  Activity,
  Box,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
} from "lucide-react-native";
import { statisticsService } from "@/services/statistics";
import { ProductStatistic, Statistics } from "@/types/statistics";

const StatisticCard = ({
  title,
  value,
  icon: Icon,
  color,
  isDark,
  formatter = (v: any) => v,
}: {
  title: string;
  value: any;
  icon: any;
  color: string;
  isDark: boolean;
  formatter?: (value: any) => string | number;
}) => (
  <View
    className={`p-6 rounded-2xl shadow-xl mb-4 ${
      isDark ? "bg-[#1F2937] " : "bg-[#F5F7FA]  "
    }`}
  >
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center bg-opacity-15`}
          style={{ backgroundColor: `${color}${isDark ? "30" : "20"}` }}
        >
          <Icon size={20} color={color} />
        </View>
        <Text
          className={`text-base font-medium ml-3 ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {title}
        </Text>
      </View>
      <Text className="text-2xl font-bold" style={{ color }}>
        {formatter(value)}
      </Text>
    </View>
  </View>
);

const ProductList = ({
  products,
  color,
  isDark,
}: {
  products: ProductStatistic[];
  color: string;
  isDark: boolean;
}) =>
  products.length > 0 ? (
    products.map((product, index) => (
      <View
        key={index}
        className={`mt-3 flex-row justify-between items-center py-2.5 px-3 rounded-xl ${
          isDark ? "bg-slate-700/50" : "bg-slate-50"
        }`}
      >
        <Text
          className={`font-medium flex-1 ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          {product.name}
        </Text>
        <View
          className={`px-3 py-1.5 rounded-full`}
          style={{ backgroundColor: `${color}${isDark ? "30" : "15"}` }}
        >
          <Text className="font-bold text-sm" style={{ color }}>
            {product.count}x
          </Text>
        </View>
      </View>
    ))
  ) : (
    <View
      className={`mt-3 py-4 items-center rounded-xl ${
        isDark ? "bg-slate-700/50" : "bg-slate-50"
      }`}
    >
      <Text
        className={`italic ${isDark ? "text-slate-400" : "text-slate-500"}`}
      >
        No data available
      </Text>
    </View>
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

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
    const interval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <View
        className={`flex-1 justify-center items-center ${
          isDark ? "bg-slate-900" : "bg-slate-50"
        }`}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? "#60a5fa" : "#3b82f6"}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View
        className={`flex-1 justify-center items-center p-4 ${
          isDark ? "bg-slate-900" : "bg-slate-50"
        }`}
      >
        <Text className="text-red-500 text-lg text-center mb-4 font-medium">
          {error}
        </Text>
        <TouchableOpacity
          onPress={fetchStatistics}
          className={`flex-row items-center px-5 py-3 rounded-xl ${
            isDark
              ? "bg-blue-600 active:bg-blue-700"
              : "bg-blue-500 active:bg-blue-600"
          }`}
        >
          <RefreshCcw size={18} color="white" />
          <Text className="text-white ml-2 font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  };

  return (
    <ScrollView
      className={`flex-1 ${isDark ? "bg-[#111827]" : "bg-white"}  p-4`}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? "#60a5fa" : "#3b82f6"}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <StatisticCard
        title="Total Products"
        value={statistics.totalProducts}
        icon={Box}
        color={isDark ? "#60a5fa" : "#3b82f6"}
        isDark={isDark}
      />

      <StatisticCard
        title="Out of Stock"
        value={statistics.outOfStock}
        icon={Activity}
        color={isDark ? "#f87171" : "#ef4444"}
        isDark={isDark}
      />

      <StatisticCard
        title="Total Stock Value"
        value={statistics.totalStockValue}
        icon={Box}
        color={isDark ? "#34d399" : "#10b981"}
        isDark={isDark}
        formatter={formatCurrency}
      />

      <View
        className={`p-6 rounded-2xl shadow-sm mb-4 ${
          isDark ? "bg-[#1F2937]" : "bg-[#F5F7FA] "
        }`}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isDark ? "bg-blue-500/30" : "bg-blue-50"
              }`}
            >
              <TrendingUp size={20} color={isDark ? "#60a5fa" : "#3b82f6"} />
            </View>
            <Text
              className={`text-base font-medium ml-3 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Most Added Products
            </Text>
          </View>
        </View>
        <ProductList
          products={statistics.mostAddedProducts}
          color={isDark ? "#60a5fa" : "#3b82f6"}
          isDark={isDark}
        />
      </View>

      <View
       className={`p-6 rounded-2xl shadow-sm mb-4 ${
        isDark ? "bg-[#1F2937]" : "bg-[#F5F7FA] "
      }`}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isDark ? "bg-red-500/30" : "bg-red-50"
              }`}
            >
              <TrendingDown size={20} color={isDark ? "#f87171" : "#ef4444"} />
            </View>
            <Text
              className={`text-base font-medium ml-3 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Most Removed Products
            </Text>
          </View>
        </View>
        <ProductList
          products={statistics.mostRemovedProducts}
          color={isDark ? "#f87171" : "#ef4444"}
          isDark={isDark}
        />
      </View>
    </ScrollView>
  );
}
