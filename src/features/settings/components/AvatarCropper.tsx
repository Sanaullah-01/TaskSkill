'use client';

import * as React from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import { X, CircleNotch } from '@phosphor-icons/react';

interface AvatarCropperProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob) => Promise<void>;
}

export function AvatarCropper({ imageSrc, onClose, onCropComplete }: AvatarCropperProps) {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<any>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const onCropCompleteHandler = React.useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        await onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-background shadow-2xl flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Crop Avatar</h2>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-[350px] w-full bg-zinc-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => {
                setZoom(Number(e.target.value))
              }}
              className="w-full accent-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={onClose} 
              disabled={isProcessing}
              className="h-10 px-4 py-2 rounded-md border text-sm font-medium hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={isProcessing}
              className="h-10 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors inline-flex items-center"
            >
              {isProcessing && <CircleNotch className="mr-2 h-4 w-4 animate-spin" />}
              Save Avatar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
