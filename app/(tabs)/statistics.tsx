"use client"

import { useCallback, useEffect, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  useColorScheme,
  useWindowDimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Activity, Box, TrendingUp, TrendingDown, RefreshCcw } from "lucide-react-native"
import { statisticsService } from "@/services/statistics"
import type { Statistics } from "@/types/statistics"
import { StatisticsExport } from "@/components/products/statisticsExport"
import { StatisticCard } from "@/components/products/StatisticCard"
import { ProductList } from "@/components/products/ProductList"

export default function StatisticsScreen() {
  const [statistics, setStatistics] = useState<Statistics>({
    totalProducts: 0,
    outOfStock: 0,
    totalStockValue: 0,
    mostAddedProducts: [],
    mostRemovedProducts: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const { width } = useWindowDimensions()

  const fetchStatistics = useCallback(async () => {
    try {
      const data = await statisticsService.getStatistics()
      setStatistics(data)
      setError(null)
    } catch (error) {
      console.error("Error fetching statistics:", error)
      setError("Failed to fetch statistics. Please try again later.")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchStatistics()
  }, [fetchStatistics])

  useEffect(() => {
    fetchStatistics()
    const interval = setInterval(fetchStatistics, 30000)
    return () => clearInterval(interval)
  }, [fetchStatistics])

  if (isLoading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
        <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#3b82f6"} />
      </View>
    )
  }

  if (error) {
    return (
      <View className={`flex-1 justify-center items-center p-4 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
        <Text className="text-red-500 text-lg text-center mb-4 font-medium">{error}</Text>
        <TouchableOpacity
          onPress={fetchStatistics}
          className={`flex-row items-center px-5 py-3 rounded-xl ${
            isDark ? "bg-blue-600 active:bg-blue-700" : "bg-blue-500 active:bg-blue-600"
          }`}
        >
          <RefreshCcw size={18} color="white" />
          <Text className="text-white ml-2 font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    })
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-[#111827]" : "bg-white"}`}>
      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "#60a5fa" : "#3b82f6"} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className={width > 768 ? "flex-row flex-wrap justify-between" : ""}>
          <View className={width > 768 ? "w-[48%]" : "w-full"}>
            <StatisticCard
              title="Total Products"
              value={statistics.totalProducts}
              icon={Box}
              color={isDark ? "#60a5fa" : "#3b82f6"}
              isDark={isDark}
            />
          </View>
          <View className={width > 768 ? "w-[48%]" : "w-full"}>
            <StatisticCard
              title="Out of Stock"
              value={statistics.outOfStock}
              icon={Activity}
              color={isDark ? "#f87171" : "#ef4444"}
              isDark={isDark}
            />
          </View>
          <View className={width > 768 ? "w-[48%]" : "w-full"}>
            <StatisticCard
              title="Total Stock Value"
              value={statistics.totalStockValue}
              icon={Box}
              color={isDark ? "#34d399" : "#10b981"}
              isDark={isDark}
              formatter={formatCurrency}
            />
          </View>
        </View>

        <View className={`p-6 rounded-2xl shadow-sm mb-4 ${isDark ? "bg-[#1F2937]" : "bg-[#F5F7FA] "}`}>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  isDark ? "bg-blue-500/30" : "bg-blue-50"
                }`}
              >
                <TrendingUp size={20} color={isDark ? "#60a5fa" : "#3b82f6"} />
              </View>
              <Text className={`text-base font-medium ml-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                Most Added Products
              </Text>
            </View>
          </View>
          <ProductList products={statistics.mostAddedProducts} color={isDark ? "#60a5fa" : "#3b82f6"} isDark={isDark} />
        </View>

        <View className={`p-6 rounded-2xl shadow-sm mb-4 ${isDark ? "bg-[#1F2937]" : "bg-[#F5F7FA] "}`}>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  isDark ? "bg-red-500/30" : "bg-red-50"
                }`}
              >
                <TrendingDown size={20} color={isDark ? "#f87171" : "#ef4444"} />
              </View>
              <Text className={`text-base font-medium ml-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
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

        {/* StatisticsExport component moved inside ScrollView */}
        <StatisticsExport statistics={statistics} />
      </ScrollView>
    </SafeAreaView>
  )
}

