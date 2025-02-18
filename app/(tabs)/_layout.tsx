import { router, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Text, TouchableOpacity } from "react-native";
import { Barcode, Package, LineChart, LogOut } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { User } from "../../types/auth";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isLoading, setIsLoading] = useState(true); 
  const [currentUser, setCurrentUser] = useState<User | null>(null); 

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        router.replace("/");
        return; 
      }

      try {
        const parsedUser = JSON.parse(userData) as User;
        setCurrentUser(parsedUser);
      } catch (parseError) {
        console.error("Error parsing user data:", parseError);
        router.replace("/");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      router.replace("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      router.replace("/(auth)"); 
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <Text className="flex-1 justify-center items-center text-center">
        Loading...
      </Text>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: true, 
        headerTitleAlign: "left",
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: `${isDark ? '#000000' : '#F5F7FA'}`
          },
          default: {'backgroundColor': `${isDark ? '#000000' : '#F5F7FA'}`},
        }),
        headerStyle: {
          backgroundColor: `${isDark ? '#000000' : '#F5F7FA'}`,
          
        },

        headerRight: () => (
          <TouchableOpacity className="flex-row gap-4 w-36 items-center" onPress={handleLogout} >
            <Text className="text-lg font-bold text-white ml-2">
            {currentUser?.name.split(' ')[0]}</Text>
            <LogOut
              color={isDark ? "#ffffff" : "#64748b"}
              size={24}
              style={{ marginRight: 16 }}
            />
            
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Products",
          tabBarIcon: ({ color }) => <Package size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color }) => <Barcode size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => <LineChart size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
