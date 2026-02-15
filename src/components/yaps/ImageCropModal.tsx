"use client"

import { useState, useRef, useCallback } from 'react'
import { Cropper, CropperRef } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import 'react-advanced-cropper/dist/themes/corners.css'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Check, X } from "lucide-react"

interface ImageCropModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (croppedBlob: Blob) => void
  aspectRatio?: number // Optional fixed aspect ratio (width/height)
}

export default function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio
}: ImageCropModalProps) {
  const cropperRef = useRef<CropperRef>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0])
    if (cropperRef.current) {
      cropperRef.current.zoomImage(value[0] / zoom)
    }
  }

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90)
    if (cropperRef.current) {
      cropperRef.current.rotateImage(-90)
    }
  }

  const handleRotateRight = () => {
    setRotation(prev => prev + 90)
    if (cropperRef.current) {
      cropperRef.current.rotateImage(90)
    }
  }

  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    if (cropperRef.current) {
      cropperRef.current.reset()
    }
  }

  const handleApplyCrop = useCallback(() => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCanvas()
      if (canvas) {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              onCropComplete(blob)
              onClose()
            }
          },
          'image/jpeg',
          0.9
        )
      }
    }
  }, [onCropComplete, onClose])

  const handleCancel = () => {
    setZoom(1)
    setRotation(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-[400px] bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden">
          <Cropper
            ref={cropperRef}
            src={imageSrc}
            className="h-[400px]"
            stencilProps={{
              aspectRatio: aspectRatio,
              movable: true,
              resizable: true,
            }}
            backgroundClassName="bg-black"
          />
        </div>

        <div className="space-y-4 py-4">
          {/* Zoom Control */}
          <div className="flex items-center gap-4">
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[zoom]}
              min={0.5}
              max={3}
              step={0.1}
              onValueChange={handleZoomChange}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Rotation Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotateLeft}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Rotate Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotateRight}
              className="gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Rotate Right
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleApplyCrop}>
            <Check className="w-4 h-4 mr-2" />
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
