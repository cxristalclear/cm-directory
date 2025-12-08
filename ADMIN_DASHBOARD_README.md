# Admin Dashboard Implementation Guide

## 📦 Required Packages

Install these additional packages:

```bash
npm install @supabase/auth-helpers-nextjs sonner
# or
yarn add @supabase/auth-helpers-nextjs sonner
```

**Package explanations:**
- `@supabase/auth-helpers-nextjs` - Supabase authentication helpers for Next.js App Router
- `sonner` - Toast notifications for user feedback

## 📁 File Structure

Here's the complete file structure created:

```
pcba-finder/
├── app/
│   └── admin/
│       ├── login/
│       │   └── page.tsx                    # Login page
│       └── (dashboard)/
│           ├── layout.tsx                   # Dashboard layout with auth
│           ├── dashboard/
│           │   └── page.tsx                 # Dashboard home
│           └── companies/
│               ├── page.tsx                 # All companies list
│               ├── add/
│               │   └── page.tsx             # Add company
│               ├── edit/
│               │   └── [slug]/
│               │       └── page.tsx         # Edit company
│               └── [slug]/
│                   └── history/
│                       └── page.tsx         # Change history
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx                 # Sidebar navigation
│       ├── AdminHeader.tsx                  # Header with search & logout
│       ├── CompanyForm.tsx                  # Reusable company form
│       ├── EditCompanyForm.tsx              # Edit wrapper with tracking
│       ├── CompanyTable.tsx                 # Companies list table
│       └── ChangeHistoryTimeline.tsx        # Change history display
├── lib/
│   └── admin/
│       └── utils.ts                         # Admin utility functions
├── types/
│   └── admin.ts                             # Admin-specific types
└── middleware.ts                            # Route protection

```

## 🗄️ Database Setup

### 1. Create Admin User

First, create an admin user in Supabase:

```sql
-- Go to Supabase Dashboard > Authentication > Users
-- Click "Add User"
-- Email: your-admin@example.com
-- Password: [secure password]
-- Email Confirm: Check this box to auto-confirm
```

### 2. Verify Database Schema

Your database should already have these tables based on your uploaded schema:
- `companies` - Main company data
- `facilities` - Company locations
- `capabilities` - Manufacturing capabilities
- `industries` - Industries served
- `certifications` - Company certifications
- `technical_specs` - Technical specifications
- `business_info` - Business information
- `company_change_log` - Change tracking

### 3. Create Missing Tables (if needed)

If you don't have the `company_change_log` table yet, create it:

```sql
CREATE TABLE IF NOT EXISTS company_change_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  changed_by_email TEXT NOT NULL,
  changed_by_name TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'claimed', 'updated', 'verified', 'approved', 'rejected')),
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  change_summary JSONB,
  reviewed_by TEXT,
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_company_change_log_company_id ON company_change_log(company_id);
CREATE INDEX idx_company_change_log_changed_at ON company_change_log(changed_at DESC);
```

### 4. Update Companies Table (if needed)

Make sure your companies table has these fields for claims and verification:

```sql
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'unclaimed' CHECK (claim_status IN ('unclaimed', 'pending_review', 'claimed', 'rejected')),
ADD COLUMN IF NOT EXISTS claimed_by_email TEXT,
ADD COLUMN IF NOT EXISTS claimed_by_name TEXT,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS claim_approved_by TEXT,
ADD COLUMN IF NOT EXISTS claim_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS claim_rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_by TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS has_pending_updates BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_reviewed_by TEXT;
```

## 🚀 Implementation Steps

### 🧭 Admin Task Guidelines

- Always rely on the generated Supabase types in `lib/database.types.ts` when shaping payloads for admin updates. They mirror the database schema and prevent drift across forms and audit helpers.
- Before marking an admin dashboard task complete, run `npm run lint` and `tsc --noEmit` to ensure the UI passes linting and type checks against the latest Supabase definitions.

### 1. Copy All Files

Copy all the created files to your project, maintaining the directory structure shown above.

### 2. Update Your Root Layout

Add the Toaster component to your root layout (`app/layout.tsx`):

```tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
```

### 3. Update Supabase Client

Make sure your `lib/supabase.ts` exports both client and server clients. You may need to update it:

```tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = () => createClientComponentClient()
export const createServerClient = () => createServerComponentClient({ cookies })
```

### 4. Environment Variables

Ensure these are in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Development Server

```bash
npm run dev
```

### 6. Access the Admin Dashboard

Navigate to: `http://localhost:3000/admin/login`

Login with your admin credentials.

## ✅ Testing Checklist

### Authentication
- [ ] Login page loads correctly
- [ ] Can login with admin credentials
- [ ] Redirects to dashboard after login
- [ ] Can logout successfully
- [ ] Protected routes redirect to login when not authenticated

### Dashboard Home
- [ ] Total companies count displays
- [ ] Recently added companies show (up to 5)
- [ ] Recently edited companies show (up to 5)
- [ ] Quick action buttons work
- [ ] Links navigate correctly

### Add Company
- [ ] Form loads with all sections
- [ ] Can add basic company info
- [ ] Can add multiple facilities
- [ ] Can select capabilities (checkboxes work)
- [ ] Can add multiple industries
- [ ] Can add multiple certifications
- [ ] Can add technical specs
- [ ] Can add business info
- [ ] "Save as Draft" creates inactive company
- [ ] "Publish" creates active company
- [ ] Auto-generates slug from company name
- [ ] Shows success toast after creation
- [ ] Redirects to companies list after success
- [ ] Change log entry created for new company

### All Companies List
- [ ] Companies display in table
- [ ] Search by name works
- [ ] Filter by status (Active/Draft) works
- [ ] Filter by verified status works
- [ ] Pagination works (if > 20 companies)
- [ ] Edit link navigates correctly
- [ ] Delete requires double-click confirmation
- [ ] Delete removes company and related data
- [ ] View History link works

### Edit Company
- [ ] Form pre-fills with existing data
- [ ] All facilities display
- [ ] All capabilities are checked correctly
- [ ] All industries display
- [ ] All certifications display
- [ ] Technical specs display
- [ ] Business info displays
- [ ] Can modify any field
- [ ] Changes are saved correctly
- [ ] Change log entries created for edits
- [ ] Shows "Last modified" date
- [ ] Updates `last_reviewed_by` and `last_reviewed_at`

### Change History
- [ ] History page displays for company
- [ ] Shows all change log entries
- [ ] Displays chronologically (newest first)
- [ ] Shows who made changes
- [ ] Shows what changed (field name)
- [ ] Shows old and new values
- [ ] Change type badges display correctly
- [ ] Timestamps are formatted correctly

### UI/UX
- [ ] Sidebar navigation works
- [ ] Mobile menu works (responsive)
- [ ] Header search bar displays
- [ ] User dropdown menu works
- [ ] Toast notifications appear for actions
- [ ] Loading states show during operations
- [ ] Forms are responsive on mobile
- [ ] Error states display appropriately

## 🐛 Troubleshooting

### "Module not found" errors
- Run `npm install` or `yarn install` to ensure all packages are installed
- Clear `.next` folder and restart dev server: `rm -rf .next && npm run dev`

### Authentication issues
- Verify admin user exists in Supabase Dashboard > Authentication > Users
- Check environment variables are set correctly
- Check browser console for Supabase errors

### Database errors
- Verify all tables exist in Supabase Dashboard > Table Editor
- Check RLS (Row Level Security) policies if queries fail
- For initial setup, you may need to disable RLS or create appropriate policies

### Type errors
- Make sure all type definition files are in place
- Run `npm run build` to check for TypeScript errors
- Check that imports match your project structure

## 🔒 Security Notes

### Row Level Security (RLS)

For production, you should enable RLS on your tables. Here are example policies:

```sql
-- Allow authenticated admin users to manage companies
CREATE POLICY "Admin can manage companies" ON companies
FOR ALL USING (
  auth.role() = 'authenticated'
);

-- Similar policies for other tables
CREATE POLICY "Admin can manage facilities" ON facilities
FOR ALL USING (
  auth.role() = 'authenticated'
);

-- Repeat for: capabilities, industries, certifications, technical_specs, business_info, company_change_log
```

### Admin Role

For more advanced security, create an admin role:

```sql
-- Create admin role in Supabase
-- Then update policies to check for admin role
CREATE POLICY "Only admins can manage companies" ON companies
FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

## 📝 Next Steps (Phase 2 Features)

After Phase 1 is working, you can add:

1. **Claims Approval Workflow**
   - Review pending claims
   - Approve/reject claims
   - Email notifications

2. **Pending Updates Review**
   - Companies can submit updates
   - Admin reviews before approval
   - Diff viewer for changes

3. **Verification Badge Management**
   - Manual verification workflow
   - 5-year expiration tracking
   - Renewal reminders

4. **Bulk Operations**
   - Bulk import companies (CSV/Excel)
   - Bulk export
   - Bulk status changes

5. **Advanced Analytics**
   - Companies added over time
   - Most edited companies
   - Activity logs

## 🎯 Key Features Implemented

✅ Authentication with Supabase Auth
✅ Protected admin routes
✅ Dashboard with stats and recent activity
✅ Comprehensive add company form
✅ Full company editing with all related data
✅ Change tracking and history
✅ Search and filtering
✅ Delete with confirmation
✅ Responsive design
✅ Toast notifications
✅ Auto-slug generation
✅ Form validation

## 📧 Support

If you encounter issues:
1. Check this README's troubleshooting section
2. Review browser console for errors
3. Check Supabase logs in Dashboard > Logs
4. Verify database schema matches requirements

Happy building! 🚀