import { UserRole } from '../constants/roles';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  verificationStatus: 'pending' | 'verified';
  department?: string;
  createdAt: string; // iso date string
}
