'use client';

import * as React from 'react';
import Image from 'next/image';
import { Loader2, Upload, X, FileText } from 'lucide-react';
import { uploadFile } from '@/actions/upload';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  accept?: string;
  /** preview style */
  variant?: 'image' | 'file';
  label?: string;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function FileUpload({
  value,
  onChange,
  folder = 'talari-erp',
  accept = 'image/*',
  variant = 'image',
  label = 'Upload',
}: FileUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast.error('File too large (max 8MB).');
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await readAsDataUrl(file);
      const res = await uploadFile(dataUrl, folder);
      if (res.ok && res.url) {
        onChange(res.url);
        toast.success('Uploaded');
      } else {
        toast.error(res.error ?? 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="group relative">
          {variant === 'image' ? (
            <div className="relative size-20 overflow-hidden rounded-xl border border-border bg-muted">
              <Image src={value} alt="upload" fill className="object-cover" sizes="80px" />
            </div>
          ) : (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
            >
              <FileText size={16} className="text-primary" /> View file
            </a>
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
            aria-label="Remove"
          >
            <X size={12} />
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          'flex items-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:border-primary hover:text-foreground disabled:opacity-60',
        )}
      >
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {value ? 'Replace' : label}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
