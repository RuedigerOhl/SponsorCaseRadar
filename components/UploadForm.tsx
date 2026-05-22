'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const CATEGORIES = ['Sport', 'Musik', 'Kultur', 'Retail', 'Lifestyle', 'Entertainment', 'Sonstiges'];

export default function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [discoveredBy, setDiscoveredBy] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Bitte nur Bilddateien hochladen (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Bild ist zu groß. Maximale Größe: 10 MB.');
      return;
    }
    setImage(file);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleImageSelect(file);
    },
    [handleImageSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!image && !description.trim()) {
      setError('Bitte lade ein Bild hoch oder beschreibe den Case.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      if (image) formData.append('image', image);
      if (description.trim()) formData.append('description', description.trim());
      if (discoveredBy.trim()) formData.append('discovered_by', discoveredBy.trim());
      if (category) formData.append('category', category);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analyse fehlgeschlagen.');
      }

      router.push(`/case/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image Upload Zone */}
      <div>
        <div
          onClick={() => !imagePreview && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
            dragActive
              ? 'border-accent bg-accent/10'
              : imagePreview
                ? 'border-zinc-700 bg-transparent'
                : 'border-zinc-700 bg-surface-2 hover:border-zinc-500 hover:bg-zinc-800/50 cursor-pointer'
          }`}
        >
          {imagePreview ? (
            <div className="relative">
              <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Vorschau"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3">
                <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full border border-white/10">
                  {image?.name}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors">
                <svg
                  className="w-7 h-7 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-300 mb-1">
                Foto hochladen
              </p>
              <p className="text-xs text-zinc-600">
                Klicken oder Drag & Drop · JPG, PNG, WebP · max. 10 MB
              </p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-xs text-zinc-600 font-medium uppercase tracking-widest">oder</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* Description */}
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beschreibe den Sponsoring-Case ... z.B. &quot;Edeka Nationalmannschaft Trikot&quot; oder &quot;Red Bull Stratos Space Jump&quot;"
          rows={4}
          className="w-full bg-surface-2 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors resize-none"
        />
      </div>

      {/* Optional fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            value={discoveredBy}
            onChange={(e) => setDiscoveredBy(e.target.value)}
            placeholder="Dein Name (optional)"
            className="w-full bg-surface-2 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors"
          />
        </div>
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-surface-2 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors appearance-none cursor-pointer text-zinc-400"
            style={{ color: category ? 'white' : undefined }}
          >
            <option value="" className="text-zinc-400">Kategorie wählen</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="text-white bg-zinc-900">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || (!image && !description.trim())}
        className="w-full bg-accent hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 text-base disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>KI recherchiert...</span>
          </>
        ) : (
          <>
            <span>Case analysieren</span>
            <span className="text-lg">→</span>
          </>
        )}
      </button>

      {loading && (
        <p className="text-center text-xs text-zinc-600 -mt-2">
          Die KI recherchiert und bewertet den Case. Das kann 30–60 Sekunden dauern.
        </p>
      )}
    </form>
  );
}
