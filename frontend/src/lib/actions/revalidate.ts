'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidateVendor(slug: string) {
  revalidateTag(`vendor-${slug}`, { expire: 0 });
  revalidateTag('all-vendors', { expire: 0 });
  revalidatePath(`/vendors/${slug}`);
}

export async function revalidateVendors() {
  revalidateTag('all-vendors', { expire: 0 });
}

export async function revalidateBlog() {
  // Revalidate the blog page to fetch fresh data
  revalidatePath('/blog');
}