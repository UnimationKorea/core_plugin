/**
 * Word Guess Activity Template
 * 단어 맞추기 게임 - 사용자가 글자를 하나씩 입력해서 단어를 맞추는 활동
 */

export interface WordGuessParams {
  word: string              // 맞춰야 할 단어
  hint: string             // 단어에 대한 힌트
  category?: string        // 단어 카테고리
  maxAttempts?: number     // 최대 시도 횟수 (기본: 6)
  showHintAfter?: number   // 몇 번 틀린 후 힌트 표시 (기본: 3)
  timeLimit?: number       // 제한 시간(초), 0이면 무제한 (기본: 0)
  difficulty?: string      // 난이도 (쉬움/보통/어려움)
}

export interface WordGuessContext {
  activityId: string
  eventBus: {
    emit(event: { type: string; activityId: string; timestamp?: number; payload?: any }): void
  }
}

export class WordGuessTemplate {
  private params: WordGuessParams
  private context: WordGuessContext
  private container: HTMLElement
  
  // Game state
  private targetWord: string
  private guessedLetters: Set<string> = new Set()
  private wrongLetters: Set<string> = new Set()
  private attempts: number = 0
  private gameCompleted: boolean = false
  private gameWon: boolean = false
  private startTime: number = Date.now()
  private timer: number | null = null
  private remainingTime: number = 0

  constructor(container: HTMLElement, params: WordGuessParams, context: WordGuessContext) {
    this.container = container
    this.params = params
    this.context = context
    this.targetWord = params.word.toLowerCase()
    this.remainingTime = params.timeLimit || 0
  }

  async mount(): Promise<void> {
    // Load CSS
    await this.loadStyles()
    
    // Render UI
    this.render()
    
    // Setup event listeners
    this.setupEventListeners()
    
    // Start timer if needed
    if (this.params.timeLimit && this.params.timeLimit > 0) {
      this.startTimer()
    }
    
    // Emit start event
    this.context.eventBus.emit({
      type: 'START',
      activityId: this.context.activityId,
      timestamp: this.startTime
    })
  }

  private async loadStyles(): Promise<void> {
    return new Promise((resolve) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/static/css/templates/word-guess.css'
      link.onload = () => resolve()
      link.onerror = () => {
        // Fallback: inject styles directly
        const style = document.createElement('style')
        style.textContent = `/* Fallback styles for word-guess */`
        document.head.appendChild(style)
        resolve()
      }
      document.head.appendChild(link)
    })
  }

  private render(): void {
    const { category, maxAttempts = 6, difficulty } = this.params
    
    this.container.innerHTML = `
      <div class="word-guess-activity">
        <div class="word-guess-header">
          <h2 class="word-guess-title">🔤 단어 맞추기</h2>
          ${category ? `<span class="word-guess-category">${category}</span>` : ''}
          ${difficulty ? `<div class="difficulty-badge ${difficulty}">${difficulty}</div>` : ''}
        </div>
        
        <div class="word-display">
          <div class="word-letters" id="word-display">
            ${this.generateWordDisplay()}
          </div>
        </div>
        
        <div class="input-section">
          <input type="text" 
                 id="letter-input" 
                 class="letter-input" 
                 maxlength="1" 
                 placeholder="?" 
                 autocomplete="off"
                 ${this.gameCompleted ? 'disabled' : ''}>
          <button id="guess-btn" class="guess-btn" ${this.gameCompleted ? 'disabled' : ''}>
            추측하기
          </button>
        </div>
        
        <div class="game-stats">
          <div class="stat-item">
            <span class="stat-label">남은 기회</span>
            <span class="stat-value attempts-left" id="attempts-left">
              ${maxAttempts - this.attempts}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">진행률</span>
            <span class="stat-value" id="progress">
              ${this.calculateProgress()}%
            </span>
          </div>
          ${this.params.timeLimit ? `
            <div class="stat-item">
              <span class="stat-label">남은 시간</span>
              <span class="stat-value timer" id="timer">
                ${this.formatTime(this.remainingTime)}
              </span>
            </div>
          ` : ''}
        </div>
        
        <div class="wrong-letters">
          <div class="wrong-letters-title">틀린 글자</div>
          <div class="wrong-letters-list" id="wrong-letters">
            ${Array.from(this.wrongLetters).join(' ')}
          </div>
        </div>
        
        <div class="hint-section" id="hint-section">
          <div class="hint-title">💡 힌트</div>
          <div class="hint-text">${this.params.hint}</div>
        </div>
        
        <div class="result-section" id="result-section">
          <div class="result-title" id="result-title"></div>
          <div class="result-message" id="result-message"></div>
          <div class="result-word" id="result-word">${this.params.word}</div>
          <button class="restart-btn" id="restart-btn">다시 시작</button>
        </div>
      </div>
    `
  }

  private generateWordDisplay(): string {
    return this.targetWord
      .split('')
      .map(letter => {
        const isRevealed = this.guessedLetters.has(letter)
        return `<span class="letter ${isRevealed ? 'revealed' : ''}">${isRevealed ? letter.toUpperCase() : '_'}</span>`
      })
      .join('')
  }

  private setupEventListeners(): void {
    const letterInput = this.container.querySelector('#letter-input') as HTMLInputElement
    const guessBtn = this.container.querySelector('#guess-btn') as HTMLButtonElement
    const restartBtn = this.container.querySelector('#restart-btn') as HTMLButtonElement

    // Letter input handling
    letterInput?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      target.value = target.value.replace(/[^가-힣a-zA-Z]/g, '').toLowerCase()
    })

    letterInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleGuess()
      }
    })

    // Guess button
    guessBtn?.addEventListener('click', () => {
      this.handleGuess()
    })

    // Restart button
    restartBtn?.addEventListener('click', () => {
      this.restartGame()
    })

    // Focus on input
    letterInput?.focus()
  }

  private handleGuess(): void {
    if (this.gameCompleted) return

    const input = this.container.querySelector('#letter-input') as HTMLInputElement
    const letter = input.value.toLowerCase().trim()

    if (!letter) {
      this.showFeedback('글자를 입력해주세요!', 'warning')
      return
    }

    if (this.guessedLetters.has(letter) || this.wrongLetters.has(letter)) {
      this.showFeedback('이미 시도한 글자입니다!', 'warning')
      input.value = ''
      input.focus()
      return
    }

    // Check if letter is in word
    if (this.targetWord.includes(letter)) {
      this.guessedLetters.add(letter)
      this.showFeedback('정답입니다! 🎉', 'success')
      
      // Check if word is complete
      if (this.isWordComplete()) {
        this.completeGame(true)
      }
    } else {
      this.wrongLetters.add(letter)
      this.attempts++
      this.showFeedback('틀렸습니다! 😅', 'error')
      
      // Show hint if needed
      if (this.attempts >= (this.params.showHintAfter || 3)) {
        this.showHint()
      }
      
      // Check if game over
      if (this.attempts >= (this.params.maxAttempts || 6)) {
        this.completeGame(false)
      }
    }

    // Update UI
    this.updateDisplay()
    input.value = ''
    input.focus()

    // Emit progress event
    this.context.eventBus.emit({
      type: 'PROGRESS',
      activityId: this.context.activityId,
      payload: { 
        progress: this.calculateProgress() / 100,
        attempts: this.attempts,
        guessedLetters: Array.from(this.guessedLetters),
        wrongLetters: Array.from(this.wrongLetters)
      }
    })
  }

  private isWordComplete(): boolean {
    return this.targetWord.split('').every(letter => this.guessedLetters.has(letter))
  }

  private calculateProgress(): number {
    const totalLetters = new Set(this.targetWord.split('')).size
    const guessedCount = this.targetWord.split('').filter(letter => 
      this.guessedLetters.has(letter)
    ).length
    return Math.round((guessedCount / this.targetWord.length) * 100)
  }

  private updateDisplay(): void {
    // Update word display
    const wordDisplay = this.container.querySelector('#word-display')
    if (wordDisplay) {
      wordDisplay.innerHTML = this.generateWordDisplay()
    }

    // Update attempts
    const attemptsLeft = this.container.querySelector('#attempts-left')
    if (attemptsLeft) {
      const remaining = (this.params.maxAttempts || 6) - this.attempts
      attemptsLeft.textContent = remaining.toString()
      
      // Update styling based on remaining attempts
      attemptsLeft.className = 'stat-value attempts-left'
      if (remaining <= 2) {
        attemptsLeft.classList.add('danger')
      } else if (remaining <= 3) {
        attemptsLeft.classList.add('warning')
      }
    }

    // Update progress
    const progress = this.container.querySelector('#progress')
    if (progress) {
      progress.textContent = `${this.calculateProgress()}%`
    }

    // Update wrong letters
    const wrongLettersDisplay = this.container.querySelector('#wrong-letters')
    if (wrongLettersDisplay) {
      wrongLettersDisplay.textContent = Array.from(this.wrongLetters).join(' ').toUpperCase()
    }
  }

  private showHint(): void {
    const hintSection = this.container.querySelector('#hint-section')
    if (hintSection) {
      hintSection.classList.add('visible')
    }
  }

  private completeGame(won: boolean): void {
    this.gameCompleted = true
    this.gameWon = won

    if (this.timer) {
      clearInterval(this.timer)
    }

    // Disable inputs
    const input = this.container.querySelector('#letter-input') as HTMLInputElement
    const button = this.container.querySelector('#guess-btn') as HTMLButtonElement
    if (input) input.disabled = true
    if (button) button.disabled = true

    // Show result
    this.showResult(won)

    // Calculate final score
    const score = won ? this.calculateScore() : 0
    const timeSpent = Date.now() - this.startTime

    // Emit complete event
    this.context.eventBus.emit({
      type: 'COMPLETE',
      activityId: this.context.activityId,
      payload: {
        success: won,
        score: score,
        attempts: this.attempts,
        timeSpent: Math.round(timeSpent / 1000),
        word: this.params.word,
        guessedLetters: Array.from(this.guessedLetters),
        wrongLetters: Array.from(this.wrongLetters)
      }
    })
  }

  private calculateScore(): number {
    const maxAttempts = this.params.maxAttempts || 6
    const attemptScore = Math.max(0, (maxAttempts - this.attempts) / maxAttempts)
    
    let timeScore = 1
    if (this.params.timeLimit && this.params.timeLimit > 0) {
      const timeUsed = Date.now() - this.startTime
      timeScore = Math.max(0, 1 - (timeUsed / (this.params.timeLimit * 1000)))
    }
    
    return Math.round((attemptScore * 0.7 + timeScore * 0.3) * 100) / 100
  }

  private showResult(won: boolean): void {
    const resultSection = this.container.querySelector('#result-section')
    const resultTitle = this.container.querySelector('#result-title')
    const resultMessage = this.container.querySelector('#result-message')
    
    if (resultSection && resultTitle && resultMessage) {
      resultSection.className = `result-section visible ${won ? 'result-success' : 'result-failure'}`
      
      if (won) {
        resultTitle.textContent = '🎉 축하합니다!'
        resultMessage.textContent = `단어를 맞추셨습니다! ${this.attempts}번의 시도로 성공했네요.`
      } else {
        resultTitle.textContent = '😔 아쉽네요'
        resultMessage.textContent = `정답은 "${this.params.word}" 였습니다. 다시 도전해보세요!`
      }
    }
  }

  private startTimer(): void {
    if (!this.params.timeLimit) return

    this.timer = window.setInterval(() => {
      this.remainingTime--
      
      const timerElement = this.container.querySelector('#timer')
      if (timerElement) {
        timerElement.textContent = this.formatTime(this.remainingTime)
        
        // Change color when time is running out
        if (this.remainingTime <= 30) {
          timerElement.style.color = '#ef4444'
        } else if (this.remainingTime <= 60) {
          timerElement.style.color = '#f59e0b'
        }
      }

      if (this.remainingTime <= 0) {
        this.completeGame(false)
      }
    }, 1000)
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  private showFeedback(message: string, type: 'success' | 'error' | 'warning'): void {
    // Create temporary feedback element
    const feedback = document.createElement('div')
    feedback.textContent = message
    feedback.className = `feedback feedback-${type}`
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 1000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    `

    // Set colors based on type
    switch (type) {
      case 'success':
        feedback.style.background = 'rgba(34, 197, 94, 0.9)'
        feedback.style.color = 'white'
        break
      case 'error':
        feedback.style.background = 'rgba(239, 68, 68, 0.9)'
        feedback.style.color = 'white'
        break
      case 'warning':
        feedback.style.background = 'rgba(245, 158, 11, 0.9)'
        feedback.style.color = 'white'
        break
    }

    document.body.appendChild(feedback)

    // Animate in
    requestAnimationFrame(() => {
      feedback.style.opacity = '1'
    })

    // Remove after 2 seconds
    setTimeout(() => {
      feedback.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(feedback)
      }, 300)
    }, 2000)
  }

  private restartGame(): void {
    // Reset game state
    this.guessedLetters.clear()
    this.wrongLetters.clear()
    this.attempts = 0
    this.gameCompleted = false
    this.gameWon = false
    this.startTime = Date.now()
    this.remainingTime = this.params.timeLimit || 0

    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    // Re-render
    this.render()
    this.setupEventListeners()

    // Restart timer if needed
    if (this.params.timeLimit && this.params.timeLimit > 0) {
      this.startTimer()
    }

    // Emit restart event
    this.context.eventBus.emit({
      type: 'START',
      activityId: this.context.activityId,
      timestamp: this.startTime
    })
  }

  async unmount(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer)
    }
    // Cleanup is handled by container clearing
  }

  async getResult() {
    return {
      score: this.gameWon ? this.calculateScore() : 0,
      success: this.gameWon,
      durationMs: Date.now() - this.startTime,
      attempts: this.attempts,
      details: {
        word: this.params.word,
        guessedLetters: Array.from(this.guessedLetters),
        wrongLetters: Array.from(this.wrongLetters),
        hintsUsed: this.attempts >= (this.params.showHintAfter || 3) ? 1 : 0
      }
    }
  }
}