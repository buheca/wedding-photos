# 💒 Wedding Photo Sharing App

A simple, elegant web application that allows wedding guests to upload photos via QR code. Photos are stored securely and only accessible to the admin through a private dashboard.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Storage-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## 💡 The Problem This Solves

At weddings, guests take hundreds of photos on their phones - beautiful candid moments the professional photographer might miss. But collecting these photos is a nightmare:
- Creating WhatsApp/Telegram groups
- Asking people to send photos one by one
- Using Google Drive links that get lost
- Privacy concerns with public photo albums

**This app solves it:**
1. Print a QR code, place it on wedding tables
2. Guests scan → Upload photos instantly from their phones
3. All photos automatically collected in one secure place
4. Only the bride/groom can see and download everything
5. No app installation, no sign-up, no hassle

**Perfect for:** Weddings, engagement parties, family reunions, corporate events, birthday parties

## 🎯 Features

- **QR Code Upload**: Guests scan a QR code and upload photos instantly
- **Private by Design**: Guests cannot see other guests' photos
- **Admin Dashboard**: Secure admin panel to view, download, and delete all photos
- **Real-time Storage**: Photos are stored in Supabase Storage (cloud-based)
- **Database Tracking**: Metadata stored in PostgreSQL for fast querying
- **Responsive Design**: Works on all devices (mobile, tablet, desktop)
- **No Authentication Required**: Guests upload anonymously - no login needed

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React 19**

### Backend & Storage
- **Supabase**
  - **Storage (Bucket)**: Stores actual photo files (binary data)
  - **Database (PostgreSQL)**: Stores photo metadata (filename, upload time, file path)
  - **Row Level Security (RLS)**: Ensures guests can only upload, not view others' photos

## 📁 Project Structure

```
wedding-photos/
├── app/
│   ├── page.tsx              # Guest upload page (main page)
│   ├── admin/
│   │   └── page.tsx          # Admin gallery (password protected)
│   └── layout.tsx            # Root layout
├── lib/
│   └── supabase.ts           # Supabase client configuration
├── public/                   # Static assets
├── .env.local                # Environment variables (NOT committed to Git)
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works fine)
- Git installed

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/wedding-photos.git
cd wedding-photos
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database to be ready (~2 minutes)

#### Create Storage Bucket
1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Settings:
   - Name: `wedding-photos`
   - Public: **OFF** (keep it private!)
   - File size limit: 5MB

#### Create Database Table
Go to **SQL Editor** and run:

```sql
-- Create photos table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (guests can upload)
CREATE POLICY "public_insert" ON photos
FOR INSERT WITH CHECK (true);

-- Allow anyone to read (for simplicity - restrict in production)
CREATE POLICY "public_select" ON photos  
FOR SELECT USING (true);

-- Allow anyone to delete (admin functionality)
CREATE POLICY "public_delete" ON photos
FOR DELETE USING (true);

-- Storage policies for bucket
CREATE POLICY "storage_public_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'wedding-photos');

CREATE POLICY "storage_public_select" ON storage.objects
FOR SELECT USING (bucket_id = 'wedding-photos');

CREATE POLICY "storage_public_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'wedding-photos');
```

### 4. Configure Environment Variables

Create `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
- Supabase Dashboard → Settings → API
- Copy **Project URL** and **anon/public** key

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Admin Access

Navigate to `/admin` route:
```
http://localhost:3000/admin
```

**Default Password:** `dugun2024`

⚠️ **IMPORTANT:** Change this password in `app/admin/page.tsx` before deploying!

```typescript
const ADMIN_PASSWORD = 'dugun2024' // Change this!
```

## 📱 How It Works

### Real-World Example

**Wedding Day:**
1. You print QR codes and place them on each table with a sign: "📸 Fotoğraflarınızı Paylaşın!"
2. Aunt Ayşe scans the QR code during dinner
3. She uploads 5 family photos from her phone
4. Uncle Mehmet does the same from his table
5. 50 guests upload throughout the night
6. You end up with 200+ candid photos!

**After the Wedding:**
- You log into admin panel
- See all 200 photos in one place
- Download your favorites
- Delete any blurry/duplicate ones
- No need to ask anyone "did you take photos?"

**Privacy:** Guests can't see each other's photos. Only you (the wedding couple) see everything.

### For Guests (Upload Flow)

1. Guest scans QR code → Opens main page
2. Selects photo from their device
3. Clicks "Upload" button
4. Photo is uploaded to Supabase Storage
5. Metadata is saved to PostgreSQL database
6. Success message is shown
7. Guest **cannot** see other guests' photos

### For Admin (Gallery Flow)

1. Admin navigates to `/admin`
2. Enters password
3. Sees all uploaded photos in a grid
4. Can download individual photos
5. Can delete inappropriate photos
6. Deleted photos are removed from both Storage and Database

### Database vs Storage: Why Both?

**Storage (Bucket)**
- Stores actual photo files (binary data)
- Optimized for large files
- Fast upload/download speeds
- Example: `wedding-photos/uploads/12345-abc.jpg`

**Database (PostgreSQL)**
- Stores photo metadata (structured data)
- Allows fast searching and filtering
- Tracks upload time, filename, file path
- Example: `{id: "uuid", file_name: "photo.jpg", uploaded_at: "2024-02-08"}`

**Why separate?**
- You can't efficiently search binary files
- Databases are slow with large blobs
- This architecture is industry standard (S3 + RDS, GCS + Cloud SQL, etc.)

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **Import Project**
4. Select your GitHub repository
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**

Your app will be live at: `https://your-app.vercel.app`

### Generate QR Code

1. Copy your deployed URL
2. Go to a QR code generator (e.g., [qr-code-generator.com](https://www.qr-code-generator.com))
3. Paste your URL
4. Download QR code
5. Print and place at wedding venue

## 🔒 Security Considerations

### Current Setup (Demo/Simple)
- Guest uploads are anonymous (no authentication)
- Admin uses simple password protection
- All RLS policies allow public access

### Production Recommendations

1. **Implement Supabase Authentication** for admin:
```typescript
const { data } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'strong-password'
})
```

2. **Restrict RLS Policies** to authenticated users:
```sql
CREATE POLICY "authenticated_only" ON photos
FOR SELECT USING (auth.role() = 'authenticated');
```

3. **Add Rate Limiting** to prevent spam uploads

4. **Validate File Types** on the server side

5. **Enable CORS** restrictions in Supabase

6. **Use Environment Variables** for all secrets (never commit `.env.local`)

## 📊 Database Schema

```sql
photos
├── id (UUID, Primary Key)
├── file_name (TEXT)
├── file_path (TEXT)
└── uploaded_at (TIMESTAMP)
```

## 🛠️ Troubleshooting

### "Bucket not found" error
- Check bucket name in code matches Supabase (e.g., `wedding-photos` vs `weeding-photos`)
- Verify bucket exists in Supabase Dashboard → Storage

### "Row violates row-level security policy"
- Run the RLS policy SQL commands in Supabase SQL Editor
- Ensure policies are created for both `photos` table and `storage.objects`

### Photos appear after F5 but delete doesn't work
- Missing DELETE policy - run the SQL commands again
- Check browser console for detailed error messages

### Environment variables not working
- Restart dev server after changing `.env.local`
- Verify variable names start with `NEXT_PUBLIC_`
- Check for typos in Supabase URL and key

## 🎨 Customization

### Change Colors
Edit Tailwind classes in `app/page.tsx` and `app/admin/page.tsx`:
- `bg-pink-500` → Change pink gradient
- `bg-purple-500` → Change purple accent
- Tailwind docs: [tailwindcss.com](https://tailwindcss.com)

### Change Admin Password
In `app/admin/page.tsx`:
```typescript
const ADMIN_PASSWORD = 'your-new-password'
```

### Add Branding
Replace the 💒 emoji with your logo in `app/page.tsx`:
```tsx
<h1>Your Custom Wedding Logo</h1>
```

## 🚧 Future Enhancements

- [ ] Bulk download as ZIP file (using JSZip)
- [ ] Photo comments and likes
- [ ] Admin can mark favorite photos
- [ ] Email notifications on new uploads
- [ ] Instagram-style filters
- [ ] Photo slideshow mode
- [ ] Guest can add captions to photos
- [ ] Multi-language support

## 📝 License

MIT License - feel free to use this for your wedding!

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [Supabase](https://supabase.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)

## 📧 Support

Have questions? Create an issue in this repository.

---

Made with ❤️ for weddings everywhere
