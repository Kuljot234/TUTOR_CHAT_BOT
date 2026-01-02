'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, X, FileIcon, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnimatedText } from '@/components/ui/animated-text';
import { motion, AnimatePresence } from 'framer-motion';

export interface UploadedFile {
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

interface FileUploadProps {
  onFileSelect: (files: UploadedFile[]) => void;
  onFileRemove: (index: number) => void;
  files: UploadedFile[];
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, onFileRemove, files, disabled }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const dragOverText = useAnimatedText(
    isDragOver ? "Drop your files here to attach them" : "",
    " "
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const uploadedFiles: UploadedFile[] = [];

    for (const file of selectedFiles) {
      const isImage = file.type.startsWith('image/');
      const uploadedFile: UploadedFile = {
        file,
        type: isImage ? 'image' : 'document',
      };

      if (isImage) {
        uploadedFile.preview = await readFileAsDataURL(file);
      }

      uploadedFiles.push(uploadedFile);
    }

    onFileSelect([...files, ...uploadedFiles]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    const uploadedFiles: UploadedFile[] = [];

    for (const file of droppedFiles) {
      const isImage = file.type.startsWith('image/');
      const uploadedFile: UploadedFile = {
        file,
        type: isImage ? 'image' : 'document',
      };

      if (isImage) {
        uploadedFile.preview = await readFileAsDataURL(file);
      }

      uploadedFiles.push(uploadedFile);
    }

    onFileSelect([...files, ...uploadedFiles]);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-lg pointer-events-none"
          >
            <div className="text-center p-4">
              <Paperclip className="h-8 w-8 mx-auto mb-2 text-primary animate-bounce" />
              <p className="text-sm font-medium text-primary">
                {dragOverText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="flex items-center gap-2"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Upload files"
          className="h-9 w-9 relative group"
        >
          <Paperclip className="h-4 w-4 transition-transform group-hover:rotate-45" />
          <span className="sr-only">Upload files</span>
        </Button>

        {files.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {files.map((uploadedFile, index) => (
              <FilePreview
                key={index}
                file={uploadedFile}
                index={index}
                hoveredIndex={hoveredIndex}
                onHover={setHoveredIndex}
                onRemove={onFileRemove}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface FilePreviewProps {
  file: UploadedFile;
  index: number;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

function FilePreview({ file, index, hoveredIndex, onHover, onRemove, disabled }: FilePreviewProps) {
  const getHoverText = () => {
    const sizeInKB = (file.file.size / 1024).toFixed(1);
    return file.file.name + " • " + sizeInKB + " KB • Click X to remove";
  };

  const hoveredText = useAnimatedText(
    hoveredIndex === index ? getHoverText() : file.file.name,
    ""
  );

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "relative group flex items-center gap-2 px-3 py-1.5 rounded-md transition-all",
        "bg-muted border border-border hover:bg-primary/10 hover:border-primary",
        "cursor-pointer"
      )}
    >
      {file.type === 'image' && file.preview ? (
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.1 }}
        >
          <img
            src={file.preview}
            alt={file.file.name}
            className="h-8 w-8 object-cover rounded"
          />
          <ImageIcon className="absolute -top-1 -right-1 h-3 w-3 text-primary" />
        </motion.div>
      ) : (
        <motion.div whileHover={{ scale: 1.1 }}>
          <FileIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
        </motion.div>
      )}
      
      <span className="text-xs truncate max-w-[150px]">
        {hoveredIndex === index ? hoveredText : file.file.name}
      </span>
      
      <motion.button
        type="button"
        onClick={() => onRemove(index)}
        className="ml-1 hover:bg-destructive/10 rounded-full p-0.5 transition-colors"
        disabled={disabled}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
      </motion.button>
    </motion.div>
  );
}
