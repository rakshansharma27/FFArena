'use server'

import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Create a Supabase admin client to bypass RLS for administrative actions (like signup post-processing)
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
}

export async function signInAction(formData: any) {
  const { email, password } = formData

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createServerSupabase()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signUpAction(formData: any) {
  const { username, display_name, email, password, role, state, city } = formData

  if (!username || !display_name || !email || !password || !role || !state || !city) {
    return { error: 'All fields are required' }
  }

  // Validate username format
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
  if (!usernameRegex.test(username)) {
    return {
      error: 'Username must be 3-30 characters and only contain letters, numbers, or underscores',
    }
  }

  const adminClient = createAdminClient()

  // Check if username is already taken
  const { data: existingUser } = await adminClient
    .from('profiles')
    .select('username')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  if (existingUser) {
    return { error: 'Username is already taken' }
  }

  const supabase = await createServerSupabase()

  // Sign up the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name,
        state,
        city,
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  const userId = authData.user?.id
  if (!userId) {
    return { error: 'User registration failed' }
  }

  // Update profile with custom details (username, display name, chosen role, state, city)
  // using admin client because session might be unconfirmed/pending.
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({
      username: username.toLowerCase(),
      display_name,
      role,
      state,
      city,
    })
    .eq('id', userId)

  if (profileError) {
    console.error('Error updating profile details during signup:', profileError)
    // We won't block signup if this fails, but it shouldn't fail.
  }

  revalidatePath('/', 'layout')
  return {
    success: true,
    emailConfirmationRequired: authData.session === null,
  }
}

export async function signOutAction() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function resetPasswordRequestAction(formData: any) {
  const { email } = formData

  if (!email) {
    return { error: 'Email is required' }
  }

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePasswordAction(formData: any) {
  const { password } = formData

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updateProfileAction(profileData: any) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase.from('profiles').update(profileData).eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function uploadAvatarAction(base64Image: string, fileType: string) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Convert base64 back to buffer/blob
  const buffer = Buffer.from(base64Image, 'base64')
  const fileName = `${user.id}/${Date.now()}.${fileType.split('/')[1]}`

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, buffer, {
      contentType: fileType,
      upsert: true,
    })

  if (uploadError) {
    return { error: uploadError.message }
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(fileName)

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true, avatarUrl: publicUrl }
}

export async function checkUsernameAction(username: string) {
  if (!username || username.length < 3) {
    return { isAvailable: false }
  }

  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('profiles')
    .select('username')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  return { isAvailable: !data }
}
