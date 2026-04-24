'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageUploaderProps {
  value: (File | string)[];
  onChange: (files: (File | string)[]) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  hint?: string;
}

export function ImageUploader({ value, onChange, maxFiles, accept, hint }: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const dragItemRef = useRef<number | null>(null);
  const dragOverRef = useRef<number | null>(null);

  useEffect(() => {
    if (value && value.length > 0) {
      const newPreviews = value.map((file) =>
        typeof file === 'string' ? file : URL.createObjectURL(file)
      );
      setPreviews(newPreviews);

      return () => {
        newPreviews.forEach((preview) => {
          if (preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
          }
        });
      };
    } else {
      setPreviews([]);
    }
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (maxFiles === 1) {
        const replacementFile = acceptedFiles[0];
        if (!replacementFile) return;

        const replacementPreview = URL.createObjectURL(replacementFile);
        setPreviews((prev) => {
          prev.forEach((preview) => {
            if (preview.startsWith('blob:')) {
              URL.revokeObjectURL(preview);
            }
          });
          return [replacementPreview];
        });
        onChange([replacementFile]);
        return;
      }

      const currentFiles = value || [];
      const newFiles = [...currentFiles, ...acceptedFiles];

      // Enforce maxFiles limit if provided
      const finalFiles = maxFiles ? newFiles.slice(0, maxFiles) : newFiles;

      onChange(finalFiles);

      const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file));

      setPreviews((prev) => {
        const allPreviews = [...prev, ...newPreviews];
        return maxFiles ? allPreviews.slice(0, maxFiles) : allPreviews;
      });
    },
    [value, onChange, maxFiles]
  );

  const defaultAccept = {
    'image/jpeg': [],
    'image/png': [],
    'image/gif': [],
    'image/webp': [],
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ?? defaultAccept,
    multiple: maxFiles === 1 ? false : true,
    maxFiles: maxFiles,
  });

  const handleRemove = (indexToRemove: number) => {
    URL.revokeObjectURL(previews[indexToRemove]);

    const updatedFiles = value.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove);

    onChange(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverRef.current = index;
  };

  const handleDragEnd = () => {
    if (dragItemRef.current === null || dragOverRef.current === null) return;
    if (dragItemRef.current === dragOverRef.current) {
      dragItemRef.current = null;
      dragOverRef.current = null;
      return;
    }

    const reorderedFiles = [...value];
    const [movedFile] = reorderedFiles.splice(dragItemRef.current, 1);
    reorderedFiles.splice(dragOverRef.current, 0, movedFile);
    onChange(reorderedFiles);

    dragItemRef.current = null;
    dragOverRef.current = null;
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75 transition-colors',
          isDragActive && 'border-primary bg-primary/10'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">{hint ?? 'PNG, JPG, GIF or WEBP'}</p>
        </div>
      </div>
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {previews.map((preview, index) => (
            <div
              key={`${index}-${typeof value[index] === 'string' ? value[index] : (value[index] as File)?.name}`}
              className="relative group aspect-square"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <Image
                src={preview}
                alt={`Preview ${index}`}
                fill
                className="object-cover rounded-md"
              />
              <div className="absolute top-1 left-1 h-6 w-6 flex items-center justify-center rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4" />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
