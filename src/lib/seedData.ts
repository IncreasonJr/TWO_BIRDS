import { supabase } from './supabaseClient';
import { MOCK_PROFILES } from '../data/mockUsers';

/**
 * Inserts all 15 mock student profiles into the public.profiles table.
 * Converts each profile to a fixed deterministic UUID.
 * Manual function to be called from the browser console via window.seedMockProfiles()
 */
export async function seedMockProfiles(): Promise<{ success: boolean; count?: number; error?: string }> {
  console.log('[Seed] Seeding 15 mock profiles into Supabase public.profiles...');

  try {
    const rows = MOCK_PROFILES.map((profile, index) => {
      const fixedUuid = `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`;
      return {
        id: fixedUuid,
        name: profile.name,
        age: profile.age,
        major: profile.major,
        university: profile.university || 'Stanford University',
        bio: profile.bio,
        photos: profile.photos,
        interests: profile.interests,
        gender: profile.gender,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    const { data, error } = await supabase
      .from('profiles')
      .upsert(rows, { onConflict: 'id' })
      .select('id');

    if (error) {
      console.error('[Seed] Failed to seed mock profiles:', error.message);
      return { success: false, error: error.message };
    }

    const count = data?.length || rows.length;
    console.log(`[Seed] Successfully seeded ${count} profiles into Supabase!`);
    return { success: true, count };
  } catch (err: any) {
    console.error('[Seed] Unexpected error seeding profiles:', err);
    return { success: false, error: err?.message || 'Unexpected seeding error' };
  }
}

// Expose globally for manual execution in the browser console
if (typeof window !== 'undefined') {
  (window as any).seedMockProfiles = seedMockProfiles;
}
