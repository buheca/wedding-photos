
// MISAFIR UPLOAD SAYFASI - QR kod taratınca burası açılır

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  // Fotoğraf seçildiğinde çalışır
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setMessage('') // Önceki mesajları temizle
    }
  }

  // Upload butonuna basılınca çalışır
  const handleUpload = async () => {
    if (!file) {
      setMessage('❌ Lütfen bir fotoğraf seçin')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      // 1. Unique dosya adı oluştur (aynı isimli dosyalar çakışmasın)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `uploads/${fileName}`

      // 2. Storage'a fotoğrafı yükle
      const { error: uploadError } = await supabase.storage
        .from('weeding-photos') // Bucket adı
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 3. Database'e fotoğraf bilgisini kaydet
      const { error: dbError } = await supabase
        .from('photos')
        .insert([
          {
            file_name: file.name,
            file_path: filePath
          }
        ])

      if (dbError) throw dbError

      // Başarılı!
      setMessage('✅ Fotoğrafınız yüklendi! Teşekkürler 💕')
      setFile(null)
      
      // Input'u temizle
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (error) {
      console.error('Upload error:', error)
      setMessage('❌ Bir hata oluştu, lütfen tekrar deneyin')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        
        {/* Başlık */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            💒 Düğün Anıları
          </h1>
          <p className="text-gray-600">
            Fotoğraflarınızı bizimle paylaşın!
          </p>
        </div>

        {/* Upload Form */}
        <div className="space-y-4">
          
          {/* Dosya Seçici */}
          <div>
            <label 
              htmlFor="file-input" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Fotoğraf Seçin
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-pink-50 file:text-pink-700
                hover:file:bg-pink-100
                cursor-pointer"
            />
          </div>

          {/* Seçilen dosya göster */}
          {file && (
            <div className="text-sm text-gray-600 bg-pink-50 p-3 rounded-lg">
              📸 {file.name}
            </div>
          )}

          {/* Upload Butonu */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 
              text-white font-semibold py-3 px-4 rounded-lg
              hover:from-pink-600 hover:to-purple-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 transform hover:scale-105"
          >
            {uploading ? '⏳ Yükleniyor...' : '💕 Fotoğrafı Yükle'}
          </button>

          {/* Mesaj Göster */}
          {message && (
            <div className={`text-center p-3 rounded-lg ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Bilgilendirme */}
        <p className="text-xs text-gray-500 text-center mt-6">
          🔒 Fotoğraflarınız güvenle saklanır ve sadece çift tarafından görülebilir
        </p>
      </div>
    </div>
  )}