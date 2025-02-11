const BASE_URL = "http://172.20.10.3:3000";

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
  }  
};

