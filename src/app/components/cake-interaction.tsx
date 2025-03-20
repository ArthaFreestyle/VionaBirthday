"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function CakeInteraction({ onComplete }: { onComplete: () => void }) {
  const [candles, setCandles] = useState<boolean[]>([true, true, true, true, true])
  const [blowing, setBlowing] = useState(false)
  const [micAllowed, setMicAllowed] = useState<boolean | null>(null)
  const [message, setMessage] = useState("Blow into your microphone to blow out the candles!")
  const [allOut, setAllOut] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (candles.every((c) => !c) && !allOut) {
      setAllOut(true)
      setMessage("Congratulations! You blew out all the candles!")
      onComplete()
    }
  }, [candles, allOut, onComplete])

  const requestMicAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContextRef.current.createAnalyser()
      analyserRef.current = analyser

      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyser)

      analyser.fftSize = 256
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      setMicAllowed(true)

      // Start monitoring microphone volume
      const checkVolume = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)

        // Calculate average volume
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const average = sum / bufferLength

        // If volume is above threshold, consider it as blowing
        if (average > 50) {
          setBlowing(true)
          blowOutCandle()
        } else {
          setBlowing(false)
        }

        if (!allOut) {
          requestAnimationFrame(checkVolume)
        }
      }

      checkVolume()
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setMicAllowed(false)
      setMessage("Microphone access denied. Try clicking on the candles instead.")
    }
  }

  const blowOutCandle = () => {
    setCandles((prev) => {
      const firstLitIndex = prev.findIndex((candle) => candle)
      if (firstLitIndex === -1) return prev

      const newCandles = [...prev]
      newCandles[firstLitIndex] = false
      return newCandles
    })
  }

  const handleCandleClick = (index: number) => {
    if (!micAllowed) {
      setCandles((prev) => {
        const newCandles = [...prev]
        newCandles[index] = false
        return newCandles
      })
    }
  }

  const resetCandles = () => {
    setCandles([true, true, true, true, true])
    setAllOut(false)
    setMessage("Blow into your microphone to blow out the candles!")
  }

  useEffect(() => {
    return () => {
      // Clean up
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Birthday Cake</h2>

      <p className="text-center mb-6">{message}</p>

      <div className="relative w-64 h-64 mb-6">
        {/* Cake */}
        <div className="absolute bottom-0 w-full">
          <div className="bg-yellow-200 h-16 w-full rounded-t-lg"></div>
          <div className="bg-pink-300 h-24 w-full rounded-b-lg relative">
            <div className="absolute top-6 left-4 w-8 h-8 rounded-full bg-pink-200"></div>
            <div className="absolute top-10 right-6 w-6 h-6 rounded-full bg-pink-200"></div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full h-4 bg-pink-400 rounded-full"></div>
          </div>
        </div>

        {/* Candles */}
        <div className="absolute bottom-40 left-0 w-full flex justify-center space-x-6">
          {candles.map((isLit, index) => (
            <div key={index} className="relative cursor-pointer" onClick={() => handleCandleClick(index)}>
              <div className="w-2 h-16 bg-blue-300 rounded-sm"></div>

              {isLit && (
                <>
                  <motion.div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-4 h-8"
                    animate={{
                      scaleY: [1, 1.2, 1],
                      scaleX: [1, 1.1, 1],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 0.5 + index * 0.1,
                    }}
                  >
                    <div className="w-4 h-4 bg-yellow-500 rounded-full filter blur-sm"></div>
                    <div className="w-2 h-6 bg-orange-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                  </motion.div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {micAllowed === null && (
        <Button onClick={requestMicAccess} className="bg-gradient-to-r from-pink-500 to-purple-500">
          Start Blowing
        </Button>
      )}

      {micAllowed === false && (
        <p className="text-sm text-gray-500 mb-4">Click on each candle to blow them out manually</p>
      )}

      {allOut && (
        <div className="mt-4 flex gap-3">
          <Button onClick={resetCandles} variant="outline">
            Reset Candles
          </Button>
          <Button onClick={onComplete} className="bg-gradient-to-r from-pink-500 to-purple-500">
            Celebrate
          </Button>
        </div>
      )}

      {blowing && <div className="mt-4 px-4 py-2 bg-blue-100 rounded-full animate-pulse">Blowing detected!</div>}
    </div>
  )
}

