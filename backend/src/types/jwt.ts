export interface JwtPayload {
  id: string;
  role: 'citizen' | 'admin';
}
