
export const validatePhone = (phone: string): string | undefined => {
  const t = phone.trim();
  if (!t) return 'Phone number is required';
  if (!/^\d{10}$/.test(t)) return 'Enter a valid 10-digit phone number';
  if (!/^[6-9]/.test(t)) return 'Must start with 6, 7, 8, or 9 (Indian number)';
  return undefined;
};

export const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return undefined; // optional
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Enter a valid email address';
  }
  return undefined;
};

export const validateName = (name: string): string | undefined => {
  const t = name.trim();
  if (!t) return 'Full name is required';
  if (t.length < 2) return 'Name must be at least 2 characters';
  if (t.length > 100) return 'Name is too long';
  return undefined;
};

export const validateInviteCode = (code: string): string | undefined => {
  if (!code.trim()) return 'Admin invite code is required';
  return undefined;
};
