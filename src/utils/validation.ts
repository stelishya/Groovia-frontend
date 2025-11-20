/**
 * Validation utility functions for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error: string;
}

/**
 * Username validation
 * - Required
 * - 3-30 characters
 * - Only letters, numbers, and underscores
 */
export const validateUsername = (username: string): ValidationResult => {
  if (!username || !username.trim()) {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (!/^[a-zA-Z\s]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters and spaces' };
  }
  
  if (username.length < 3 || username.length > 30) {
    return { isValid: false, error: 'Username must be between 3 and 30 characters' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Email validation
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Password validation
 * - Minimum 6 characters
 * - At least one letter and one number (optional strict mode)
 */
export const validatePassword = (password: string, strict: boolean = false): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }
  
  if (strict) {
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one letter and one number' };
    }
  }
  
  return { isValid: true, error: '' };
};

/**
 * Phone number validation
 * - Optional field
 * - 7-15 digits
 * - Can start with +
 */
export const validatePhone = (phone: string, required: boolean = false): ValidationResult => {
  if (!phone || !phone.trim()) {
    if (required) {
      return { isValid: false, error: 'Phone number is required' };
    }
    return { isValid: true, error: '' };
  }
  
  if (!/^\+?[0-9]{7,15}$/.test(phone)) {
    return { isValid: false, error: 'Phone number must be 7-15 digits (can start with +)' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Bio validation
 * - Optional field
 * - Max 500 characters
 */
export const validateBio = (bio: string, maxLength: number = 500): ValidationResult => {
  if (!bio) {
    return { isValid: true, error: '' };
  }
  
  if (bio.length > maxLength) {
    return { isValid: false, error: `Bio must not exceed ${maxLength} characters` };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Experience years validation
 * - Must be a number
 * - Between 0 and maxYears (default 50)
 */
export const validateExperienceYears = (years: number, maxYears: number = 50): ValidationResult => {
  if (years === undefined || years === null) {
    return { isValid: false, error: 'Experience years is required' };
  }
  
  if (isNaN(years) || years < 0) {
    return { isValid: false, error: 'Experience years must be a positive number' };
  }
  
  if (years > maxYears) {
    return { isValid: false, error: `Experience years cannot exceed ${maxYears} years` };
  }
  
  return { isValid: true, error: '' };
};

/**
 * File validation for images
 */
export const validateImageFile = (file: File, maxSizeMB: number = 5): ValidationResult => {
  if (!file) {
    return { isValid: false, error: 'Please select a file' };
  }
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select an image file' };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `Image size should be less than ${maxSizeMB}MB` };
  }
  
  return { isValid: true, error: '' };
};

/**
 * URL validation
 */
export const validateUrl = (url: string, required: boolean = false): ValidationResult => {
  if (!url || !url.trim()) {
    if (required) {
      return { isValid: false, error: 'URL is required' };
    }
    return { isValid: true, error: '' };
  }
  
  try {
    new URL(url);
    return { isValid: true, error: '' };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * Array validation (for dance styles, portfolio links, etc.)
 */
export const validateArray = (
  array: any[],
  fieldName: string,
  minLength: number = 0,
  maxLength?: number
): ValidationResult => {
  if (!array || !Array.isArray(array)) {
    return { isValid: false, error: `${fieldName} must be an array` };
  }
  
  if (array.length < minLength) {
    return { isValid: false, error: `Please select at least ${minLength} ${fieldName.toLowerCase()}` };
  }
  
  if (maxLength && array.length > maxLength) {
    return { isValid: false, error: `You can select up to ${maxLength} ${fieldName.toLowerCase()}` };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validate entire profile form
 */
export interface ProfileFormData {
  username?: string;
  email?: string;
  phone?: string;
  bio?: string;
  experienceYears?: number;
  danceStyles?: string[];
}

export interface ProfileFormErrors {
  username: string;
  email: string;
  phone: string;
  bio: string;
  experienceYears: string;
  danceStyles: string;
}

export const validateProfileForm = (data: ProfileFormData): { isValid: boolean; errors: ProfileFormErrors } => {
  const errors: ProfileFormErrors = {
    username: '',
    email: '',
    phone: '',
    bio: '',
    experienceYears: '',
    danceStyles: '',
  };
  
  let isValid = true;
  
  // Username validation
  if (data.username !== undefined) {
    const usernameResult = validateUsername(data.username);
    if (!usernameResult.isValid) {
      errors.username = usernameResult.error;
      isValid = false;
    }
  }
  
  // Email validation
  if (data.email !== undefined) {
    const emailResult = validateEmail(data.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error;
      isValid = false;
    }
  }
  
  // Phone validation (optional)
  if (data.phone !== undefined) {
    const phoneResult = validatePhone(data.phone, false);
    if (!phoneResult.isValid) {
      errors.phone = phoneResult.error;
      isValid = false;
    }
  }
  
  // Bio validation (optional)
  if (data.bio !== undefined) {
    const bioResult = validateBio(data.bio);
    if (!bioResult.isValid) {
      errors.bio = bioResult.error;
      isValid = false;
    }
  }
  
  // Experience years validation
  if (data.experienceYears !== undefined) {
    const expResult = validateExperienceYears(data.experienceYears);
    if (!expResult.isValid) {
      errors.experienceYears = expResult.error;
      isValid = false;
    }
  }
  
  return { isValid, errors };
};
