import type { ActivityManifest, ActivityParam, ActivityContext, ActivityResult } from '../../types/activity'
import { BaseActivityTemplate } from '../base/activity-template'

interface VideoParams {
  src: string
  autoplay?: boolean
  controls?: boolean
  muted?: boolean
  poster?: string
  subtitles?: {
    src: string
    label: string
    lang: string
  }[]
}

export class VideoActivityTemplate extends BaseActivityTemplate {
  manifest: ActivityManifest = {
    id: 'video@2.0.0',
    name: 'Video Player Activity',
    version: '2.0.0',
    category: 'media',
    capabilities: ['video', 'audio', 'controls', 'subtitles', 'fullscreen'],
    paramsSchema: {
      type: 'object',
      properties: {
        src: { 
          type: 'string', 
          description: 'Video source URL',
          pattern: '^https?://.*\\.(mp4|webm|ogg)$'
        },
        autoplay: { 
          type: 'boolean', 
          default: false,
          description: 'Auto-play video on load'
        },
        controls: { 
          type: 'boolean', 
          default: true,
          description: 'Show video controls'
        },
        muted: { 
          type: 'boolean', 
          default: false,
          description: 'Mute video by default'
        },
        poster: { 
          type: 'string',
          description: 'Poster image URL'
        },
        subtitles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              src: { type: 'string' },
              label: { type: 'string' },
              lang: { type: 'string' }
            }
          }
        }
      },
      required: ['src']
    },
    i18n: {
      supported: ['ko', 'en', 'ja', 'zh'],
      defaultLocale: 'ko'
    },
    accessibility: {
      keyboardNavigation: true,
      screenReader: true,
      highContrast: true
    },
    performance: {
      maxLoadTimeMs: 5000,
      maxMemoryMB: 100
    },
    security: {
      allowedDomains: ['cdn.jsdelivr.net', 'interactive-examples.mdn.mozilla.net'],
      maxApiCalls: 0,
      requiresAuth: false
    }
  }

  private videoElement: HTMLVideoElement | null = null
  private progressTracker: number | null = null
  private watchedSegments: { start: number; end: number }[] = []
  private totalWatchTime = 0

  async mount(container: HTMLElement, params: ActivityParam, context: ActivityContext): Promise<void> {
    this.initialize(container, params, context)
    
    const videoParams = params as VideoParams
    
    // 비디오 컨테이너 생성
    const videoContainer = this.createElement('div', 'video-activity-container')
    videoContainer.innerHTML = `
      <div class="video-wrapper">
        <video 
          class="activity-video"
          ${videoParams.controls !== false ? 'controls' : ''}
          ${videoParams.muted ? 'muted' : ''}
          ${videoParams.poster ? `poster="${videoParams.poster}"` : ''}
          preload="metadata"
        >
          <source src="${videoParams.src}" type="video/mp4">
          <p class="video-error">
            브라우저가 이 비디오 형식을 지원하지 않습니다.
          </p>
        </video>
        
        <!-- 커스텀 컨트롤 오버레이 -->
        <div class="video-overlay" style="display: none;">
          <button class="play-pause-btn" aria-label="재생/일시정지">
            <span class="play-icon">▶</span>
            <span class="pause-icon" style="display: none;">⏸</span>
          </button>
        </div>
        
        <!-- 진행률 표시 -->
        <div class="video-progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="time-display">
            <span class="current-time">00:00</span>
            <span class="separator">/</span>
            <span class="duration">00:00</span>
          </div>
        </div>
      </div>
      
      <!-- 상태 메시지 -->
      <div class="video-status">
        <p class="status-message">동영상을 시청하세요.</p>
      </div>
    `

    container.appendChild(videoContainer)
    
    // 비디오 엘리먼트 참조
    this.videoElement = container.querySelector('.activity-video') as HTMLVideoElement
    
    // 이벤트 리스너 설정
    this.setupVideoEvents()
    
    // 자막 설정
    if (videoParams.subtitles) {
      this.setupSubtitles(videoParams.subtitles)
    }
    
    // 반응형 레이아웃 설정
    this.setupResponsiveLayout()
    
    // 자동재생 처리
    if (videoParams.autoplay) {
      this.attemptAutoplay()
    }

    this.status.state = 'ready'
    this.log('START')
  }

  private setupVideoEvents(): void {
    if (!this.videoElement) return

    // 로딩 이벤트
    this.videoElement.addEventListener('loadedmetadata', () => {
      this.updateTimeDisplay()
      this.announceToScreenReader(`비디오 로드됨. 재생 시간: ${this.formatTime(this.videoElement!.duration)}`)
    })

    this.videoElement.addEventListener('canplay', () => {
      this.status.state = 'ready'
      this.updateStatusMessage('비디오 준비됨')
    })

    // 재생 이벤트
    this.videoElement.addEventListener('play', () => {
      this.status.state = 'active'
      this.startProgressTracking()
      this.updateStatusMessage('재생 중...')
      this.log('PROGRESS', { event: 'play', currentTime: this.videoElement!.currentTime })
    })

    this.videoElement.addEventListener('pause', () => {
      this.stopProgressTracking()
      this.updateStatusMessage('일시정지됨')
      this.log('PROGRESS', { event: 'pause', currentTime: this.videoElement!.currentTime })
    })

    // 진행률 이벤트
    this.videoElement.addEventListener('timeupdate', () => {
      this.updateProgress()
      this.updateTimeDisplay()
      this.trackWatchTime()
    })

    // 완료 이벤트
    this.videoElement.addEventListener('ended', () => {
      this.status.state = 'completed'
      this.stopProgressTracking()
      this.updateStatusMessage('시청 완료!')
      this.finalize()
    })

    // 에러 처리
    this.videoElement.addEventListener('error', (event) => {
      this.status.state = 'error'
      this.incrementErrors()
      this.updateStatusMessage('비디오 로드 실패')
      console.error('Video error:', event)
    })

    // 키보드 컨트롤
    this.videoElement.addEventListener('keydown', (event) => {
      this.handleKeyboardControls(event as KeyboardEvent)
    })
  }

  private setupSubtitles(subtitles: NonNullable<VideoParams['subtitles']>): void {
    if (!this.videoElement) return

    subtitles.forEach(subtitle => {
      const track = document.createElement('track')
      track.kind = 'subtitles'
      track.src = subtitle.src
      track.srclang = subtitle.lang
      track.label = subtitle.label
      track.default = subtitle.lang === this.context?.locale
      
      this.videoElement!.appendChild(track)
    })
  }

  private async attemptAutoplay(): Promise<void> {
    if (!this.videoElement) return

    try {
      await this.videoElement.play()
    } catch (error) {
      console.warn('Autoplay failed:', error)
      this.updateStatusMessage('자동재생이 차단되었습니다. 재생 버튼을 클릭하세요.')
      this.showCustomControls()
    }
  }

  private showCustomControls(): void {
    const overlay = this.querySelector('.video-overlay') as HTMLElement
    if (overlay) {
      overlay.style.display = 'flex'
      
      const playBtn = this.querySelector('.play-pause-btn') as HTMLButtonElement
      playBtn?.addEventListener('click', () => {
        this.togglePlayPause()
      })
    }
  }

  private togglePlayPause(): void {
    if (!this.videoElement) return

    if (this.videoElement.paused) {
      this.videoElement.play()
    } else {
      this.videoElement.pause()
    }
  }

  private startProgressTracking(): void {
    this.progressTracker = window.setInterval(() => {
      this.incrementInteractions()
    }, 1000)
  }

  private stopProgressTracking(): void {
    if (this.progressTracker) {
      clearInterval(this.progressTracker)
      this.progressTracker = null
    }
  }

  private updateProgress(): void {
    if (!this.videoElement) return

    const progress = this.videoElement.currentTime / this.videoElement.duration
    this.updateProgress(progress)

    // 진행률 바 업데이트
    const progressFill = this.querySelector('.progress-fill') as HTMLElement
    if (progressFill) {
      progressFill.style.width = `${progress * 100}%`
    }
  }

  private updateTimeDisplay(): void {
    if (!this.videoElement) return

    const currentTime = this.querySelector('.current-time')
    const duration = this.querySelector('.duration')
    
    if (currentTime) {
      currentTime.textContent = this.formatTime(this.videoElement.currentTime)
    }
    
    if (duration && this.videoElement.duration) {
      duration.textContent = this.formatTime(this.videoElement.duration)
    }
  }

  private trackWatchTime(): void {
    if (!this.videoElement) return

    const currentTime = this.videoElement.currentTime
    const lastSegment = this.watchedSegments[this.watchedSegments.length - 1]
    
    if (!lastSegment || currentTime > lastSegment.end + 2) {
      // 새로운 시청 구간 시작
      this.watchedSegments.push({ start: currentTime, end: currentTime })
    } else {
      // 기존 구간 확장
      lastSegment.end = Math.max(lastSegment.end, currentTime)
    }

    // 총 시청 시간 계산
    this.totalWatchTime = this.watchedSegments.reduce((total, segment) => {
      return total + (segment.end - segment.start)
    }, 0)
  }

  private updateStatusMessage(message: string): void {
    const statusEl = this.querySelector('.status-message')
    if (statusEl) {
      statusEl.textContent = message
    }
  }

  private handleKeyboardControls(event: KeyboardEvent): void {
    if (!this.videoElement) return

    switch (event.key) {
      case ' ':
        event.preventDefault()
        this.togglePlayPause()
        break
      case 'ArrowLeft':
        event.preventDefault()
        this.videoElement.currentTime -= 5
        break
      case 'ArrowRight':
        event.preventDefault()
        this.videoElement.currentTime += 5
        break
      case 'f':
        event.preventDefault()
        this.toggleFullscreen()
        break
    }
  }

  private async toggleFullscreen(): Promise<void> {
    if (!this.videoElement) return

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await this.videoElement.requestFullscreen()
      }
    } catch (error) {
      console.warn('Fullscreen toggle failed:', error)
    }
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  async showHint(level: number): Promise<void> {
    const hints = [
      '재생 버튼을 클릭하여 비디오를 시작하세요.',
      '스페이스바로 재생/일시정지할 수 있습니다.',
      '방향키로 5초씩 이동할 수 있습니다.',
      'F키로 전체화면을 토글할 수 있습니다.'
    ]
    
    const hint = hints[Math.min(level - 1, hints.length - 1)]
    this.showMessage(hint, 'info')
    this.announceToScreenReader(hint)
  }

  async restart(): Promise<void> {
    if (this.videoElement) {
      this.videoElement.currentTime = 0
      this.watchedSegments = []
      this.totalWatchTime = 0
    }
    await super.restart()
  }

  async unmount(): Promise<void> {
    this.stopProgressTracking()
    
    if (this.videoElement) {
      this.videoElement.pause()
      this.videoElement.src = ''
    }
    
    this.cleanup()
  }

  async getResult(): Promise<ActivityResult> {
    const duration = this.videoElement?.duration || 0
    const watchPercent = duration > 0 ? this.totalWatchTime / duration : 0
    
    // 80% 이상 시청시 완료로 간주
    const score = Math.min(watchPercent / 0.8, 1)
    
    return {
      score,
      durationMs: Date.now() - this.startTime,
      details: {
        watchedTime: this.totalWatchTime,
        totalDuration: duration,
        watchPercent,
        watchedSegments: this.watchedSegments,
        interactions: this.status.interactions,
        completed: this.status.state === 'completed'
      }
    }
  }
}

// 템플릿 등록을 위한 팩토리 함수
export default function createVideoTemplate(): VideoActivityTemplate {
  return new VideoActivityTemplate()
}