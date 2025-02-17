import { View, Text } from "react-native"
import type { ProductStatistic } from "@/types/statistics"

export const ProductList = ({
  products,
  color,
  isDark,
}: {
  products: ProductStatistic[]
  color: string
  isDark: boolean
}) =>
  products.length > 0 ? (
    products.map((product, index) => (
      <View
        key={index}
        className={`mt-3 flex-row justify-between items-center py-2.5 px-3 rounded-xl ${
          isDark ? "bg-slate-700/50" : "bg-slate-50"
        }`}
      >
        <Text className={`font-medium flex-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{product.name}</Text>
        <View className={`px-3 py-1.5 rounded-full`} style={{ backgroundColor: `${color}${isDark ? "30" : "15"}` }}>
          <Text className="font-bold text-sm" style={{ color }}>
            {product.count}x
          </Text>
        </View>
      </View>
    ))
  ) : (
    <View className={`mt-3 py-4 items-center rounded-xl ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
      <Text className={`italic ${isDark ? "text-slate-400" : "text-slate-500"}`}>No data available</Text>
    </View>
  )

