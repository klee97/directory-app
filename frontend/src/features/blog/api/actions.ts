'use server';

import { revalidatePath } from 'next/cache';

export async function refreshPosts() {
  // Revalidate the blog page to fetch fresh data
  revalidatePath('/blog');

  return { success: true };
}