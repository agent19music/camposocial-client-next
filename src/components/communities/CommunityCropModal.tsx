"use client"

import { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { FixedCropper, ImageRestriction } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import 'react-advanced-cropper/dist/themes/corners.css'

interface ImageCropModalProps {
    isOpen: boolean
    onClose: () => void
    imageSrc: string
    onCropComplete: (croppedImageBlob: Blob) => void
    aspectRatio: number
    title: string
}

export default function CommunityCropModal({
    isOpen,
    onClose,
    imageSrc,
    onCropComplete,
    aspectRatio,
    title
}: ImageCropModalProps) {
    const cropperRef = useRef<any>(null)
    const [isCropping, setIsCropping] = useState(false)

    const applyCrop = async () => {
        if (!cropperRef.current) return

        setIsCropping(true)
        try {
            const canvas = cropperRef.current.getCanvas()
            if (canvas) {
                // Convert canvas to blob
                canvas.toBlob((blob: Blob | null) => {
                    if (blob) {
                        onCropComplete(blob)
                        onClose()
                    }
                }, 'image/jpeg', 0.92)
            }
        } catch (error) {
            console.error('Error cropping image:', error)
        } finally {
            setIsCropping(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex items-center justify-center p-4 min-h-0">
                    {imageSrc && (
                        <div className="w-full h-full max-w-full max-h-[60vh] flex items-center justify-center">
                            <div className="w-full" style={{ aspectRatio: aspectRatio }}>
                                <FixedCropper
                                    ref={cropperRef}
                                    src={imageSrc}
                                    className="h-full w-full"
                                    stencilSize={{
                                        width: 800,
                                        height: 800 / aspectRatio
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

                <DialogFooter className="mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isCropping}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={applyCrop}
                        disabled={isCropping}
                    >
                        {isCropping ? 'Applying...' : 'Apply Crop'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
