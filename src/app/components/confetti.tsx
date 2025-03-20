"\"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type ConfettiPiece = {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
}

export default function Confetti() {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    const colors = ["#FF9FF3", "#FECA57", "#FF6B6B", "#48DBFB", "#1DD1A1", "#F368E0"]
    const pieces: ConfettiPiece[] = []

    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        y: -20 - Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 10,
        rotation: Math.random() * 360,
      })
    }

    setConfetti(pieces)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "0%",
          }}
          animate={{
            y: ["0%", "100%"],
            x: [`${piece.x}%`, `${piece.x + (Math.random() * 20 - 10)}%`],
            rotate: [0, piece.rotation],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            ease: "linear",
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  )
}

