"use client"

import { useRef, useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { FixedCropper, ImageRestriction } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import 'react-advanced-cropper/dist/themes/corners.css'
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Check, X, RefreshCw } from "lucide-react"
import type { CommunityCropModalProps } from "@/types"

export default function CommunityCropModal({
    isOpen,
    onClose,
    imageSrc,
    onCropComplete,
    aspectRatio,
    title
}: CommunityCropModalProps) {
    const cropperRef = useRef<any>(null)
    const [isCropping, setIsCropping] = useState(false)
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)

    const handleZoomChange = (value: number[]) => {
        const newZoom = value[0]
        if (cropperRef.current) {
            cropperRef.current.zoomImage(newZoom / zoom)
        }
        setZoom(newZoom)
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

    const applyCrop = useCallback(async () => {
        if (!cropperRef.current) return

        setIsCropping(true)
        try {
            const canvas = cropperRef.current.getCanvas()
            if (canvas) {
                canvas.toBlob((blob: Blob | null) => {
                    if (blob) {
                        onCropComplete(blob)
                        onClose()
                    }
                    setIsCropping(false)
                }, 'image/jpeg', 0.92)
            } else {
                setIsCropping(false)
            }
        } catch (error) {
            console.error('Error cropping image:', error)
            setIsCropping(false)
        }
    }, [onCropComplete, onClose])

    const handleCancel = () => {
        setZoom(1)
        setRotation(0)
        onClose()
    }

    // Compute stencil width based on aspect ratio
    const stencilWidth = aspectRatio >= 1 ? 800 : 400
    const stencilHeight = stencilWidth / aspectRatio

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex items-center justify-center min-h-0 bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden">
                    {imageSrc && (
                        <div className="w-full h-full max-w-full max-h-[55vh] flex items-center justify-center">
                            <div className="w-full" style={{ aspectRatio: aspectRatio }}>
                                <FixedCropper
                                    ref={cropperRef}
                                    src={imageSrc}
                                    className="h-full w-full"
                                    stencilSize={{
                                        width: stencilWidth,
                                        height: stencilHeight
                                    }}
                                    stencilProps={{
                                        aspectRatio: aspectRatio,
                                        handlers: true,
                                        lines: true,
                                        movable: true,
                                        resizable: true,
                                        overlayClassName: 'bg-black/50',
                                    }}
                                    imageRestriction={ImageRestriction.stencil}
                                    backgroundWrapperProps={{
                                        scaleImage: true,
                                        moveImage: true,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4 py-3">
                    {/* Zoom Control */}
                    <div className="flex items-center gap-4">
                        <ZoomOut className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <Slider
                            value={[zoom]}
                            min={0.5}
                            max={3}
                            step={0.1}
                            onValueChange={handleZoomChange}
                            className="flex-1"
                        />
                        <ZoomIn className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>

                    {/* Rotation Controls */}
                    <div className="flex items-center justify-center gap-3">
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
                            className="gap-2"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Reset
                        </Button>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleCancel} disabled={isCropping}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button onClick={applyCrop} disabled={isCropping}>
                        <Check className="w-4 h-4 mr-2" />
                        {isCropping ? 'Applying...' : 'Apply Crop'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
