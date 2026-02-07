// lib/supabase.ts
// Bu dosya Supabase ile bağlantıyı kurar

import { createClient } from '@supabase/supabase-js'

// Environment variable'lardan Supabase bilgilerini al
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabase client oluştur - tüm proje boyunca bunu kullanacağız
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
AÇIKLAMA:
- createClient: Supabase'e bağlanmak için fonksiyon
- URL ve Key: .env.local dosyasından geliyor
- Export: Diğer dosyalarda `import { supabase } from '@/lib/supabase'` diyerek kullanacağız
*/