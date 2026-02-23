'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove?: () => void;
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setError(null);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            onChange(data.url);
        } catch (err: any) {
            setError(err.message || 'Failed to upload image');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleRemove = () => {
        if (onRemove) {
            onRemove();
        } else {
            onChange('');
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3">
            {value ? (
                <div className="relative group">
                    <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-stone-200">
                        <img
                            src={value}
                            alt="Uploaded preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-stone-500 mt-2">Hover and click to remove</p>
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${dragActive
                            ? 'border-primary bg-emerald-50'
                            : 'border-stone-300 hover:border-primary'
                        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                    />
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                        {uploading ? (
                            <>
                                <Loader2 className="animate-spin text-primary" size={40} />
                                <p className="text-sm font-medium text-stone-600">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <div className="p-4 bg-emerald-100 rounded-full">
                                    <ImageIcon className="text-primary" size={32} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-stone-700">
                                        Drop your image here, or{' '}
                                        <span className="text-primary">browse</span>
                                    </p>
                                    <p className="text-xs text-stone-500 mt-1">
                                        Supports: JPG, PNG, WebP (Max 10MB)
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
            )}
        </div>
    );
}
