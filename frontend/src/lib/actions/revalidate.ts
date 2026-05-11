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
  revalidateTag('all-posts', { expire: 0 })
  revalidatePath('/blog')         // refreshes the article table
  revalidatePath('/blog/[slug]', 'page')  // refreshes all post pages
}