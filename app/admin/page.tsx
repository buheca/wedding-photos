// app/admin/page.tsx
// ADMIN GALERİ SAYFASI - Sadece admin tüm fotoğrafları görebilir

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Fotoğraf tipi tanımla
type Photo = {
  id: string
  file_name: string
  file_path: string
  uploaded_at: string
}

export default function AdminGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Basit şifre koruması (gerçek projede daha güvenli yöntem kullan)
  const ADMIN_PASSWORD = 'dugun2024' // Bunu değiştir!

  // Şifre kontrolü
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      loadPhotos()
    } else {
      alert('❌ Hatalı şifre!')
    }
  }

  // Tüm fotoğrafları yükle
  const loadPhotos = async () => {
    setLoading(true)
    
    try {
      // Database'den tüm fotoğraf kayıtlarını al
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('uploaded_at', { ascending: false }) // Yeniden eskiye

      if (error) throw error
      
      setPhotos(data || [])
    } catch (error) {
      console.error('Error loading photos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fotoğrafı indirmek için public URL al
  const getPhotoUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('weeding-photos')
      .getPublicUrl(filePath)
    
    return data.publicUrl
  }

  // Fotoğrafı sil (hem storage'dan hem database'den)
  const deletePhoto = async (photo: Photo) => {
    // Onay iste
    if (!confirm(`"${photo.file_name}" fotoğrafını silmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      // 1. Storage'dan sil
      const { error: storageError } = await supabase.storage
        .from('weeding-photos') // Bucket adını kontrol et
        .remove([photo.file_path])

      if (storageError) throw storageError

      // 2. Database'den sil
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id)

      if (dbError) throw dbError

      // 3. UI'dan kaldır (state'i güncelle)
      setPhotos(photos.filter(p => p.id !== photo.id))
      
      alert('✅ Fotoğraf başarıyla silindi!')

    } catch (error) {
      console.error('Delete error:', error)
      alert('❌ Silme işlemi başarısız oldu')
    }
  }

  // Tüm fotoğrafları zip olarak indir
  const downloadAllPhotos = async () => {
    alert('💡 Bu özellik için bir zip kütüphanesi eklemeniz gerekir (JSZip). Şu an tek tek indirme yapabilirsiniz.')
    // İleri seviye: JSZip kullanarak toplu indirme yapılabilir
  }

  // Giriş ekranı
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🔐 Admin Girişi
          </h1>
          
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          <button
            onClick={handleLogin}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    )
  }

  // Admin galeri
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              📸 Düğün Fotoğrafları
            </h1>
            <p className="text-gray-600 mt-2">
              Toplam {photos.length} fotoğraf yüklendi
            </p>
          </div>
          
          <button
            onClick={downloadAllPhotos}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            📥 Tümünü İndir
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 mt-4">Fotoğraflar yükleniyor...</p>
        </div>
      )}

      {/* Fotoğraf Grid */}
      {!loading && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <div 
              key={photo.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Fotoğraf */}
              <div className="aspect-square bg-gray-200 relative">
                <img
                  src={getPhotoUrl(photo.file_path)}
                  alt={photo.file_name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Bilgiler */}
              <div className="p-4">
                <p className="text-sm text-gray-600 truncate mb-2">
                  {photo.file_name}
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  {new Date(photo.uploaded_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                
                {/* Butonlar */}
                <div className="flex gap-2">
                  {/* İndirme Butonu */}
                  <a
                    href={getPhotoUrl(photo.file_path)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition text-sm font-medium"
                  >
                    📥 İndir
                  </a>
                  
                  {/* Silme Butonu */}
                  <button
                    onClick={() => deletePhoto(photo)}
                    className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Boş State */}
      {!loading && photos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Henüz fotoğraf yüklenmemiş 📸
          </p>
        </div>
      )}
    </div>
  )
}

/*
NASIL ÇALIŞIR?

1. KORUMA: Sayfa şifre ile korunuyor (basit örnek)
2. ŞİFRE GİRİLİNCE: loadPhotos() çalışır → Database'den tüm kayıtları çeker
3. HER FOTOĞRAF İÇİN: getPhotoUrl() ile Storage'dan gerçek URL alınır
4. GÖRÜNTÜLEME: Grid layout'ta tüm fotoğraflar gösterilir
5. İNDİRME: Her fotoğrafın altında "İndir" butonu var

ÖNEMLİ GÜVENLİK NOTU:
Bu basit şifre koruması sadece DEMO için. Gerçek projede:
- Supabase Authentication kullan
- Admin kullanıcı oluştur
- RLS policy'leri ayarla
*/