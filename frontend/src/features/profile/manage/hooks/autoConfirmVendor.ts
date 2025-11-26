"use server";

import { supabaseAdmin } from '@/lib/admin-client';

export async function autoConfirmVendorEmail(userId: string) {
  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true
    });

    if (error) {
      console.error('Failed to auto-confirm email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error auto-confirming email:', error);
    return { success: false, error: String(error) };
  }
}