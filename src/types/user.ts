
export interface UserInsert {
  id: string; // clerk_id
  name: string;
  email: string;
  imageUrl?: string | null;
  authProvider?: string;
  lastSignInAt?: Date | null;
}
