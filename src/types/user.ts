export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  lastSignInAt: string;
}

export interface UserInsert {
  clerkId: string;
  name: string;
  email: string;
  imageUrl?: string | null;
  authProvider?: string;
  lastSignInAt?: Date | null;
}
