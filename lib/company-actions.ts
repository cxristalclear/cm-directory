'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateCompany(formData: FormData) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const website = formData.get('website') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string

  const { error } = await supabase
    .from('companies')
    .update({
      name,
      description,
      website,
      email,
      phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath(`/companies/${id}`)
  
  return { success: true }
}

export async function deleteCompany(id: string) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  
  return { success: true }
}

export async function createCompany(formData: FormData) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = formData.get('name') as string
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const description = formData.get('description') as string
  const website = formData.get('website') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string
  const country = formData.get('country') as string

  const { data, error } = await supabase
    .from('companies')
    .insert({
      name,
      slug,
      description,
      website,
      email,
      phone,
      city,
      state,
      country,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  
  return { success: true, data }
}