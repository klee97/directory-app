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
  if (profile?.vendor_id && profile?.role === UserRole.VENDOR) {
    return UserRole.VENDOR;
  }
  if (profile?.role === UserRole.ADMIN) {
    return UserRole.ADMIN;
  }
  if (profile?.role === UserRole.USER) { // map 'user' to 'customer'
    return UserRole.CUSTOMER;
  }
  return UserRole.USER;
}
