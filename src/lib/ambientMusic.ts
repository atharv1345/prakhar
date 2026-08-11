/** Soft generative pad — no external audio files required. */
export class AmbientMusic {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private oscillators: OscillatorNode[] = []
  private intervalId: number | null = null
  private enabled = false

  async setEnabled(on: boolean) {
    this.enabled = on
    if (on) {
      await this.start()
    } else {
      this.stop()
    }
  }

  private async start() {
    try {
      if (!this.ctx) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (!Ctx) return
        this.ctx = new Ctx()
      }
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume()
      }
      if (this.master) {
        this.master.gain.setTargetAtTime(0.045, this.ctx.currentTime, 0.4)
        return
      }

      const master = this.ctx.createGain()
      master.gain.value = 0
      master.connect(this.ctx.destination)
      this.master = master
      master.gain.linearRampToValueAtTime(0.045, this.ctx.currentTime + 1.2)

      const chords = [
        [220, 277.18, 329.63],
        [196, 246.94, 293.66],
        [174.61, 220, 261.63],
        [207.65, 261.63, 311.13],
      ]

      let chordIndex = 0
      const playChord = () => {
        if (!this.ctx || !this.master || !this.enabled) return
        this.oscillators.forEach((osc) => {
          try {
            osc.stop()
          } catch {
            /* already stopped */
          }
        })
        this.oscillators = []

        const freqs = chords[chordIndex % chords.length]
        chordIndex += 1

        freqs.forEach((freq, index) => {
          const osc = this.ctx!.createOscillator()
          const gain = this.ctx!.createGain()
          osc.type = index === 0 ? 'sine' : 'triangle'
          osc.frequency.value = freq
          gain.gain.value = 0
          osc.connect(gain)
          gain.connect(this.master!)
          const now = this.ctx!.currentTime
          gain.gain.linearRampToValueAtTime(0.22 / freqs.length, now + 0.8)
          gain.gain.linearRampToValueAtTime(0.08 / freqs.length, now + 3.4)
          gain.gain.linearRampToValueAtTime(0, now + 4.6)
          osc.start(now)
          osc.stop(now + 4.8)
          this.oscillators.push(osc)
        })
      }

      playChord()
      this.intervalId = window.setInterval(playChord, 4200)
    } catch {
      /* Audio unavailable in this environment */
    }
  }

  private stop() {
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25)
    }
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.oscillators.forEach((osc) => {
      try {
        osc.stop()
      } catch {
        /* already stopped */
      }
    })
    this.oscillators = []
    this.master = null
  }

  dispose() {
    this.stop()
    void this.ctx?.close()
    this.ctx = null
  }
}
