"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cake, Gift, Heart, Star, Sparkles, Music, VolumeX } from "lucide-react"
import BalloonGame from "./components/balloon-game"
import CakeInteraction from "./components/cake-interaction"
import GiftReveal from "./components/gift-reveal"
import MemoryGame from "./components/memory-game"

export default function BirthdayLanding() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    setIsVisible(true)

    // Initialize audio
    audioRef.current = new Audio("/birthday-song.mp3")
    audioRef.current.loop = true

    const playPromise = audioRef.current.play()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Autoplay started successfully
          setIsPlaying(true)
        })
        .catch((error) => {
          // Autoplay was prevented
          console.log("Autoplay prevented:", error)
          setAutoplayBlocked(true)
          setIsPlaying(false)
        })
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [])

  const toggleAudio = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const confetti = () => {
    // Trigger confetti animation
    const colors = ["#FF9FF3", "#FECA57", "#FF6B6B", "#48DBFB", "#1DD1A1"]
    const confettiContainer = document.createElement("div")
    confettiContainer.style.position = "fixed"
    confettiContainer.style.top = "0"
    confettiContainer.style.left = "0"
    confettiContainer.style.width = "100%"
    confettiContainer.style.height = "100%"
    confettiContainer.style.pointerEvents = "none"
    confettiContainer.style.zIndex = "9999"
    document.body.appendChild(confettiContainer)

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div")
      confetti.style.position = "absolute"
      confetti.style.width = `${5 + Math.random() * 10}px`
      confetti.style.height = `${5 + Math.random() * 10}px`
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0"
      confetti.style.top = "-20px"
      confetti.style.left = `${Math.random() * 100}%`

      confettiContainer.appendChild(confetti)

      const animation = confetti.animate(
        [
          { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
          {
            transform: `translate(${Math.random() * 100 - 50}px, ${window.innerHeight + 20}px) rotate(${Math.random() * 360}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 1500 + Math.random() * 1500,
          easing: "cubic-bezier(0.1, 0.8, 0.3, 1)",
        },
      )

      animation.onfinish = () => {
        confetti.remove()
        if (confettiContainer.childElementCount === 0) {
          confettiContainer.remove()
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-50 to-blue-100 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Floating elements */}
      <div className="fixed inset-0 pointer-events-none">
        {isVisible &&
          [...Array(15)].map((_, i) => {
            // Only render these on the client after initial render
            return (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: `${i * 7}vw`,
                  y: `${i * 5}vh`,
                  scale: 0.5,
                }}
                animate={{
                  y: [`${i * 5}vh`, `${(i * 5 + 30) % 100}vh`],
                  x: [`${i * 7}vw`, `${(i * 7 + 20) % 100}vw`],
                }}
                transition={{
                  duration: 15,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                {i % 4 === 0 && <Heart className="text-pink-300" size={16} />}
                {i % 4 === 1 && <Star className="text-yellow-300" size={16} />}
                {i % 4 === 2 && <Sparkles className="text-purple-300" size={16} />}
                {i % 4 === 3 && <div className="w-3 h-3 rounded-full bg-blue-300 opacity-70"></div>}
              </motion.div>
            )
          })}
      </div>

      {/* Audio control */}
      <motion.button
        className="fixed top-4 right-4 z-50 bg-white bg-opacity-80 p-2 rounded-full shadow-md"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleAudio}
      >
        {isPlaying ? <VolumeX size={20} /> : <Music size={20} />}
      </motion.button>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {activeGame ? (
          <motion.div
            key="game"
            className="relative z-10 max-w-3xl w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden p-6">
              <button
                className="mb-4 text-sm text-gray-500 hover:text-gray-700 flex items-center"
                onClick={() => setActiveGame(null)}
              >
                ← Back to celebration
              </button>

              {activeGame === "balloons" && <BalloonGame onComplete={confetti} />}
              {activeGame === "cake" && <CakeInteraction onComplete={confetti} />}
              {activeGame === "gifts" && <GiftReveal onComplete={confetti} />}
              {activeGame === "memory" && <MemoryGame onComplete={confetti} />}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            className="relative z-10 max-w-3xl w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
              {/* Top decoration */}
              <div className="h-8 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400"></div>

              <div className="p-8 md:p-12">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-transparent bg-clip-text mb-4 text-center">
                      Happy Birthday Viooooo!
                    </h1>

                    <p className="text-gray-600 mb-8 text-center max-w-lg mx-auto">
                    Semoga tetap jadi anak baik 🎉🥳, rajin menabung, dan disayang orang tua. Jangan bosen-bosen hidup, karena masih banyak hal seru yang menunggu di depan! ✨ Tetap semangat, raih mimpi-mimpimu, dan jangan lupa bahagia.

Selamat ulang tahun! 🎂🎁🎈
                    </p>
                  </motion.div>
                  <div>
                  <iframe src="https://giphy.com/embed/uBuzWfwVcadRC" width="480" height="307" frameBorder="0" className="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/animation-movie-minions-uBuzWfwVcadRC">via GIPHY</a></p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    <GameCard
                      title="Pop the Balloons"
                      icon={<Heart size={24} className="text-pink-500" />}
                      description="Pop as many balloons as you can in 30 seconds!"
                      onClick={() => {
                        setActiveGame("balloons")
                        if (!isPlaying && audioRef.current) {
                          audioRef.current.play()
                          setIsPlaying(true)
                        }
                      }}
                    />

                    <GameCard
                      title="Blow Out Candles"
                      icon={<Cake size={24} className="text-yellow-500" />}
                      description="Use your microphone to blow out the birthday candles!"
                      onClick={() => {
                        setActiveGame("cake")
                        if (!isPlaying && audioRef.current) {
                          audioRef.current.play()
                          setIsPlaying(true)
                        }
                      }}
                    />

                    <GameCard
                      title="Unwrap Gifts"
                      icon={<Gift size={24} className="text-purple-500" />}
                      description="Find the hidden surprises in the birthday gifts!"
                      onClick={() => {
                        setActiveGame("gifts")
                        if (!isPlaying && audioRef.current) {
                          audioRef.current.play()
                          setIsPlaying(true)
                        }
                      }}
                    />

                    <GameCard
                      title="Birthday Memory"
                      icon={<Sparkles size={24} className="text-blue-500" />}
                      description="Match the pairs in this birthday-themed memory game!"
                      onClick={() => {
                        setActiveGame("memory")
                        if (!isPlaying && audioRef.current) {
                          audioRef.current.play()
                          setIsPlaying(true)
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom decoration */}
              <div className="flex justify-between px-8 py-4 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100">
                <p className="text-sm text-gray-500">{isVisible ? new Date().getFullYear() : "2023"}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function GameCard({
  title,
  icon,
  description,
  onClick,
}: {
  title: string
  icon: React.ReactNode
  description: string
  onClick: () => void
}) {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md p-6 cursor-pointer border-2 border-transparent hover:border-pink-200 transition-all"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-center mb-3">
        <div className="mr-3 bg-gray-100 p-2 rounded-full">{icon}</div>
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  )
}

