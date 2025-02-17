import { View, Text } from "react-native"

export const StatisticCard = ({
  title,
  value,
  icon: Icon,
  color,
  isDark,
  formatter = (v: any) => v,
}: {
  title: string
  value: any
  icon: any
  color: string
  isDark: boolean
  formatter?: (value: any) => string | number
}) => (
  <View className={`p-6 rounded-2xl shadow-xl mb-4 ${isDark ? "bg-[#1F2937] " : "bg-[#F5F7FA]  "}`}>
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center bg-opacity-15`}
          style={{ backgroundColor: `${color}${isDark ? "30" : "20"}` }}
        >
          <Icon size={20} color={color} />
        </View>
        <Text className={`text-base font-medium ml-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{title}</Text>
      </View>
      <Text className="text-2xl font-bold" style={{ color }}>
        {formatter(value)}
      </Text>
    </View>
  </View>
)

