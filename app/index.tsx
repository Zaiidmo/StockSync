import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Login() {
  return (
    <View className="flex-1 justify-center items-center bg-blue-50 dark:bg-purple-800">
      <Text className="text-3xl font-bold text-red-500 mb-8">StockSync</Text>
      <TextInput 
        className="w-4/5 p-4 bg-white rounded-lg mb-4"
        placeholder="Enter PIN"
        secureTextEntry
      />
      <TouchableOpacity 
        className="w-4/5 bg-blue-600 p-4 rounded-lg"
        onPress={() => router.push('/(tabs)')}
      >
        <Text className="text-white text-center">Login</Text>
      </TouchableOpacity>
    </View>
  );
}