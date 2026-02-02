export interface User {
  id: string; // clerk_id - permanent identifier from Clerk
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  lastSignInAt: string;
}

export interface UserInsert {
  id: string; // clerk_id
  name: string;
  email: string;
  imageUrl?: string | null;
  authProvider?: string;
  lastSignInAt?: Date | null;
}
