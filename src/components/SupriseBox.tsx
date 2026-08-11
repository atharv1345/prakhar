import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'

type PuzzleId = 'pattern' | 'color' | 'word' | 'match' | 'riddle' | 'finalKey'

type SupriseBoxProps = {
  puzzleIndex: number
  giftUnlocked: boolean
  boxOpen: boolean
  onSolved: () => void
  onOpenGift: () => void
}

const lockCount = 6

const puzzleTitles: PuzzleId[] = ['pattern', 'color', 'word', 'match', 'riddle', 'finalKey']
const puzzleTitleText: Record<PuzzleId, string> = {
  pattern: 'Pattern lock',
  color: 'Colour code',
  word: 'Secret word',
  match: 'Memory match',
  riddle: 'Soft riddle',
  finalKey: 'Final key',
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)') as MediaQueryList | undefined
    if (!mq) return
    const apply = () => setReduced(Boolean(mq.matches))
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])
  return reduced
}

export function SupriseBox({ puzzleIndex, giftUnlocked, boxOpen, onSolved, onOpenGift }: SupriseBoxProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  const activePuzzleId = puzzleTitles[puzzleIndex] ?? 'pattern'

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const lidRef = useRef<HTMLDivElement | null>(null)
  const ribbonRef = useRef<HTMLDivElement | null>(null)

  const doorRefs = useRef<Array<HTMLDivElement | null>>([])
  const prevPuzzleIndexRef = useRef(puzzleIndex)
  const prevGiftUnlockedRef = useRef(giftUnlocked)
  const prevBoxOpenRef = useRef(boxOpen)

  const solvedGuardRef = useRef(false)
  const [sparks, setSparks] = useState(false)

  const progress = useMemo(() => {
    const clearedLocks = giftUnlocked ? lockCount : Math.max(0, puzzleIndex)
    return Math.round((clearedLocks / lockCount) * 100)
  }, [giftUnlocked, puzzleIndex])

  // Local states for each puzzle (reset when puzzle changes)
  const [patternInput, setPatternInput] = useState<number[]>([])
  const [colorInput, setColorInput] = useState<string[]>([])
  const [colorHint, setColorHint] = useState('')

  const memoryCards = useMemo(
    () => [
      { id: 1, mark: '✿', pair: 'avnita' },
      { id: 2, mark: '◆', pair: 'choco' },
      { id: 3, mark: '▲', pair: 'honey' },
      { id: 4, mark: '✿', pair: 'avnita' },
      { id: 5, mark: '◆', pair: 'choco' },
      { id: 6, mark: '▲', pair: 'honey' },
    ],
    [],
  )

  const [matchSelection, setMatchSelection] = useState<number[]>([])
  const [matchedCards, setMatchedCards] = useState<number[]>([])

  const [riddleAnswer, setRiddleAnswer] = useState('')
  const [riddleHint, setRiddleHint] = useState('')

  const [holding, setHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const holdRafRef = useRef<number | null>(null)
  const holdStartRef = useRef<number | null>(null)

  useEffect(() => {
    solvedGuardRef.current = false

    setPatternInput([])
    setColorInput([])
    setColorHint('')
    setMatchSelection([])
    setMatchedCards([])
    setRiddleAnswer('')
    setRiddleHint('')

    setHolding(false)
    setHoldProgress(0)

    setSparks(false)
  }, [puzzleIndex, giftUnlocked])

  useEffect(() => {
    if (prefersReducedMotion) return undefined

    // When a lock is solved, puzzleIndex increments in App; animate the previous door.
    if (!giftUnlocked && prevPuzzleIndexRef.current !== puzzleIndex) {
      const doorIndex = prevPuzzleIndexRef.current
      const plate = doorRefs.current[doorIndex]
      if (plate) {
        gsap.timeline({ defaults: { ease: 'power3.out' } }).to(plate, {
          duration: 0.55,
          rotateY: -85,
          translateZ: 44,
        })
      }
      prevPuzzleIndexRef.current = puzzleIndex
    }

    if (giftUnlocked && prevGiftUnlockedRef.current !== giftUnlocked) {
      // Last puzzle solved: flip remaining doors + ribbon pulse.
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      for (let i = 0; i < lockCount; i += 1) {
        const plate = doorRefs.current[i]
        if (!plate) continue
        tl.to(plate, { duration: 0.25, rotateY: -85, translateZ: 44 }, 0.05 * i)
      }
      if (ribbonRef.current) {
        tl.to(
          ribbonRef.current,
          {
            duration: 0.6,
            filter: 'drop-shadow(0 0 18px rgba(255, 246, 248, 0.85))',
            scale: 1.06,
          },
          0.1,
        )
        tl.to(
          ribbonRef.current,
          {
            duration: 0.55,
            filter: 'drop-shadow(0 0 0px rgba(255, 246, 248, 0.0))',
            scale: 1,
          },
          0.6,
        )
      }
    }

    prevGiftUnlockedRef.current = giftUnlocked
  }, [giftUnlocked, puzzleIndex, prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) return undefined
    if (prevBoxOpenRef.current === boxOpen) return undefined
    prevBoxOpenRef.current = boxOpen

    if (!boxOpen) return undefined

    setSparks(true)
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    if (lidRef.current) {
      tl.to(lidRef.current, { duration: 0.75, rotateX: -115, transformOrigin: '50% 100%' })
      tl.to(
        lidRef.current,
        {
          duration: 0.2,
          rotateX: -102,
        },
        '+=0.1',
      )
    }
    if (boxRef.current) {
      tl.to(boxRef.current, { duration: 0.55, rotateZ: 0.6 }, 0)
      tl.to(boxRef.current, { duration: 0.55, rotateZ: 0 }, 0.52)
    }
    return () => {}
  }, [boxOpen, prefersReducedMotion])

  useEffect(() => {
    const wrapper = wrapperRef.current
    const box = boxRef.current
    if (!wrapper || !box) return undefined

    if (prefersReducedMotion) {
      box.style.setProperty('--rx', '0deg')
      box.style.setProperty('--ry', '0deg')
      return undefined
    }

    let raf = 0
    let lastX = 0
    let lastY = 0
    const onMove = (event: PointerEvent) => {
      lastX = event.clientX
      lastY = event.clientY
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        const rect = wrapper.getBoundingClientRect()
        const nx = (lastX - rect.left) / rect.width - 0.5
        const ny = (lastY - rect.top) / rect.height - 0.5
        const ry = nx * 16
        const rx = -ny * 12
        box.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
        box.style.setProperty('--ry', `${ry.toFixed(2)}deg`)
      })
    }

    wrapper.addEventListener('pointermove', onMove)
    return () => {
      wrapper.removeEventListener('pointermove', onMove)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [prefersReducedMotion])

  const triggerSolved = () => {
    if (solvedGuardRef.current) return
    solvedGuardRef.current = true
    onSolved()
  }

  const lockButtonsDisabled = giftUnlocked

  // Pattern: middle(2) -> left(1) -> right(3)
  const handlePatternPick = (value: number) => {
    if (lockButtonsDisabled) return
    const next = [...patternInput, value]
    setPatternInput(next)
    if (next.length !== 3) return

    const solved = next[0] === 2 && next[1] === 1 && next[2] === 3
    if (solved) {
      triggerSolved()
    } else {
      window.setTimeout(() => setPatternInput([]), 550)
    }
  }

  const handleColorPick = (value: string) => {
    if (lockButtonsDisabled) return
    const next = [...colorInput, value]
    setColorInput(next)
    if (next.length !== 3) return

    const solved = next.every((item, index) => item === ['blush', 'moss', 'gold'][index])
    if (solved) {
      triggerSolved()
    } else {
      setColorHint('Try again: blush → moss → gold')
      window.setTimeout(() => {
        setColorInput([])
        setColorHint('')
      }, 700)
    }
  }

  const handleWordChoice = (value: string) => {
    if (lockButtonsDisabled) return
    if (value === 'AVNITA') triggerSolved()
  }

  const handleMatchCard = (id: number) => {
    if (lockButtonsDisabled) return
    if (matchSelection.includes(id) || matchedCards.includes(id)) return

    const nextSelection = [...matchSelection, id]
    setMatchSelection(nextSelection)

    if (nextSelection.length < 2) return
    const [a, b] = nextSelection
    const first = memoryCards.find((c) => c.id === a)
    const second = memoryCards.find((c) => c.id === b)

    if (first && second && first.pair === second.pair) {
      const updatedMatched = [...matchedCards, a, b]
      setMatchedCards(updatedMatched)
      setMatchSelection([])
      if (updatedMatched.length === memoryCards.length) triggerSolved()
      return
    }

    window.setTimeout(() => setMatchSelection([]), 650)
  }

  const handleRiddleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (lockButtonsDisabled) return
    if (riddleAnswer.trim().toLowerCase() === 'avnita') {
      triggerSolved()
      setRiddleAnswer('')
      setRiddleHint('')
      return
    }
    setRiddleHint('A little more thought…')
  }

  const startHold = () => {
    if (lockButtonsDisabled) return
    if (holding) return
    setHolding(true)
    setHoldProgress(0)
    holdStartRef.current = performance.now()

    const tick = () => {
      const start = holdStartRef.current
      if (!start) return
      const elapsed = performance.now() - start
      const progress01 = Math.min(1, elapsed / 1200)
      setHoldProgress(progress01)
      if (progress01 >= 1) {
        setHolding(false)
        holdRafRef.current = null
        triggerSolved()
        return
      }
      holdRafRef.current = window.requestAnimationFrame(tick)
    }

    holdRafRef.current = window.requestAnimationFrame(tick)
  }

  const stopHold = () => {
    if (!holding) return
    setHolding(false)
    setHoldProgress(0)
    if (holdRafRef.current) window.cancelAnimationFrame(holdRafRef.current)
    holdRafRef.current = null
    holdStartRef.current = null
  }

  return (
    <section className="gift-scene">
      <div className="gift-layout">
        <div className="gift-3d-wrap" ref={wrapperRef}>
          <div
            className={`gift-visual gift-3d ${giftUnlocked ? 'unlocked' : ''} ${boxOpen ? 'opening' : ''}`}
            ref={boxRef}
          >
            <div className="gift-3d-shadow" aria-hidden="true" />
            <div className="gift-lid" ref={lidRef} />
            <div className="gift-body" />
            <div className="gift-bow" ref={ribbonRef} />

            <div className="gift-doors" aria-hidden="true">
              {puzzleTitles.map((_, i) => (
                <div
                  key={i}
                  className={`door-plate ${giftUnlocked || i < puzzleIndex ? 'door-opened' : ''}`}
                  ref={(el) => {
                    doorRefs.current[i] = el
                  }}
                  style={{
                    left: `${15 + (i % 3) * 33}%`,
                    top: `${16 + Math.floor(i / 3) * 40}%`,
                  }}
                />
              ))}
            </div>

            {sparks ? <div className="gift-spark gift-spark-anim" aria-hidden="true" /> : null}
          </div>
        </div>

        <div className="lock-panel">
          <div className="lock-row" aria-label={`${puzzleIndex} of ${lockCount} locks cleared`}>
            {Array.from({ length: lockCount }).map((_, i) => (
              <span
                key={i}
                className={`lock-pip ${i < puzzleIndex ? 'cleared' : i === puzzleIndex && !giftUnlocked ? 'current' : ''} ${
                  giftUnlocked && i < lockCount ? 'cleared' : ''
                }`}
              />
            ))}
          </div>

          <p className="eyebrow">
            Lock {Math.min(puzzleIndex + 1, lockCount)} · {progress}%
          </p>
          <h2>{giftUnlocked ? 'Gift unlocked!' : puzzleTitleText[activePuzzleId]}</h2>

          {!giftUnlocked && activePuzzleId === 'pattern' ? (
            <div className="puzzle">
              <p>Tap in order: middle → left → right</p>
              <div className="pattern-row">
                <button className="pattern-dot" type="button" onClick={() => handlePatternPick(1)} disabled={lockButtonsDisabled}>
                  Left
                </button>
                <button className="pattern-dot" type="button" onClick={() => handlePatternPick(2)} disabled={lockButtonsDisabled}>
                  Middle
                </button>
                <button className="pattern-dot" type="button" onClick={() => handlePatternPick(3)} disabled={lockButtonsDisabled}>
                  Right
                </button>
              </div>
              <p className="hint">{patternInput.length ? `Picked: ${patternInput.join(' → ')}` : 'Start with the middle one.'}</p>
            </div>
          ) : null}

          {!giftUnlocked && activePuzzleId === 'color' ? (
            <div className="puzzle">
              <p>Choose: blush → moss → gold</p>
              <div className="color-row">
                {(['blush', 'moss', 'gold'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`color-chip ${value}`}
                    onClick={() => handleColorPick(value)}
                    disabled={lockButtonsDisabled}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="hint">{colorHint || (colorInput.length ? `Chosen: ${colorInput.join(' → ')}` : 'Make a soft sequence')}</p>
            </div>
          ) : null}

          {!giftUnlocked && activePuzzleId === 'word' ? (
            <div className="puzzle">
              <p>Pick the secret word which Hide on my Heart</p>
              <div className="choice-stack compact">
                {['LOVE', 'AVNITA', 'SMILE'].map((value) => (
                  <button key={value} type="button" className="choice-btn" onClick={() => handleWordChoice(value)} disabled={lockButtonsDisabled}>
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {!giftUnlocked && activePuzzleId === 'match' ? (
            <div className="puzzle">
              <p>Match the petals</p>
              <div className="match-grid">
                {memoryCards.map((card) => {
                  const revealed = matchSelection.includes(card.id) || matchedCards.includes(card.id)
                  return (
                    <button
                      key={card.id}
                      type="button"
                      className={`match-card ${revealed ? 'revealed' : ''}`}
                      onClick={() => handleMatchCard(card.id)}
                      disabled={lockButtonsDisabled}
                      aria-label={revealed ? card.pair : 'Hidden card'}
                    >
                      {revealed ? card.mark : '✦'}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {!giftUnlocked && activePuzzleId === 'riddle' ? (
            <div className="puzzle">
              <p>Riddle: What blooms softly and says hello from my heart?</p>
              <form className="riddle-form" onSubmit={handleRiddleSubmit}>
                <input
                  type="text"
                  value={riddleAnswer}
                  onChange={(event) => setRiddleAnswer(event.target.value)}
                  placeholder="Type your answer"
                  aria-label="Riddle answer"
                  disabled={lockButtonsDisabled}
                />
                <button type="submit" className="primary-btn compact">
                  Unlock
                </button>
              </form>
              {riddleHint ? <p className="hint">{riddleHint}</p> : null}
            </div>
          ) : null}

          {!giftUnlocked && activePuzzleId === 'finalKey' ? (
            <div className="puzzle">
              <p>Hold to unseal</p>
              <button
                type="button"
                className={`hold-key ${holding ? 'holding' : ''}`}
                onPointerDown={startHold}
                onPointerUp={stopHold}
                onPointerCancel={stopHold}
                onPointerLeave={stopHold}
                disabled={lockButtonsDisabled}
              >
                <span className="hold-key-glow" aria-hidden="true" />
                <span className="hold-key-label">{holding ? 'Unsealing…' : 'Press & hold'}</span>
                <span className="hold-key-ring" aria-hidden="true" style={{ transform: `rotate(${holdProgress * 360}deg)` }} />
              </button>
              <p className="hint">{holdProgress > 0 ? `Progress: ${Math.round(holdProgress * 100)}%` : 'Keep holding until it opens.'}</p>
            </div>
          ) : null}

          {giftUnlocked ? (
            <div className="unlock-block">
              <p className="unlock-text">The ribbon is ready. The box can feel your magic.</p>
              <button type="button" className="primary-btn" onClick={onOpenGift}>
                Open the gift
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

