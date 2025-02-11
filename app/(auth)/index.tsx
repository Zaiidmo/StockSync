// app/index.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Image,
} from "react-native";
import { router } from "expo-router";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    setIsLoading(true);
    const userData = await AsyncStorage.getItem("user");
    if (userData) {
      router.replace("/(tabs)");
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const user = await api.login(secretKey);
      // Store user data
      await AsyncStorage.setItem("user", JSON.stringify(user));
      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Invalid secret key");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      className={`flex-1 justify-center items-center ${
        isDark ? "bg-[#1f61b7]" : "bg-slate-50"
      }`}
    >
      <Image
        source={require("@/assets/images/icon.png")}
        className="w-60 h-60 justify-self-start"
      />
      <TextInput
        className={`w-4/5 p-4 rounded-lg mb-4 ${
          isDark ? "bg-slate-800 text-white" : "bg-white text-black"
        }`}
        placeholder="Enter Secret Key"
        value={secretKey}
        onChangeText={setSecretKey}
        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
      />
      <TouchableOpacity
        className={`w-4/5 p-4 rounded-lg ${
          isLoading ? "bg-[#1f61b7]" : "bg-[#2563eb]"
        }`}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text className="text-white text-center font-semibold">
          {isLoading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
