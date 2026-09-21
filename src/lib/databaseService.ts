import { supabase } from './supabaseClient';
import { UserProfile, Match, Message, AppNotification, NotificationPreferences, NotificationType } from '../types';
import { filterMessage } from './profanityFilter';
import { sendPushNotification } from './oneSignalApi';

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
    const blockedIds = await getAllBlockedRelationIds(userId);
    const rawExcludedIds = Array.from(new Set([...swipedIds, ...blockedIds]));
    // Strictly validate UUIDs to guarantee filter safety
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const excludedIds = rawExcludedIds.filter((id) => typeof id === 'string' && uuidRegex.test(id));

    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', userId);

    if (excludedIds.length > 0) {
      // Exclude IDs already swiped on or blocked
      const formattedFilter = `(${excludedIds.join(',')})`;
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
    const swiperProfile = await getProfile(swiperId);

    // Trigger match notifications for both students (fire-and-forget)
    notifyMatchCreated(
      matchRow.id,
      swiperId,
      swipedId,
      swiperProfile?.name || 'A classmate',
      partnerProfile?.name || 'A classmate'
    ).catch((err) => console.warn('[databaseService] notifyMatchCreated error:', err));

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
    const blockedIds = await getAllBlockedRelationIds(userId);
    const blockedSet = new Set(blockedIds);

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
      if (blockedSet.has(partnerId)) {
        continue;
      }
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
    const sanitized = messageType === 'text' ? filterMessage(content.trim()) : content.trim();

    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        content: sanitized,
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

    // Trigger notification to recipient (fire-and-forget)
    (async () => {
      try {
        const { data: mRow } = await supabase
          .from('matches')
          .select('user_a, user_b')
          .eq('id', matchId)
          .maybeSingle();

        if (mRow) {
          const recipientId = mRow.user_a === senderId ? mRow.user_b : mRow.user_a;
          if (recipientId) {
            const senderProfile = await getProfile(senderId);
            const preview = messageType === 'voice' ? 'Sent a voice note 🎙️' : sanitized;
            notifyNewMessage(
              matchId,
              recipientId,
              senderProfile?.name || 'Your match',
              preview
            );
          }
        }
      } catch (notifErr) {
        console.warn('[databaseService] notifyNewMessage fire-and-forget error:', notifErr);
      }
    })();

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

/* ==========================================================================
   BLOCKS & REPORTS
   ========================================================================== */

export async function blockUser(
  blockerId: string,
  blockedId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: blockError } = await supabase
      .from('blocks')
      .upsert(
        {
          blocker_id: blockerId,
          blocked_id: blockedId,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'blocker_id,blocked_id' }
      );

    if (blockError) {
      console.error('[databaseService] blockUser error:', blockError.message);
      return { success: false, error: blockError.message };
    }

    // Remove any existing match between them (bidirectional check)
    await supabase
      .from('matches')
      .delete()
      .or(`and(user_a.eq.${blockerId},user_b.eq.${blockedId}),and(user_a.eq.${blockedId},user_b.eq.${blockerId})`);

    return { success: true };
  } catch (err: any) {
    console.error('[databaseService] blockUser unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to block user' };
  }
}

export async function unblockUser(
  blockerId: string,
  blockedId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);

    if (error) {
      console.error('[databaseService] unblockUser error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[databaseService] unblockUser unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to unblock user' };
  }
}

export async function getBlockedUserIds(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', userId);

    if (error || !data) {
      console.warn('[databaseService] getBlockedUserIds error:', error?.message);
      return [];
    }

    return data.map((row: any) => row.blocked_id);
  } catch (err) {
    console.error('[databaseService] getBlockedUserIds unexpected error:', err);
    return [];
  }
}

export async function getAllBlockedRelationIds(userId: string): Promise<string[]> {
  try {
    // 1. Users blocked by current user
    const { data: blockedByMe, error: err1 } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', userId);

    // 2. Users who blocked current user
    const { data: blockedMe, error: err2 } = await supabase
      .from('blocks')
      .select('blocker_id')
      .eq('blocked_id', userId);

    if (err1) console.warn('[databaseService] getAllBlockedRelationIds err1:', err1.message);
    if (err2) console.warn('[databaseService] getAllBlockedRelationIds err2:', err2.message);

    const ids: string[] = [];
    if (blockedByMe) {
      ids.push(...blockedByMe.map((r: any) => r.blocked_id));
    }
    if (blockedMe) {
      ids.push(...blockedMe.map((r: any) => r.blocker_id));
    }

    return Array.from(new Set(ids));
  } catch (err) {
    console.error('[databaseService] getAllBlockedRelationIds error:', err);
    return [];
  }
}

export async function getBlockedUsers(userId: string): Promise<UserProfile[]> {
  try {
    const blockedIds = await getBlockedUserIds(userId);
    if (blockedIds.length === 0) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', blockedIds);

    if (error || !data) {
      console.warn('[databaseService] getBlockedUsers error:', error?.message);
      return [];
    }

    return data.map(mapProfileRowToUserProfile);
  } catch (err) {
    console.error('[databaseService] getBlockedUsers unexpected error:', err);
    return [];
  }
}

export async function isUserBlocked(userId: string, otherUserId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('id')
      .eq('blocker_id', userId)
      .eq('blocked_id', otherUserId)
      .maybeSingle();

    if (error || !data) return false;
    return true;
  } catch (err) {
    console.error('[databaseService] isUserBlocked error:', err);
    return false;
  }
}

export async function reportUser(
  reporterId: string,
  reportedId: string,
  reason: string,
  details?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        reported_id: reportedId,
        reason: reason.trim(),
        details: details?.trim() || null,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[databaseService] reportUser error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[databaseService] reportUser unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to report user' };
  }
}

export async function hasReportedUser(
  reporterId: string,
  reportedId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', reporterId)
      .eq('reported_id', reportedId)
      .maybeSingle();

    if (error || !data) return false;
    return true;
  } catch (err) {
    console.error('[databaseService] hasReportedUser error:', err);
    return false;
  }
}

/* ==========================================================================
   ACCOUNT DELETION
   ========================================================================== */

export async function deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Fetch user photos and delete them from storage
    const profile = await getProfile(userId);
    if (profile && Array.isArray(profile.photos)) {
      for (const photoUrl of profile.photos) {
        await deletePhoto(userId, photoUrl);
      }
    }

    // 2. Delete user data across tables
    // Delete swipes
    await supabase.from('swipes').delete().or(`swiper_id.eq.${userId},swiped_id.eq.${userId}`);
    // Delete messages
    await supabase.from('messages').delete().eq('sender_id', userId);
    // Delete matches
    await supabase.from('matches').delete().or(`user_a.eq.${userId},user_b.eq.${userId}`);
    // Delete reports
    await supabase.from('reports').delete().or(`reporter_id.eq.${userId},reported_id.eq.${userId}`);
    // Delete blocks
    await supabase.from('blocks').delete().or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
    // Delete notifications & preferences
    await supabase.from('notifications').delete().eq('user_id', userId);
    await supabase.from('notification_preferences').delete().eq('user_id', userId);
    // Delete profile
    const { error: profErr } = await supabase.from('profiles').delete().eq('id', userId);
    if (profErr) {
      console.warn('[databaseService] deleteAccount profile delete error:', profErr.message);
    }

    // 3. Sign out
    await supabase.auth.signOut();

    return { success: true };
  } catch (err: any) {
    console.error('[databaseService] deleteAccount unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to delete account' };
  }
}

/* ==========================================================================
   NOTIFICATIONS & PREFERENCES
   ========================================================================== */

export function mapNotificationRow(row: any): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as NotificationType,
    title: row.title,
    body: row.body,
    data: row.data || {},
    isRead: row.is_read,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapPreferencesRow(row: any, userId: string): NotificationPreferences {
  if (!row) {
    return {
      userId,
      pushEnabled: true,
      matchesEnabled: true,
      messagesEnabled: true,
      likesEnabled: true,
    };
  }
  return {
    userId: row.user_id || userId,
    pushEnabled: row.push_enabled ?? true,
    matchesEnabled: row.matches_enabled ?? true,
    messagesEnabled: row.messages_enabled ?? true,
    likesEnabled: row.likes_enabled ?? true,
    updatedAt: row.updated_at,
  };
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data: Record<string, any> = {}
): Promise<{ success: boolean; notification?: AppNotification; error?: string }> {
  try {
    const { data: row, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        body,
        data,
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error || !row) {
      console.error('[databaseService] createNotification error:', error?.message);
      return { success: false, error: error?.message || 'Failed to create notification' };
    }

    return { success: true, notification: mapNotificationRow(row) };
  } catch (err: any) {
    console.error('[databaseService] createNotification unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to create notification' };
  }
}

export async function getUserNotifications(
  userId: string,
  limit: number = 50
): Promise<AppNotification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.warn('[databaseService] getUserNotifications error:', error?.message);
      return [];
    }

    return data.map(mapNotificationRow);
  } catch (err) {
    console.error('[databaseService] getUserNotifications unexpected error:', err);
    return [];
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.warn('[databaseService] getUnreadNotificationCount error:', error.message);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('[databaseService] getUnreadNotificationCount unexpected error:', err);
    return 0;
  }
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('[databaseService] markNotificationAsRead error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to mark notification as read' };
  }
}

export async function markAllNotificationsAsRead(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('[databaseService] markAllNotificationsAsRead error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to mark all as read' };
  }
}

export async function deleteNotification(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('[databaseService] deleteNotification error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete notification' };
  }
}

export function subscribeToNotifications(
  userId: string,
  callback: (notification: AppNotification) => void
): () => void {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new) {
          callback(mapNotificationRow(payload.new));
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[databaseService] getNotificationPreferences error:', error.message);
    }

    if (!data) {
      const defaultPrefs = {
        user_id: userId,
        push_enabled: true,
        matches_enabled: true,
        messages_enabled: true,
        likes_enabled: true,
        updated_at: new Date().toISOString(),
      };
      await supabase
        .from('notification_preferences')
        .upsert(defaultPrefs, { onConflict: 'user_id' });
      return mapPreferencesRow(defaultPrefs, userId);
    }

    return mapPreferencesRow(data, userId);
  } catch (err) {
    console.error('[databaseService] getNotificationPreferences unexpected error:', err);
    return mapPreferencesRow(null, userId);
  }
}

export async function updateNotificationPreferences(
  userId: string,
  prefs: Partial<Omit<NotificationPreferences, 'userId' | 'updatedAt'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: Record<string, any> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    if (prefs.pushEnabled !== undefined) payload.push_enabled = prefs.pushEnabled;
    if (prefs.matchesEnabled !== undefined) payload.matches_enabled = prefs.matchesEnabled;
    if (prefs.messagesEnabled !== undefined) payload.messages_enabled = prefs.messagesEnabled;
    if (prefs.likesEnabled !== undefined) payload.likes_enabled = prefs.likesEnabled;

    const { error } = await supabase
      .from('notification_preferences')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      console.error('[databaseService] updateNotificationPreferences error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update preferences' };
  }
}

export async function notifyMatchCreated(
  matchId: string,
  userAId: string,
  userBId: string,
  userAName: string,
  userBName: string
): Promise<void> {
  try {
    // 1. In-app notifications for both users
    await Promise.allSettled([
      createNotification(
        userAId,
        'match',
        "It's a Match! 🎉",
        `You and ${userBName} liked each other. Say hello!`,
        { matchId, type: 'match', screen: '/chat' }
      ),
      createNotification(
        userBId,
        'match',
        "It's a Match! 🎉",
        `You and ${userAName} liked each other. Say hello!`,
        { matchId, type: 'match', screen: '/chat' }
      ),
    ]);

    // 2. Push notifications (respecting preferences)
    const [prefsA, prefsB] = await Promise.all([
      getNotificationPreferences(userAId),
      getNotificationPreferences(userBId),
    ]);

    if (prefsA.pushEnabled && prefsA.matchesEnabled) {
      await sendPushNotification(
        userAId,
        "It's a Match! 🎉",
        `You and ${userBName} liked each other. Say hello!`,
        { matchId, type: 'match', screen: '/chat' }
      );
    }

    if (prefsB.pushEnabled && prefsB.matchesEnabled) {
      await sendPushNotification(
        userBId,
        "It's a Match! 🎉",
        `You and ${userAName} liked each other. Say hello!`,
        { matchId, type: 'match', screen: '/chat' }
      );
    }
  } catch (err) {
    console.error('[databaseService] notifyMatchCreated error:', err);
  }
}

export async function notifyNewMessage(
  matchId: string,
  recipientId: string,
  senderName: string,
  messagePreview: string
): Promise<void> {
  try {
    const preview =
      messagePreview.length > 100
        ? `${messagePreview.slice(0, 97)}...`
        : messagePreview;

    // 1. In-app notification for recipient
    await createNotification(
      recipientId,
      'message',
      `New message from ${senderName}`,
      preview,
      { matchId, type: 'message', screen: '/chat' }
    );

    // 2. Push notification (respecting preferences)
    const prefs = await getNotificationPreferences(recipientId);
    if (prefs.pushEnabled && prefs.messagesEnabled) {
      await sendPushNotification(
        recipientId,
        `New message from ${senderName}`,
        preview,
        { matchId, type: 'message', screen: '/chat' }
      );
    }
  } catch (err) {
    console.error('[databaseService] notifyNewMessage error:', err);
  }
}


