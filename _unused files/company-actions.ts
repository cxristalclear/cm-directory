'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { CompanyUpdate, CompanyInsert } from '@/lib/supabase'

/**
* Update a company record in the database using values from a FormData object; requires an authenticated user and will redirect to /login if not authenticated.
* @example
* updateCompany(formData)
* { success: true }
* @param {{FormData}} {{formData}} - FormData containing 'id', 'company_name', 'description', and 'website_url'.
* @returns {{Promise<{success: boolean} | {error: string}>}} Return an object with success:true on success or an error message on failure; may redirect to /login if unauthenticated.
**/
export async function updateCompany(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  const company_name = formData.get('company_name') as string
  const description = formData.get('description') as string
  const website_url = formData.get('website_url') as string

  // Build update object with correct field names
  const updates: CompanyUpdate = {
    company_name,
    description,
    website_url,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/dashboard')
  return { success: true }
}

/**
* Create a new company in Supabase from provided FormData, generate a slug, insert it into the companies table, and revalidate the admin dashboard.
* @example
* createCompany(formData)
* { success: true, data: { id: 123, company_name: 'Acme', slug: 'acme', description: 'Acme description', website_url: 'https://acme.com' } }
* @param {FormData} formData - Form data containing company_name, description, and website_url.
* @returns {Promise<{success?: boolean, data?: any, error?: string}>} Return a promise resolving to an object with success and data on success or an error message on failure.
*/
export async function createCompany(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const company_name = formData.get('company_name') as string
  const slug = company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const description = formData.get('description') as string
  const website_url = formData.get('website_url') as string

  // Build insert object with correct field names
  const newCompany: CompanyInsert = {
    company_name,
    slug,
    description,
    website_url,
  }

  const { data, error } = await supabase
    .from('companies')
    .insert(newCompany)
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/admin/dashboard')
  return { success: true, data }
}

// Optional: Handle contacts separately
/**
* Update or create the primary contact for a company using provided FormData; redirects to login if the user is not authenticated.
* @example
* updateCompanyContact(formData)
* { success: true }
* @param {{FormData}} {{formData}} - FormData containing 'company_id', 'email', and 'phone'.
* @returns {{Promise<{success: boolean} | {error: string}>}} Promise resolving to an object with success:true or an error message.
**/
export async function updateCompanyContact(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const company_id = formData.get('company_id') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string

  // Check if primary contact exists
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('company_id', company_id)
    .eq('is_primary', true)
    .single()

  if (existingContact) {
    // Update existing contact
    const { error } = await supabase
      .from('contacts')
      .update({
        email,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingContact.id)

    if (error) return { error: error.message }
  } else {
    // Create new primary contact
    const { error } = await supabase
      .from('contacts')
      .insert({
        company_id,
        email,
        phone,
        is_primary: true,
        contact_type: 'general', // Adjust based on your needs
      })

    if (error) return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  return { success: true }
}