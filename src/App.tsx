import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { Confetti } from './components/Confetti'
import { SupriseBox } from './components/SupriseBox'
import { VideoPlayer } from './components/VideoPlayer'
import { AmbientMusic } from './lib/ambientMusic'
import './App.css'

type Screen = 'welcome' | 'quiz1' | 'quiz2' | 'quiz3' | 'poem' | 'video' | 'gift' | 'final'
type QuizFeedback = 'idle' | 'wrong' | 'correct'
type PuzzleId = 'pattern' | 'color' | 'word' | 'match' | 'riddle' | 'finalKey'

const puzzleOrder: PuzzleId[] = ['pattern', 'color', 'word', 'match', 'riddle', 'finalKey']
const STORAGE_KEY = 'birthday-journey-v2'

const quizOneOptions = [
  { label: 'Quiet understanding without saying much 💞', answer: true },
  { label: ' Non-stop chaos & laughter 😂', answer: false },
]

const quizThreeOptions = [
  { label: 'A soft heart and a brave smile', answer: true },
  { label: 'A storm that forgot to pass', answer: false },
]

const poemLines = [
  'आज के ही दिन पता चला होगा चांद को की इस दुनिया में उससे खूबसूरत भी कोई आया है,',
  'देख कर तुम्हारी मुस्कुराहट को कुदरत का कतरा कतरा भी शरमाया है ।',
  'आज तुम्हारे जन्मदिन पर इस शायर ने भी कुछ फरमाया है, ',
  'की खुदा भी खुद पे इतराने लगा जबसे उसने तुम्हे बनाया है।',

  ' Happy Birthday — May your days be filled with laughter, love, and endless joy.',
]

const screenSteps: Screen[] = ['welcome', 'quiz1', 'quiz2', 'quiz3', 'poem', 'video', 'gift', 'final']

function getNameFromUrl() {
  if (typeof window === 'undefined') return 'AVNITA'
  const params = new URLSearchParams(window.location.search)
  return params.get('for')?.trim() || params.get('name')?.trim() || 'AVNITA'
}

function App() {
  const [name] = useState(getNameFromUrl)
  const [screen, setScreen] = useState<Screen>('welcome')
  const [entering, setEntering] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [quizFeedback, setQuizFeedback] = useState<QuizFeedback>('idle')
  const [heartBurst, setHeartBurst] = useState(false)
  const [quizTwoEscape, setQuizTwoEscape] = useState({ x: 62, y: 52 })
  const [quizTwoDodges, setQuizTwoDodges] = useState(0)
  const dodgeCooldownRef = useRef(0)
  const [poemLine, setPoemLine] = useState(0)
  const [poemDone, setPoemDone] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [giftUnlocked, setGiftUnlocked] = useState(false)
  const [boxOpen, setBoxOpen] = useState(false)
  const [wishLit, setWishLit] = useState(true)
  const [finalTyped, setFinalTyped] = useState('')
  const [score, setScore] = useState(0)

  const musicRef = useRef<AmbientMusic | null>(null)
  const trickyRef = useRef<HTMLDivElement>(null)
  const bgAudioRef = useRef<HTMLAudioElement | null>(null)
  const stepNumber = screenSteps.indexOf(screen) + 1

  useEffect(() => {
    musicRef.current = new AmbientMusic()
    try {
      localStorage.removeItem('avnita-birthday-progress')
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved) as {
          screen?: Screen
          puzzleIndex?: number
          giftUnlocked?: boolean
          score?: number
        }
        if (data.screen && screenSteps.includes(data.screen) && data.screen !== 'welcome') {
          setScreen(data.screen)
          setPuzzleIndex(data.puzzleIndex ?? 0)
          setGiftUnlocked(Boolean(data.giftUnlocked))
          setScore(data.score ?? 0)
        }
      }
    } catch {
      /* ignore */
    }
    return () => musicRef.current?.dispose()
  }, [])

  useEffect(() => {
    if (screen === 'welcome' || screen === 'final') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, puzzleIndex, giftUnlocked, score }))
    } catch {
      /* private mode */
    }
  }, [screen, puzzleIndex, giftUnlocked, score])

  useEffect(() => {
    void musicRef.current?.setEnabled(musicOn)
  }, [musicOn])

  useEffect(() => {
    if (screen !== 'poem') return undefined
    setPoemLine(0)
    setPoemDone(false)
    const timers = poemLines.map((_, index) =>
      window.setTimeout(() => setPoemLine(index + 1), 650 + index * 900),
    )
    const finalTimer = window.setTimeout(() => setPoemDone(true), 650 + poemLines.length * 900)
    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      window.clearTimeout(finalTimer)
    }
  }, [screen])

  useEffect(() => {
    const audio = bgAudioRef.current
    if (!audio) return
    audio.loop = true
    audio.volume = 0.6
    const tryPlay = async () => {
      try {
        audio.currentTime = 0
        await audio.play()
      } catch {
        /* autoplay likely blocked until user interaction */
      }
    }
    void tryPlay()
  }, [])

  useEffect(() => {
    const audio = bgAudioRef.current
    if (!audio) return
    if (screen === 'welcome') {
      audio.currentTime = 0
      void audio.play().catch(() => {})
    }
  }, [screen])

  useEffect(() => {
    if (screen !== 'final') {
      setFinalTyped('')
      return undefined
    }
    const message = `${name}, this whole little world was made so you could smile today. Happy Birthday — you make ordinary days feel like magic-- 
      Want to know about yourself? ---- You are the most sweetest,polite,caring and peace loving person who wants to enjoy the life while uplifting others , you're enough to achieve something, make yourself proud and you are already doing the same .So just believe in yourself and enjoy every moment of your life. For sure you are going to achieve all the endeavours of your life because you are hardworking, determined and most important thing the precious gem of the god .You enlighten the whole world just by your smile , so keep smiling Officer 😊`
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setFinalTyped(message.slice(0, i))
      if (i >= message.length) window.clearInterval(id)
    }, 24)
    return () => window.clearInterval(id)
  }, [screen, name])

  const goToScreen = (next: Screen) => {
    setEntering(true)
    window.setTimeout(() => {
      if (next === 'quiz2') {
        setQuizTwoDodges(0)
        setQuizTwoEscape({ x: 62, y: 52 })
        dodgeCooldownRef.current = 0
      }
      setScreen(next)
      setQuizFeedback('idle')
      setEntering(false)
    }, 280)
  }

  const startJourney = () => {
    void musicRef.current?.setEnabled(true)
    setMusicOn(true)
    void bgAudioRef.current?.play().catch(() => {})
    setCountdown(3)
  }

  useEffect(() => {
    if (countdown === null) return undefined
    if (countdown === 0) {
      setCountdown(null)
      goToScreen('quiz1')
      return undefined
    }
    const id = window.setTimeout(() => setCountdown((value) => (value === null ? null : value - 1)), 700)
    return () => window.clearTimeout(id)
  }, [countdown])

  const celebrateCorrect = () => {
    setHeartBurst(true)
    setScore((value) => value + 1)
    window.setTimeout(() => setHeartBurst(false), 900)
  }

  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setQuizFeedback('correct')
      celebrateCorrect()
      window.setTimeout(() => {
        if (screen === 'quiz1') goToScreen('quiz2')
        else if (screen === 'quiz2') goToScreen('quiz3')
        else if (screen === 'quiz3') goToScreen('poem')
      }, 900)
      return
    }
    setQuizFeedback('wrong')
    window.setTimeout(() => setQuizFeedback('idle'), 900)
  }

  const escapeSpots = [
    { x: 62, y: 52 },
    { x: 8, y: 12 },
    { x: 58, y: 8 },
    { x: 10, y: 58 },
    { x: 48, y: 36 },
  ]

  const handleEscapeEnter = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch') return
    if (quizTwoDodges >= 4) return
    const now = Date.now()
    if (now - dodgeCooldownRef.current < 450) return
    dodgeCooldownRef.current = now
    const next = quizTwoDodges + 1
    setQuizTwoDodges(next)
    setQuizTwoEscape(escapeSpots[next % escapeSpots.length])
  }

  const markPuzzleSolved = () => {
    setScore((value) => value + 1)
    if (puzzleIndex === puzzleOrder.length - 1) {
      setGiftUnlocked(true)
      return
    }
    setPuzzleIndex((current) => current + 1)
  }

  const openGift = () => {
    setBoxOpen(true)
    window.setTimeout(() => goToScreen('final'), 1000)
  }

  const replay = () => {
    localStorage.removeItem(STORAGE_KEY)
    setPuzzleIndex(0)
    setGiftUnlocked(false)
    setBoxOpen(false)
    setWishLit(true)
    setScore(0)
    if (bgAudioRef.current) {
      bgAudioRef.current.currentTime = 0
      void bgAudioRef.current.play().catch(() => {})
    }
    goToScreen('welcome')
  }

  return (
    <div className="app-root">
      <audio
        ref={bgAudioRef}
        src="/audio/Tum%20Par%20Hum%20Hai%20Atke%20Yaara%20Pyaar%20Kiya%20To%20Darna%20Kya%20128%20Kbps.mp3"
      />
      <div className="atmosphere" aria-hidden="true">
        <div className="mist mist-a" />
        <div className="mist mist-b" />
        <div className="mist mist-c" />
        <div className="petal-field">
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={index}
              className="drift-petal"
              style={{
                left: `${(index * 5.7) % 100}%`,
                animationDelay: `${index * 0.35}s`,
                animationDuration: `${9 + (index % 5)}s`,
              }}
            />
          ))}
        </div>
      </div>

      {heartBurst ? (
        <div className="heart-burst" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, index) => (
            <span key={index} style={{ '--i': index } as CSSProperties}>
              ♥
            </span>
          ))}
        </div>
      ) : null}

      <header className="top-bar">
        <button
          type="button"
          className="ghost-btn"
          onClick={() => setMusicOn((value) => !value)}
          aria-pressed={musicOn}
        >
          {musicOn ? 'Sound on' : 'Sound off'}
        </button>
        <div className="progress-track" aria-label={`Step ${stepNumber} of 8`}>
          <div className="progress-fill" style={{ width: `${(stepNumber / 8) * 100}%` }} />
        </div>
        <span className="step-label">{stepNumber} / 8</span>
      </header>

      <main className={`stage ${entering ? 'stage-exit' : 'stage-enter'}`}>
        {screen === 'welcome' ? (
          <section className="welcome-hero">
            <p className="brand">{name}</p>
            <h1>A birthday adventure just for you</h1>
            <p className="lede">Quizzes, a poem, your video, and a gift at the end.</p>
            {countdown !== null ? (
              <div className="countdown" aria-live="polite">
                {countdown === 0 ? 'Go' : countdown}
              </div>
            ) : (
              <button type="button" className="primary-btn" onClick={startJourney}>
                Start the magic
              </button>
            )}
            <div className="hero-bloom" aria-hidden="true">
              <div className="bloom-ring" />
              <div className="bloom-core" />
            </div>
          </section>
        ) : null}

        {screen === 'quiz1' || screen === 'quiz2' || screen === 'quiz3' ? (
          <section className="quiz-scene">
            <p className="eyebrow">
              Challenge {screen === 'quiz1' ? '01' : screen === 'quiz2' ? '02' : '03'} · Score {score}
            </p>
            {screen === 'quiz1' ? (
              <>
                <h2>What do you think describes our friendship best?</h2>
                <div className="choice-stack">
                  {quizOneOptions.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      className="choice-btn"
                      onClick={() => handleQuizAnswer(option.answer)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {screen === 'quiz2' ? (
              <>
                <h2>Which one sounds more like us?</h2>
                <div className="tricky-field" ref={trickyRef}>
                  <button type="button" className="choice-btn" onClick={() => handleQuizAnswer(false)}>
                    Two idiots creating memories 😂
                  </button>
                  <button
                    type="button"
                    className={`choice-btn escape-btn ${quizTwoDodges >= 4 ? 'escape-settled' : ''}`}
                    style={{ left: `${quizTwoEscape.x}%`, top: `${quizTwoEscape.y}%` }}
                    onPointerEnter={handleEscapeEnter}
                    onClick={() => handleQuizAnswer(true)}
                  >
                    Two people who somehow understand each other 🤍
                  </button>
                </div>
                {quizTwoDodges >= 4 ? (
                  <p className="toast toast-good">Caught it — tap the AVNITA answer.</p>
                ) : (
                  <p className="hint-line">Catch the AVNITA answer (on phone, just tap it).</p>
                )}
              </>
            ) : null}

            {screen === 'quiz3' ? (
              <>
                <h2>What makes {name} shine most?</h2>
                <div className="choice-stack">
                  {quizThreeOptions.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      className="choice-btn"
                      onClick={() => handleQuizAnswer(option.answer)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {quizFeedback === 'wrong' ? <p className="toast toast-bad">Nope — try the warmer answer.</p> : null}
            {quizFeedback === 'correct' ? <p className="toast toast-good">Yes! +1 sparkle</p> : null}
          </section>
        ) : null}

        {screen === 'poem' ? (
          <section className="poem-scene">
            <p className="eyebrow">For {name}</p>
            <h2>Some lines From My Heart</h2>
            <div className="poem-sheet">
              {poemLines.slice(0, poemLine).map((line) => (
                <p key={line} className="poem-line">
                  {line}
                </p>
              ))}
            </div>
            {poemDone ? (
              <button type="button" className="primary-btn" onClick={() => goToScreen('video')}>
                Play your video
              </button>
            ) : null}
          </section>
        ) : null}

        {screen === 'video' ? (
          <section className="video-scene">
            <p className="eyebrow">Special video</p>
            <h2>Made to make you smile</h2>
            <VideoPlayer
              onContinue={() => {
                try {
                  void bgAudioRef.current?.play()?.catch(() => {})
                } catch {}
                goToScreen('gift')
              }}
              onPlayStart={() => {
                try {
                  bgAudioRef.current?.pause()
                } catch {}
              }}
              onPlayEnd={() => {
                try {
                  void bgAudioRef.current?.play()?.catch(() => {})
                } catch {}
              }}
            />
          </section>
        ) : null}

        {screen === 'gift' ? (
          <SupriseBox puzzleIndex={puzzleIndex} giftUnlocked={giftUnlocked} boxOpen={boxOpen} onSolved={markPuzzleSolved} onOpenGift={openGift} />
        ) : null}

        {screen === 'final' ? (
          <section className="final-scene">
            <Confetti active />
            <p className="eyebrow">Score {score} · For {name}</p>
            <h2>Happy Birthday</h2>
            <p className="final-letter">
              {finalTyped}
              <span className="caret" aria-hidden="true" />
            </p>
            <button
              type="button"
              className={`candle ${wishLit ? 'lit' : 'blown'}`}
              onClick={() => setWishLit(false)}
              aria-label={wishLit ? 'Blow out the candle' : 'Wish made'}
            >
              <span className="flame" aria-hidden="true" />
              <span className="wick" aria-hidden="true" />
              {wishLit ? 'Make a wish' : 'Wish sealed ✨'}
            </button>
            <p className="signature">With love — always</p>
            <button type="button" className="ghost-btn" onClick={replay}>
              Replay the journey
            </button>
          </section>
        ) : null}
      </main>
    </div>
  )
}

export default App
