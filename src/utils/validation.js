export function validateCredentials({ username, email, password, confirmPassword, register }) {
  const usernameValue = username?.trim() || '';
  if (!usernameValue) return 'Enter a username.';
  if (usernameValue.length > 30) return 'Usernames can be at most 30 characters.';
  if (!/^[a-zA-Z0-9._-]+$/.test(usernameValue)) return 'Usernames may use letters, numbers, periods, underscores, and hyphens only.';
  if (!password) return 'Enter a password.';
  if (!register) return '';
  if (!email?.trim() || email.trim().length > 254 || !/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.';
  if (password.length < 4) return 'Use at least 4 characters for your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return '';
}
