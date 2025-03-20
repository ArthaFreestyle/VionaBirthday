"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

type Card = {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

export default function MemoryGame({ onComplete }: { onComplete: () => void }) {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)

  const emojis = ["🎂", "🎁", "🎈", "🎉", "🍰", "🎊", "🎵", "🎸"]

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    // Create pairs of cards
    const cardPairs = [...emojis, ...emojis].map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false,
    }))

    // Shuffle cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5)

    setCards(shuffledCards)
    setFlippedCards([])
    setMoves(0)
    setGameComplete(false)
  }

  const handleCardClick = (id: number) => {
    // Ignore if already flipped or matched
    if (cards.find((card) => card.id === id)?.flipped || cards.find((card) => card.id === id)?.matched) {
      return
    }

    // Ignore if two cards are already flipped
    if (flippedCards.length === 2) {
      return
    }

    // Flip the card
    setCards((prev) => prev.map((card) => (card.id === id ? { ...card, flipped: true } : card)))

    // Add to flipped cards
    setFlippedCards((prev) => [...prev, id])

    // If this is the second card flipped
    if (flippedCards.length === 1) {
      setMoves((prev) => prev + 1)

      // Get the first flipped card
      const firstCardId = flippedCards[0]
      const firstCard = cards.find((card) => card.id === firstCardId)
      const secondCard = cards.find((card) => card.id === id)

      // Check if they match
      if (firstCard?.emoji === secondCard?.emoji) {
        // Mark as matched
        setCards((prev) =>
          prev.map((card) => (card.id === firstCardId || card.id === id ? { ...card, matched: true } : card)),
        )

        // Reset flipped cards
        setFlippedCards([])

        // Check if all cards are matched
        const allMatched = cards.every((card) => (card.id === firstCardId || card.id === id ? true : card.matched))
        if (allMatched) {
          setGameComplete(true)
          onComplete()
        }
      } else {
        // If they don't match, flip them back after a delay
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) => (card.id === firstCardId || card.id === id ? { ...card, flipped: false } : card)),
          )
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Birthday Memory Game</h2>

      <div className="flex justify-between w-full mb-4">
        <div className="bg-pink-100 px-4 py-2 rounded-full">
          <span className="font-bold">Moves: {moves}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className="w-16 h-16 md:w-20 md:h-20 cursor-pointer"
            onClick={() => handleCardClick(card.id)}
            whileHover={{ scale: card.flipped || card.matched ? 1 : 1.05 }}
            whileTap={{ scale: card.flipped || card.matched ? 1 : 0.95 }}
          >
            <div className="relative w-full h-full">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center"
                animate={{
                  rotateY: card.flipped || card.matched ? 180 : 0,
                  opacity: card.flipped || card.matched ? 0 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-white font-bold">?</span>
              </motion.div>

              <motion.div
                className="absolute inset-0 bg-white rounded-lg border-2 border-purple-200 flex items-center justify-center"
                initial={{ rotateY: -180 }}
                animate={{
                  rotateY: card.flipped || card.matched ? 0 : -180,
                  opacity: card.flipped || card.matched ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-3xl">{card.emoji}</span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {gameComplete && (
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
          <p className="mb-4">You completed the game in {moves} moves!</p>
          <div className="flex gap-3">
            <Button onClick={initializeGame} variant="outline">
              Play Again
            </Button>
            <Button onClick={onComplete} className="bg-gradient-to-r from-pink-500 to-purple-500">
              Celebrate
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

