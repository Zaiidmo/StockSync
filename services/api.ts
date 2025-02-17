const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const api = {
  login: async (secretKey: string) => {
    try {
      // Get Warehousemen
      const response = await fetch(`${BASE_URL}/warehousemans`);
      const users = await response.json();
      // Find user by secret key
      const user = users.find((u: any) => u.secretKey === secretKey);
      // Trigger error if user not found
      if (!user) {
        throw new Error("Invalid secret key");
      }
      // Return user data
      return user;
    } catch (error) {
      throw error;
    }
  },
  getUserData: async (userId: number) => {
    try {
      const response = await fetch(`${BASE_URL}/warehousemans/${userId}`);
      const user = await response.json();
      return user;
    } catch (error) {
      throw error;
    }
  }
};

