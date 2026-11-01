import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { supabase, localDb, DEFAULT_NEUTRAL_AVATAR } from '../config/supabase';
import { issueSessionToken } from '../config/sessionToken';

export async function createSession(req: Request, res: Response): Promise<void> {
  try {
    const { email, displayName, uid, forceOnboardingCompleted } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email address is required to initiate session' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (displayName || email.split('@')[0] || 'Planora Member').trim();
    const hash = Math.abs(cleanEmail.split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0));
    const targetUid = uid && typeof uid === 'string' && uid.length > 3 ? uid : `usr_${hash}`;

    // Issue server-side HMAC signed token
    const token = issueSessionToken(targetUid, cleanEmail, cleanName);

    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            firebase_uid: targetUid,
            email: cleanEmail,
            display_name: cleanName,
            photo_url: DEFAULT_NEUTRAL_AVATAR,
            onboarding_completed: forceOnboardingCompleted ?? false,
            last_login_at: new Date().toISOString(),
          },
          { onConflict: 'firebase_uid' }
        )
        .select()
        .single();

      if (!error && data) {
        res.json({ success: true, token, profile: data });
        return;
      }
    }

    const localProfile = await localDb.syncUser(
      targetUid,
      cleanEmail,
      cleanName,
      DEFAULT_NEUTRAL_AVATAR
    );

    res.json({ success: true, token, profile: localProfile });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create authenticated session', details: err.message });
  }
}

export async function syncUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const { displayName, photoURL } = req.body;

    if (supabase) {
      // Upsert profile in Supabase
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            firebase_uid: user.uid,
            email: user.email || `${user.uid}@example.com`,
            display_name: displayName || user.name || 'Planora Member',
            photo_url: photoURL || DEFAULT_NEUTRAL_AVATAR,
            last_login_at: new Date().toISOString(),
          },
          { onConflict: 'firebase_uid' }
        )
        .select()
        .single();

      if (error) {
        console.warn('Supabase sync warning:', error);
      } else if (data) {
        res.json({ success: true, profile: data });
        return;
      }
    }

    // Fallback to local DB store
    const localProfile = await localDb.syncUser(
      user.uid,
      user.email || '',
      displayName || user.name || '',
      photoURL || ''
    );

    res.json({ success: true, profile: localProfile });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to sync user profile', details: err.message });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const authenticatedUid = req.user!.uid;

    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', authenticatedUid)
        .single();

      if (!error && data) {
        res.json({ success: true, profile: data });
        return;
      }
    }

    const localProfile = await localDb.getUserProfile(authenticatedUid);
    if (!localProfile) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    res.json({ success: true, profile: localProfile });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve profile', details: err.message });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const authenticatedUid = req.user!.uid;
    const {
      name,
      email,
      photoUrl,
      phone,
      city,
      preferredLanguage,
      bio,
      onboardingCompleted,
      timezone,
      preferences,
    } = req.body;

    // Reject modification attempts to sensitive fields
    if (req.body.firebase_uid || req.body.id || req.body.subscription_tier) {
      res.status(400).json({ error: 'Invalid request: Cannot modify system identifiers or subscription tier directly' });
      return;
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) updatePayload.display_name = name;
    if (email !== undefined) updatePayload.email = email;
    if (photoUrl !== undefined) updatePayload.photo_url = photoUrl;
    if (phone !== undefined) updatePayload.phone = phone;
    if (city !== undefined) updatePayload.city = city;
    if (preferredLanguage !== undefined) updatePayload.preferred_language = preferredLanguage;
    if (bio !== undefined) updatePayload.bio = bio;
    if (onboardingCompleted !== undefined) updatePayload.onboarding_completed = onboardingCompleted;
    if (timezone !== undefined) updatePayload.timezone = timezone;
    if (preferences !== undefined) updatePayload.preferences = preferences;

    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('firebase_uid', authenticatedUid)
        .select()
        .single();

      if (!error && data) {
        res.json({ success: true, profile: data });
        return;
      }
    }

    const updated = await localDb.updateUserProfile(authenticatedUid, {
      display_name: name,
      email,
      photo_url: photoUrl,
      phone,
      city,
      preferred_language: preferredLanguage,
      bio,
      onboarding_completed: onboardingCompleted,
      updated_at: new Date().toISOString(),
    });

    if (!updated) {
      res.status(404).json({ error: 'Profile not found for update' });
      return;
    }

    res.json({ success: true, profile: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
}

export async function uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const authenticatedUid = req.user!.uid;
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
      res.status(400).json({ error: 'imageBase64 and mimeType are required' });
      return;
    }

    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedMime.includes(mimeType)) {
      res.status(400).json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, SVG.' });
      return;
    }

    let photoUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType};base64,${imageBase64}`;

    if (supabase) {
      try {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const ext = mimeType.split('/')[1] || 'png';
        const filePath = `${authenticatedUid}/avatar_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            photoUrl = publicUrlData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.warn('Supabase storage avatar upload warning (using data url fallback):', storageErr);
      }
    }

    // Update user profile with new photoUrl
    await updateProfile(
      { ...req, body: { photoUrl } } as AuthenticatedRequest,
      res
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to upload avatar', details: err.message });
  }
}
