export interface TokenService {
  generateAccessToken(payload: any): Promise<string>;
  generateRefreshToken(payload: any): Promise<string>;
  verifyRefreshToken(token: string): Promise<any>;
}
