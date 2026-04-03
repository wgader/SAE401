import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { VideoPlayer } from './VideoPlayer';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface MediaModalProps {
  media: MediaItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({ 
  media, 
  initialIndex, 
  isOpen, 
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen) return null;

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
        onClick={onClose}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <button 
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
          
          <div className="text-white text-[1rem] font-medium">
            {currentIndex + 1} / {media.length}
          </div>
          
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="flex-1 relative flex items-center justify-center p-4 sm:p-12 overflow-hidden">
          {media.length > 1 && (
            <button 
              onClick={prev}
              className="absolute left-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-20"
            >
              <FiChevronLeft className="w-8 h-8" />
            </button>
          )}

          <motion.div
            key={currentIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full h-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            {media[currentIndex].type === 'video' ? (
              <VideoPlayer src={media[currentIndex].url} className="max-w-full max-h-full" />
            ) : (
              <img 
                src={media[currentIndex].url} 
                alt="Media Preview" 
                className="max-h-full max-w-full object-contain shadow-2xl rounded-sm"
              />
            )}
          </motion.div>

          {media.length > 1 && (
            <button 
              onClick={next}
              className="absolute right-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-20"
            >
              <FiChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
