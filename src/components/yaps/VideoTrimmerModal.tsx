"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Check, X, Loader2, Scissors } from "lucide-react"

interface VideoTrimmerModalProps {
  isOpen: boolean
  onClose: () => void
  videoFile: File
  onTrimComplete: (trimmedBlob: Blob) => void
  maxDuration?: number // Max duration in seconds (default 60)
}

export default function VideoTrimmerModal({
  isOpen,
  onClose,
  videoFile,
  onTrimComplete,
  maxDuration = 60
}: VideoTrimmerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0])
  const [isProcessing, setIsProcessing] = useState(false)
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  const ffmpegRef = useRef<any>(null)

  // Load FFmpeg on mount
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        setLoadingMessage('Loading video processor...')
        const { FFmpeg } = await import('@ffmpeg/ffmpeg')
        const { fetchFile, toBlobURL } = await import('@ffmpeg/util')
        
        const ffmpeg = new FFmpeg()
        
        // Load FFmpeg core from CDN
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
        
        ffmpegRef.current = { ffmpeg, fetchFile }
        setFfmpegLoaded(true)
        setLoadingMessage('')
      } catch (error) {
        console.error('Failed to load FFmpeg:', error)
        setLoadingMessage('Failed to load video processor. Using original video.')
      }
    }

    if (isOpen) {
      loadFFmpeg()
    }
  }, [isOpen])

  // Create video URL when file changes
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile)
      setVideoUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [videoFile])

  // Handle video loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration
      setDuration(videoDuration)
      // Set initial trim range (0 to min of duration or maxDuration)
      const endTime = Math.min(videoDuration, maxDuration)
      setTrimRange([0, endTime])
    }
  }

  // Update current time during playback
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)
      
      // Loop within trim range
      if (time >= trimRange[1]) {
        videoRef.current.currentTime = trimRange[0]
      }
    }
  }

  // Toggle play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        // Start from trim start if outside range
        if (videoRef.current.currentTime < trimRange[0] || videoRef.current.currentTime >= trimRange[1]) {
          videoRef.current.currentTime = trimRange[0]
        }
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle trim range change
  const handleTrimRangeChange = (values: number[]) => {
    const [start, end] = values
    // Ensure trim duration doesn't exceed maxDuration
    if (end - start > maxDuration) {
      if (end !== trimRange[1]) {
        // User is dragging end handle
        setTrimRange([end - maxDuration, end])
      } else {
        // User is dragging start handle
        setTrimRange([start, start + maxDuration])
      }
    } else {
      setTrimRange([start, end])
    }
    
    // Seek to start of trim range
    if (videoRef.current) {
      videoRef.current.currentTime = start
    }
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Trim video using FFmpeg
  const handleTrimVideo = useCallback(async () => {
    if (!ffmpegLoaded || !ffmpegRef.current) {
      // If FFmpeg not loaded, just return original file as blob
      const blob = new Blob([videoFile], { type: videoFile.type })
      onTrimComplete(blob)
      onClose()
      return
    }

    setIsProcessing(true)
    setLoadingMessage('Trimming video...')

    try {
      const { ffmpeg, fetchFile } = ffmpegRef.current
      const inputName = 'input' + videoFile.name.substring(videoFile.name.lastIndexOf('.'))
      const outputName = 'output.mp4'
      
      // Write input file
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile))
      
      // Calculate trim parameters
      const startTime = trimRange[0]
      const trimDuration = trimRange[1] - trimRange[0]
      
      // Run FFmpeg trim command
      await ffmpeg.exec([
        '-ss', startTime.toString(),
        '-i', inputName,
        '-t', trimDuration.toString(),
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'ultrafast',
        '-crf', '23',
        outputName
      ])
      
      // Read output file
      const data = await ffmpeg.readFile(outputName)
      const blob = new Blob([data], { type: 'video/mp4' })
      
      // Cleanup
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)
      
      onTrimComplete(blob)
      onClose()
    } catch (error) {
      console.error('Error trimming video:', error)
      setLoadingMessage('Failed to trim video. Using original.')
      // Fallback to original file
      const blob = new Blob([videoFile], { type: videoFile.type })
      onTrimComplete(blob)
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }, [ffmpegLoaded, videoFile, trimRange, onTrimComplete, onClose])

  const handleCancel = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setIsPlaying(false)
    onClose()
  }

  const trimDuration = trimRange[1] - trimRange[0]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            Trim Video
          </DialogTitle>
        </DialogHeader>
        
        {loadingMessage && !ffmpegLoaded && (
          <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{loadingMessage}</span>
          </div>
        )}

        <div className="flex-1 bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full max-h-[350px] object-contain"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            playsInline
          />
        </div>

        <div className="space-y-4 py-4">
          {/* Play/Pause and time display */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayPause}
              disabled={!duration}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <span className="font-mono">{formatTime(currentTime)}</span>
              <span className="mx-2">/</span>
              <span className="font-mono">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Trim Range Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Trim Range</span>
              <span className={trimDuration > maxDuration ? 'text-destructive' : 'text-muted-foreground'}>
                Duration: {formatTime(trimDuration)} 
                {trimDuration > maxDuration && ` (max ${formatTime(maxDuration)})`}
              </span>
            </div>
            <Slider
              value={trimRange}
              min={0}
              max={duration || 1}
              step={0.1}
              onValueChange={handleTrimRangeChange}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Start: {formatTime(trimRange[0])}</span>
              <span>End: {formatTime(trimRange[1])}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleTrimVideo} disabled={isProcessing || !duration}>
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Apply Trim
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
