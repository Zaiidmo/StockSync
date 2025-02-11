export interface User {
    id: number;
    name: string;
    dob: string;
    city: string;
    secretKey: string;
    warehouseId: number;
  }
  
  export interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
  }