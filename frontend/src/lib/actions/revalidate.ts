'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidateVendor(slug: string) {
  revalidateTag(`vendor-${slug}`);
  revalidateTag('all-vendors');
  revalidatePath(`/vendors/${slug}`);
}

export async function revalidateVendors() {
  revalidateTag('all-vendors');
}

export async function revalidateBlog() {
  // Revalidate the blog page to fetch fresh data
  revalidatePath('/blog');
}