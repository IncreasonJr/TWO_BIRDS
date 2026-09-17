import { supabase } from './supabaseClient';
import { UserProfile, Match, Message } from '../types';

export function mapProfileRowToUserProfile(row: any): UserProfile {
  return {
    id: row.id,
    uid: row.id,
    name: row.name || 'Student',
    email: row.email || '',
    age: row.age || 20,
    gender: row.gender || 'Other',
    major: row.major || 'Undecided',
    university: row.university || 'Stanford University',
    gradYear: 2026,
    bio: row.bio || '',
    photos: Array.isArray(row.photos) ? row.photos : [],
    interests: Array.isArray(row.interests) && row.interests.length > 0
      ? row.interests
      : ['Campus Life', 'Coffee', 'Study Groups'],
    verifiedCampus: true,
    distanceMiles: 0,
    onlineStatus: 'online',
    lastActive: row.updated_at || new Date().toISOString(),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/* ==========================================================================
   PROFILES
   ========================================================================== */

export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[databaseService] getProfile error:', error.message);
      return null;
    }

    if (!data) return null;
    return mapProfileRowToUserProfile(data);
  } catch (err) {
    console.error('[databaseService] getProfile unexpected error:', err);
    return null;
  }
}

export async function getAllProfilesExcept(
  userId: string,
  swipedIds: string[] = []
): Promise<UserProfile[]> {
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', userId);

    if (swipedIds.length > 0) {
      // Exclude IDs already swiped on
      const formattedFilter = `(${swipedIds.join(',')})`;
      query = query.not('id', 'in', formattedFilter);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn('[databaseService] getAllProfilesExcept error:', error.message);
      return [];
    }

    if (!data) return [];
    return data.map(mapProfileRowToUserProfile);
  } catch (err) {
    console.error('[databaseService] getAllProfilesExcept unexpected error:', err);
    return [];
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.age !== undefined) payload.age = updates.age;
    if (updates.major !== undefined) payload.major = updates.major;
    if (updates.university !== undefined) payload.university = updates.university;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.gender !== undefined) payload.gender = updates.gender;
    if (updates.photos !== undefined) payload.photos = updates.photos;
    if (updates.interests !== undefined) payload.interests = updates.interests;

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update profile' };
  }
}

export async function createDefaultProfile(
  userId: string,
  email: string,
  metadata: Record<string, any> = {}
): Promise<UserProfile | null> {
  try {
    const newProfile = {
      id: userId,
      name: metadata.name || 'Student',
      email: email,
      age: metadata.age ? Number(metadata.age) : 20,
      gender: metadata.gender || 'Other',
      major: metadata.major || 'Undecided',
      university: metadata.university || 'Stanford University',
      bio: metadata.bio || 'Excited to connect with fellow students on campus!',
      photos: Array.isArray(metadata.photos) ? metadata.photos : [],
      interests: ['Campus Life', 'Coffee', 'Study Groups'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(newProfile)
      .select('*')
      .single();

    if (error) {
      console.warn('[databaseService] createDefaultProfile error:', error.message);
      return mapProfileRowToUserProfile(newProfile);
    }

    return mapProfileRowToUserProfile(data);
  } catch (err) {
    console.error('[databaseService] createDefaultProfile unexpected error:', err);
    return null;
  }
}

/* ==========================================================================
   SWIPES
   ========================================================================== */

export async function saveSwipe(
  swiperId: string,
  swipedId: string,
  direction: 'like' | 'pass'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('swipes')
      .upsert(
        {
          swiper_id: swiperId,
          swiped_id: swipedId,
          direction,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'swiper_id,swiped_id' }
      );

    if (error) {
      console.warn('[databaseService] saveSwipe error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save swipe' };
  }
}

export async function getSwipedIds(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', userId);

    if (error) {
      console.warn('[databaseService] getSwipedIds error:', error.message);
      return [];
    }

    if (!data) return [];
    return data.map((row: any) => row.swiped_id);
  } catch (err) {
    console.error('[databaseService] getSwipedIds error:', err);
    return [];
  }
}

export async function checkForMatch(
  swiperId: string,
  swipedId: string
): Promise<Match | null> {
  try {
    // Check reciprocal like
    const { data: reciprocal, error: recError } = await supabase
      .from('swipes')
      .select('*')
      .eq('swiper_id', swipedId)
      .eq('swiped_id', swiperId)
      .eq('direction', 'like')
      .maybeSingle();

    if (recError || !reciprocal) {
      return null;
    }

    // Sort user IDs for unique(user_a, user_b)
    const [user_a, user_b] = [swiperId, swipedId].sort();

    const { data: matchRow, error: matchError } = await supabase
      .from('matches')
      .upsert({ user_a, user_b }, { onConflict: 'user_a,user_b' })
      .select('*')
      .single();

    if (matchError || !matchRow) {
      console.error('[databaseService] checkForMatch error creating match:', matchError);
      return null;
    }

    const partnerProfile = await getProfile(swipedId);

    const matchObj: Match = {
      id: matchRow.id,
      userId: swipedId,
      name: partnerProfile?.name || 'New Match',
      age: partnerProfile?.age || 20,
      major: partnerProfile?.major || '',
      photos: partnerProfile?.photos || ['/logo192.png'],
      onlineStatus: 'online',
      lastActive: new Date(),
      matchedAt: matchRow.created_at,
      messages: [],
      users: [user_a, user_b],
      user: partnerProfile || ({} as any),
      lastMessage: 'Matched! Send the first message.',
      lastMessageTimestamp: 'Just now',
      unread: true,
      online: true,
    };

    return matchObj;
  } catch (err) {
    console.error('[databaseService] checkForMatch unexpected error:', err);
    return null;
  }
}

/* ==========================================================================
   MATCHES
   ========================================================================== */

export async function getUserMatches(userId: string): Promise<Match[]> {
  try {
    const { data: matchRows, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error || !matchRows) {
      console.warn('[databaseService] getUserMatches error:', error?.message);
      return [];
    }

    const matches: Match[] = [];

    for (const row of matchRows) {
      const partnerId = row.user_a === userId ? row.user_b : row.user_a;
      const partnerProfile = await getProfile(partnerId);

      // Fetch last message
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', row.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      matches.push({
        id: row.id,
        userId: partnerId,
        name: partnerProfile?.name || 'Student',
        age: partnerProfile?.age || 20,
        major: partnerProfile?.major || '',
        photos: partnerProfile?.photos || ['/logo192.png'],
        onlineStatus: 'online',
        lastActive: new Date(),
        matchedAt: row.created_at,
        messages: [],
        users: [row.user_a, row.user_b],
        user: partnerProfile || ({} as any),
        lastMessage: lastMsg?.content || 'Matched! Send the first message.',
        lastMessageTimestamp: lastMsg?.created_at
          ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Just now',
        unread: lastMsg ? !lastMsg.is_read && lastMsg.sender_id !== userId : true,
        online: true,
      });
    }

    return matches;
  } catch (err) {
    console.error('[databaseService] getUserMatches error:', err);
    return [];
  }
}

export async function getMatchById(matchId: string, currentUserId: string): Promise<Match | null> {
  try {
    const { data: row, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (error || !row) return null;

    const partnerId = row.user_a === currentUserId ? row.user_b : row.user_a;
    const partnerProfile = await getProfile(partnerId);

    return {
      id: row.id,
      userId: partnerId,
      name: partnerProfile?.name || 'Student',
      age: partnerProfile?.age || 20,
      major: partnerProfile?.major || '',
      photos: partnerProfile?.photos || ['/logo192.png'],
      onlineStatus: 'online',
      lastActive: new Date(),
      matchedAt: row.created_at,
      messages: [],
      users: [row.user_a, row.user_b],
      user: partnerProfile || ({} as any),
      unread: false,
      online: true,
    };
  } catch (err) {
    console.error('[databaseService] getMatchById error:', err);
    return null;
  }
}

/* ==========================================================================
   MESSAGES
   ========================================================================== */

export async function getMessages(matchId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.warn('[databaseService] getMessages error:', error?.message);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      matchId: row.match_id,
      senderId: row.sender_id,
      receiverId: '',
      text: row.content,
      timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: row.is_read,
      type: (row.message_type as 'text' | 'voice') || 'text',
      audioUrl: row.message_type === 'voice' ? row.content : undefined,
    }));
  } catch (err) {
    console.error('[databaseService] getMessages error:', err);
    return [];
  }
}

export async function sendMessage(
  matchId: string,
  senderId: string,
  content: string,
  messageType: 'text' | 'voice' = 'text'
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        content: content.trim(),
        message_type: messageType,
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('[databaseService] sendMessage error:', error);
      return null;
    }

    return {
      id: data.id,
      matchId: data.match_id,
      senderId: data.sender_id,
      receiverId: '',
      text: data.content,
      timestamp: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: data.is_read,
      type: data.message_type,
      audioUrl: data.message_type === 'voice' ? data.content : undefined,
    };
  } catch (err) {
    console.error('[databaseService] sendMessage error:', err);
    return null;
  }
}

export function subscribeToMessages(
  matchId: string,
  callback: (msg: Message) => void
): () => void {
  const channel = supabase
    .channel(`messages:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        const row = payload.new;
        if (!row) return;

        const msg: Message = {
          id: row.id,
          matchId: row.match_id,
          senderId: row.sender_id,
          receiverId: '',
          text: row.content,
          timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: row.is_read,
          type: row.message_type || 'text',
          audioUrl: row.message_type === 'voice' ? row.content : undefined,
        };
        callback(msg);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/* ==========================================================================
   STORAGE & PHOTOS
   ========================================================================== */

export async function uploadPhoto(
  userId: string,
  fileOrBlob: File | Blob
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, fileOrBlob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('[databaseService] uploadPhoto error:', uploadError.message);
      return { success: false, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
  } catch (err: any) {
    console.error('[databaseService] uploadPhoto unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to upload photo' };
  }
}

export async function deletePhoto(
  userId: string,
  photoUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!photoUrl) return { success: true };

    const bucketIdentifier = '/profile-photos/';
    const bucketIndex = photoUrl.indexOf(bucketIdentifier);

    // If not a Supabase storage photo (e.g. Unsplash URL or external link), nothing to remove from bucket
    if (bucketIndex === -1) {
      return { success: true };
    }

    const filePath = decodeURIComponent(
      photoUrl.substring(bucketIndex + bucketIdentifier.length).split('?')[0]
    );

    if (!filePath.startsWith(userId)) {
      console.warn('[databaseService] Security check: photo does not belong to user', filePath, userId);
      return { success: false, error: 'Unauthorized to delete this photo' };
    }

    const { error } = await supabase.storage
      .from('profile-photos')
      .remove([filePath]);

    if (error) {
      console.warn('[databaseService] deletePhoto storage error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[databaseService] deletePhoto unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to delete photo' };
  }
}

export async function updateProfilePhotos(
  userId: string,
  photos: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        photos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('[databaseService] updateProfilePhotos error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[databaseService] updateProfilePhotos unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to update profile photos' };
  }
}

