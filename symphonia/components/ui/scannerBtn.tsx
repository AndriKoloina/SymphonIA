'use client'

import { useRef, ChangeEvent } from 'react'

interface FileUploadBtnProps {
  onFileSelect?: (file: File) => void
}

export default function FileUploadBtn({ onFileSelect }: FileUploadBtnProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (onFileSelect) {
        onFileSelect(selectedFile)
      } else {
        console.log("Fichier sélectionné :", selectedFile.name)
      }
    }
  }

  return (
    <div>
      {/* Input masqué acceptant PDF et images */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf, image/*"
        className="hidden"
      />

      {/* Bouton stylisé avec le dégradé et le halo violet/indigo du PlayButton */}
      <button
        type="button"
        onClick={handleClick}
        className="px-5 py-2.5 bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-semibold text-sm rounded-xl transition-all duration-300 flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] active:scale-95 cursor-pointer ml-1"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        <span>Importer une partition</span>
      </button>
    </div>
  )
}