/**
 * Validates Bangladeshi Mobile Numbers
 * Accepts 11-digit local format (e.g. 01712345678) or international format (+8801712345678 or 8801712345678)
 * Rejects non-BD operators and fake/repeating numbers (e.g. 01700000000, 01811111111, 01712345678 sequence)
 */
export const validateBDPhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required.' };
  }

  const cleaned = phone.trim().replace(/\s|-|\(|\)/g, '');
  
  // Regex pattern for BD operators: 013, 014, 015, 016, 017, 018, 019
  const bdPattern = /^(?:\+?88)?(01[3-9]\d{8})$/;
  const match = cleaned.match(bdPattern);

  if (!match) {
    return { 
      isValid: false, 
      error: 'Enter a valid BD phone number (e.g. 01712345678 or +8801812345678).' 
    };
  }

  const digits = match[1]; // 11 digits starting with 01X
  const subscriberPart = digits.slice(3); // 8 digits

  // Reject repeating fake numbers like 00000000, 11111111, 88888888
  if (/^(\d)\1{7}$/.test(subscriberPart)) {
    return { isValid: false, error: 'Fake or placeholder phone numbers are not allowed.' };
  }

  // Reject obvious sequential fake numbers
  if (subscriberPart === '12345678' || subscriberPart === '87654321' || subscriberPart === '01234567') {
    return { isValid: false, error: 'Sequential test numbers are not accepted as valid phone numbers.' };
  }

  return { isValid: true };
};

/**
 * Validates Password Criteria:
 * - Minimum 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 number (0-9)
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least 1 uppercase letter (A-Z).' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least 1 number (0-9).' };
  }

  return { isValid: true };
};

/**
 * Validates optional email format if provided
 */
export const validateOptionalEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || !email.trim()) {
    return { isValid: true }; // Email is optional!
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address or leave it blank.' };
  }

  return { isValid: true };
};
