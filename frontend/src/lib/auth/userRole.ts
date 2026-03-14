export enum UserRole {
  VENDOR = 'vendor',
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  USER = 'user' // not logged in
}

type ProfileFields = {
  vendor_id?: string | null;
  role?: string | null;
};

export function getUserRole(profile: ProfileFields | null | undefined): UserRole {
  if (profile?.vendor_id && profile?.role === 'vendor') {
    return UserRole.VENDOR;
  }
  if (profile?.role === 'admin') {
    return UserRole.ADMIN;
  }
  if (profile?.role === 'user') {
    return UserRole.CUSTOMER;
  }
  return UserRole.USER;
}
