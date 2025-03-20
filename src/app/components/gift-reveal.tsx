"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Gift, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

type GiftItem = {
  id: number
  emoji: string
  name: string
  opened: boolean
}

export default function GiftReveal({ onComplete }: { onComplete: () => void }) {
  const [gifts, setGifts] = useState<GiftItem[]>([
    { id: 1, emoji: "🎂", name: "Birthday Cake", opened: false },
    { id: 2, emoji: "🎮", name: "Video Game", opened: false },
    { id: 3, emoji: "📱", name: "New Phone", opened: false },
    { id: 4, emoji: "🎫", name: "Concert Tickets", opened: false },
    { id: 5, emoji: "💰", name: "Money", opened: false },
    { id: 6, emoji: "🎨", name: "Art Supplies", opened: false },
  ])

  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null)
  const [allOpened, setAllOpened] = useState(false)

  const openGift = (gift: GiftItem) => {
    setSelectedGift(gift)

    // Mark as opened
    setGifts((prev) => prev.map((g) => (g.id === gift.id ? { ...g, opened: true } : g)))

    // Check if all gifts are opened
    const updatedGifts = gifts.map((g) => (g.id === gift.id ? { ...g, opened: true } : g))
    if (updatedGifts.every((g) => g.opened)) {
      setAllOpened(true)
      onComplete()
    }
  }

  const closeGiftReveal = () => {
    setSelectedGift(null)
  }

  const resetGifts = () => {
    setGifts((prev) => prev.map((g) => ({ ...g, opened: false })))
    setSelectedGift(null)
    setAllOpened(false)
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Birthday Gifts</h2>
      <p className="text-center mb-6">Click on the gifts to unwrap your birthday surprises!</p>

      {selectedGift ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-pink-100 to-purple-100 p-8 rounded-2xl text-center max-w-sm w-full"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="text-6xl mb-4"
          >
            {selectedGift.emoji}
          </motion.div>

          <h3 className="text-xl font-bold mb-2">You got a {selectedGift.name}!</h3>
          <p className="text-gray-600 mb-4">What a wonderful birthday gift!</p>

          <Button onClick={closeGiftReveal} variant="outline" className="rounded-full">
            Continue Unwrapping
          </Button>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {gifts.map((gift) => (
              <motion.div
                key={gift.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative cursor-pointer ${gift.opened ? "opacity-50" : ""}`}
                onClick={() => !gift.opened && openGift(gift)}
              >
                <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
                  {gift.opened ? (
                    <div className="text-4xl">{gift.emoji}</div>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg"></div>
                      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-r from-pink-300 to-purple-300 rounded-t-lg"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Gift size={32} className="text-white" />
                      </div>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center">
                          <Sparkles size={14} className="text-yellow-600" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {gift.opened && <div className="mt-1 text-xs text-center text-gray-500">{gift.name}</div>}
              </motion.div>
            ))}
          </div>

          {allOpened && (
            <div className="mt-4 flex gap-3">
              <Button onClick={resetGifts} variant="outline">
                Reset Gifts
              </Button>
              <Button onClick={onComplete} className="bg-gradient-to-r from-pink-500 to-purple-500">
                Celebrate
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

