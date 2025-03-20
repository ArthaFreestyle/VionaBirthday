"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Balloon = {
  id: number
  x: number
  y: number
  color: string
  size: number
  popped: boolean
}

export default function BalloonGame({ onComplete }: { onComplete: () => void }) {
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Use useCallback to memoize the createBalloon function
  const createBalloon = useCallback((id: number): Balloon => {
    // Define colors inside the callback to avoid dependency issues
    const colors = ["#FF9FF3", "#FECA57", "#FF6B6B", "#48DBFB", "#1DD1A1", "#F368E0"]
    
    // Use a deterministic pattern based on id for server rendering
    const idBasedRandom = (id % 10) / 10;
    
    return {
      id,
      x: gameStarted && isMounted.current ? (10 + Math.random() * 80) : (10 + idBasedRandom * 80), // percentage
      y: gameStarted && isMounted.current ? (110 + Math.random() * 20) : 110, // start below screen
      color: colors[id % colors.length],
      size: gameStarted && isMounted.current ? (40 + Math.random() * 40) : 40,
      popped: false,
    }
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted) return

    // Create initial balloons
    const initialBalloons: Balloon[] = []
    for (let i = 0; i < 10; i++) {
      initialBalloons.push(createBalloon(i))
    }
    setBalloons(initialBalloons)

    // Start timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Add new balloons periodically
    const balloonTimer = setInterval(() => {
      if (!gameStarted) return

      setBalloons((prev) => {
        const newBalloon = createBalloon(prev.length + Math.floor(Math.random() * 1000))
        return [...prev.filter((b) => !b.popped).slice(-15), newBalloon]
      })
    }, 1000)

    return () => {
      clearInterval(timer)
      clearInterval(balloonTimer)
    }
  }, [gameStarted, createBalloon])

  const popBalloon = (id: number) => {
    setBalloons((prev) => prev.map((balloon) => (balloon.id === id ? { ...balloon, popped: true } : balloon)))
    setScore((prev) => prev + 1)

    // Play pop sound
    const audio = new Audio()
    audio.src =
      "data:audio/wav;base64,UklGRpQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXAFAACAgICAgICAgICAgICAgICAgICAgICAgICAf3hxeH+AfXZ1eHx6dnR5fYGFgoOKi42aloubq6GOjI2Op7ythXJ0eYF5aV1AOFFib32HmZSHhpCalIiYi4lzXnBpZWBRSUdLVWRwdHGBkZSOkpiYkpOUi3hsZWptbGlnbG9veX2Dh4iEhIaGhYOCgH96dXJwbmtqaWdmZmVlZGNjYmFgX15dXFxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w=="
    audio.volume = 0.2
    audio.play()
  }

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setTimeLeft(30)
    setGameOver(false)
    setBalloons([])
  }

  const restartGame = () => {
    setGameStarted(false)
    setTimeout(startGame, 100)
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Balloon Pop Challenge</h2>

      {!gameStarted && !gameOver ? (
        <div className="text-center">
          <p className="mb-4">Pop as many balloons as you can in 30 seconds!</p>
          <button
            onClick={startGame}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between w-full mb-4">
            <div className="bg-pink-100 px-4 py-2 rounded-full">
              <span className="font-bold">Score: {score}</span>
            </div>
            <div className="bg-blue-100 px-4 py-2 rounded-full">
              <span className="font-bold">Time: {timeLeft}s</span>
            </div>
          </div>

          <div className="relative w-full h-[400px] bg-gradient-to-b from-blue-50 to-purple-50 rounded-xl overflow-hidden border-2 border-blue-100">
            <AnimatePresence>
              {balloons.map(
                (balloon) =>
                  !balloon.popped && (
                    <motion.div
                      key={balloon.id}
                      className="absolute cursor-pointer"
                      style={{
                        left: `${balloon.x}%`,
                        bottom: `-20%`,
                        width: `${balloon.size}px`,
                        height: `${balloon.size * 1.2}px`,
                      }}
                      initial={{ y: 0 }}
                      animate={{ y: `-${100 + Math.random() * 20}%` }}
                      exit={{ scale: 2, opacity: 0 }}
                      transition={{
                        y: { duration: 8 - balloon.size / 20, ease: "linear" },
                        exit: { duration: 0.2 },
                      }}
                      onClick={() => popBalloon(balloon.id)}
                    >
                      <svg viewBox="0 0 50 60" className="w-full h-full">
                        <path
                          d="M25 0C11.2 0 0 11.2 0 25C0 38.8 11.2 50 25 50C38.8 50 50 38.8 50 25C50 11.2 38.8 0 25 0Z"
                          fill={balloon.color}
                        />
                        <path d="M25 50L30 60" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
          </div>

          {gameOver && (
            <div className="mt-6 text-center">
              <h3 className="text-xl font-bold mb-2">Game Over!</h3>
              <p className="mb-4">You popped {score} balloons!</p>
              <div className="flex gap-3">
                <button
                  onClick={restartGame}
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={onComplete}
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                >
                  Celebrate
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
