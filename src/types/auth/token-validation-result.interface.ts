export interface TokenValidationResult {
  valid: boolean;
  userId: string | null;
  username: string | null;
  exp?: number;
}
