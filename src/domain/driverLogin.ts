export function validateDriverLogin(phone: string, pin: string): string | null {
  if (phone.includes("@")) {
    return "Use the phone number provided by your fleet, not an email address.";
  }
  if (!phone.replace(/\D/g, "")) {
    return "Enter the phone number assigned by your fleet manager.";
  }
  if (!/^\d{6,8}$/.test(pin)) {
    return "Enter the 6-8 digit PIN set by your fleet manager.";
  }
  return null;
}
