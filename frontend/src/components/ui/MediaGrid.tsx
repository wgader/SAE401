import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { cn } from '../../lib/utils';
import { MediaModal } from './MediaModal';
import { VideoPlayer } from './VideoPlayer';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface MediaGridProps {
  media: MediaItem[];
  isEditable?: boolean;
  onRemove?: (index: number) => void;
  className?: string;
}

const isVideoItem = (item: MediaItem) =>
  item.type === 'video' ||
  item.url.toLowerCase().match(/\.(mp4|webm|ogg|m4v|mov)$/i) !== null;

export const MediaGrid: React.FC<MediaGridProps> = ({
  media,
  isEditable = false,
  onRemove,
  className
}) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  if (media.length === 0) return null;

  const count = media.length;

  const renderMedia = (item: MediaItem, index: number) => {
    const isVideo = isVideoItem(item);

    if (isVideo) {
      return (
        <div key={index} className="relative group w-full">
          <VideoPlayer src={item.url} />
          {isEditable && onRemove && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(index); }}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all z-30 shadow-lg opacity-0 group-hover:opacity-100"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      );
    }

    return (
      <div
        key={index}
        className="relative group h-full w-full min-h-[12.5rem] overflow-hidden rounded-xl cursor-pointer bg-black/5"
        onClick={() => !isEditable && setSelectedMediaIndex(index)}
      >
        <img
          src={item.url}
          alt="Media content"
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Image')}
        />
        {isEditable && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(index);
            }}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all z-10 shadow-lg opacity-0 group-hover:opacity-100"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'grid gap-2 rounded-2xl border border-border/60 bg-surface-hover mt-3 w-full shrink-0 overflow-hidden',
        count === 1 && 'grid-cols-1 max-h-[25rem]',
        count === 2 && 'grid-cols-2 max-h-[20rem]',
        count === 3 && 'grid-cols-2 max-h-[20rem]',
        count === 4 && 'grid-cols-2 max-h-[20rem]',
        className
      )}
    >
      {count === 1 && renderMedia(media[0], 0)}

      {count === 2 && (
        <>
          <div className="h-full">{renderMedia(media[0], 0)}</div>
          <div className="h-full">{renderMedia(media[1], 1)}</div>
        </>
      )}

      {count === 3 && (
        <>
          <div className="row-span-2 h-full">{renderMedia(media[0], 0)}</div>
          <div className="h-full">{renderMedia(media[1], 1)}</div>
          <div className="h-full">{renderMedia(media[2], 2)}</div>
        </>
      )}

      {count === 4 && (
        <>
          <div className="h-full">{renderMedia(media[0], 0)}</div>
          <div className="h-full">{renderMedia(media[1], 1)}</div>
          <div className="h-full">{renderMedia(media[2], 2)}</div>
          <div className="h-full">{renderMedia(media[3], 3)}</div>
        </>
      )}

      {!isEditable && selectedMediaIndex !== null && !isVideoItem(media[selectedMediaIndex]) && (
        <MediaModal
          media={media}
          initialIndex={selectedMediaIndex}
          isOpen={true}
          onClose={() => setSelectedMediaIndex(null)}
        />
      )}
    </div>
  );
};
