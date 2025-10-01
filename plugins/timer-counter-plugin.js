/**
 * 타이머 카운터 플러그인
 * 간단한 교육용 타이머 및 카운터 활동
 * 
 * @author Plugin Developer
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    console.log('🕐 Timer Counter 플러그인 로딩 중...');
    
    // 플러그인 정의
    const TimerCounterPlugin = {
        name: 'timer-counter',
        version: '1.0.0',
        description: '교육용 타이머 및 카운터 활동',
        author: '외부 플러그인 개발자',
        
        /**
         * 기본 매개변수 반환
         */
        getDefaultParams() {
            return {
                title: '⏱️ 타이머 카운터',
                instruction: '시간을 측정하고 숫자를 세어보세요!',
                initialTime: 60,  // 초 단위
                mode: 'countdown', // countdown, countup, counter
                allowReset: true,
                showMilliseconds: false,
                backgroundColor: '#2d3748',
                textColor: '#ffffff',
                accentColor: '#4299e1',
                target: 10, // 카운터 모드에서 목표 숫자
                step: 1     // 카운터 증가 단위
            };
        },
        
        /**
         * 활동 렌더링 함수
         * @param {Object} activity - 활동 데이터
         * @param {HTMLElement} container - 렌더링할 컨테이너
         */
        async render(activity, container) {
            console.log('🕐 Timer Counter 렌더링 시작:', activity);
            
            const params = { ...this.getDefaultParams(), ...activity.params };
            
            // 스타일 주입
            this.injectStyles();
            
            // HTML 생성
            container.innerHTML = this.generateHTML(params);
            
            // 기능 초기화
            this.initializeTimer(container, params);
            
            console.log('✅ Timer Counter 렌더링 완료');
        },
        
        /**
         * CSS 스타일 주입
         */
        injectStyles() {
            if (document.getElementById('timer-counter-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'timer-counter-styles';
            style.textContent = `
                .timer-counter-container {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    padding: 3rem;
                    text-align: center;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    margin: 2rem 0;
                    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
                }
                
                .timer-counter-title {
                    font-size: 2rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                
                .timer-counter-instruction {
                    font-size: 1.1rem;
                    opacity: 0.9;
                    margin-bottom: 2rem;
                }
                
                .timer-counter-display {
                    font-size: 5rem;
                    font-weight: bold;
                    font-family: 'Courier New', monospace;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 2rem;
                    margin: 2rem 0;
                    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease;
                }
                
                .timer-counter-display.pulse {
                    animation: pulse 1s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                .timer-counter-controls {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin: 2rem 0;
                    flex-wrap: wrap;
                }
                
                .timer-counter-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    padding: 1rem 2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                    min-width: 120px;
                }
                
                .timer-counter-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                }
                
                .timer-counter-btn:active {
                    transform: translateY(0);
                }
                
                .timer-counter-btn.primary {
                    background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
                    border-color: #3182ce;
                }
                
                .timer-counter-btn.success {
                    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                    border-color: #38a169;
                }
                
                .timer-counter-btn.danger {
                    background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
                    border-color: #e53e3e;
                }
                
                .timer-counter-mode {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                }
                
                .timer-counter-mode-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    color: white;
                    font-size: 0.9rem;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .timer-counter-mode-btn.active {
                    background: rgba(255, 255, 255, 0.3);
                    border-color: rgba(255, 255, 255, 0.5);
                }
                
                .timer-counter-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-top: 2rem;
                }
                
                .timer-counter-stat {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 1rem;
                    backdrop-filter: blur(10px);
                }
                
                .timer-counter-stat-value {
                    font-size: 2rem;
                    font-weight: bold;
                    display: block;
                }
                
                .timer-counter-stat-label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }
                
                .timer-counter-result {
                    background: rgba(72, 187, 120, 0.2);
                    border: 2px solid rgba(72, 187, 120, 0.5);
                    border-radius: 10px;
                    padding: 1rem;
                    margin-top: 1rem;
                    font-size: 1.2rem;
                    font-weight: 600;
                }
                
                .timer-counter-result.warning {
                    background: rgba(237, 137, 54, 0.2);
                    border-color: rgba(237, 137, 54, 0.5);
                }
            `;
            document.head.appendChild(style);
        },
        
        /**
         * HTML 생성
         */
        generateHTML(params) {
            return `
                <div class="timer-counter-container">
                    <h2 class="timer-counter-title">${params.title}</h2>
                    <p class="timer-counter-instruction">${params.instruction}</p>
                    
                    <div class="timer-counter-mode">
                        <button class="timer-counter-mode-btn active" data-mode="countdown">⏰ 카운트다운</button>
                        <button class="timer-counter-mode-btn" data-mode="countup">⏱️ 스톱워치</button>
                        <button class="timer-counter-mode-btn" data-mode="counter">🔢 카운터</button>
                    </div>
                    
                    <div class="timer-counter-display" id="timer-display">
                        ${this.formatTime(params.initialTime)}
                    </div>
                    
                    <div class="timer-counter-controls">
                        <button class="timer-counter-btn primary" id="start-btn">▶️ 시작</button>
                        <button class="timer-counter-btn" id="pause-btn" style="display: none;">⏸️ 일시정지</button>
                        <button class="timer-counter-btn" id="stop-btn">⏹️ 정지</button>
                        ${params.allowReset ? '<button class="timer-counter-btn" id="reset-btn">🔄 리셋</button>' : ''}
                        
                        <button class="timer-counter-btn success" id="plus-btn" style="display: none;">➕ 증가</button>
                        <button class="timer-counter-btn danger" id="minus-btn" style="display: none;">➖ 감소</button>
                    </div>
                    
                    <div class="timer-counter-stats">
                        <div class="timer-counter-stat">
                            <span class="timer-counter-stat-value" id="elapsed-time">0</span>
                            <span class="timer-counter-stat-label">경과 시간</span>
                        </div>
                        <div class="timer-counter-stat">
                            <span class="timer-counter-stat-value" id="current-count">0</span>
                            <span class="timer-counter-stat-label">현재 카운트</span>
                        </div>
                        <div class="timer-counter-stat">
                            <span class="timer-counter-stat-value" id="target-display">${params.target}</span>
                            <span class="timer-counter-stat-label">목표</span>
                        </div>
                    </div>
                    
                    <div id="timer-result" class="timer-counter-result" style="display: none;">
                        완료되었습니다! 🎉
                    </div>
                </div>
            `;
        },
        
        /**
         * 타이머 초기화 및 이벤트 연결
         */
        initializeTimer(container, params) {
            let currentMode = 'countdown';
            let isRunning = false;
            let currentTime = params.initialTime;
            let startTime = 0;
            let elapsedTime = 0;
            let currentCount = 0;
            let interval;
            
            // DOM 요소들
            const display = container.querySelector('#timer-display');
            const startBtn = container.querySelector('#start-btn');
            const pauseBtn = container.querySelector('#pause-btn');
            const stopBtn = container.querySelector('#stop-btn');
            const resetBtn = container.querySelector('#reset-btn');
            const plusBtn = container.querySelector('#plus-btn');
            const minusBtn = container.querySelector('#minus-btn');
            const elapsedDisplay = container.querySelector('#elapsed-time');
            const countDisplay = container.querySelector('#current-count');
            const result = container.querySelector('#timer-result');
            
            // 모드 버튼들
            const modeButtons = container.querySelectorAll('.timer-counter-mode-btn');
            
            // 모드 변경
            modeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    currentMode = btn.dataset.mode;
                    
                    // 활성 버튼 표시
                    modeButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // UI 업데이트
                    this.updateModeUI(currentMode, {
                        startBtn, pauseBtn, stopBtn, plusBtn, minusBtn, display
                    }, params);
                    
                    // 상태 리셋
                    this.resetTimer();
                });
            });
            
            // 시작/일시정지
            startBtn.addEventListener('click', () => {
                if (currentMode === 'counter') return;
                
                isRunning = true;
                startTime = Date.now() - elapsedTime;
                
                interval = setInterval(() => {
                    elapsedTime = Date.now() - startTime;
                    
                    if (currentMode === 'countdown') {
                        currentTime = Math.max(0, params.initialTime - Math.floor(elapsedTime / 1000));
                        display.textContent = this.formatTime(currentTime);
                        
                        if (currentTime <= 0) {
                            this.completeTimer(true);
                        }
                    } else if (currentMode === 'countup') {
                        display.textContent = this.formatTime(Math.floor(elapsedTime / 1000));
                    }
                    
                    elapsedDisplay.textContent = this.formatTime(Math.floor(elapsedTime / 1000));
                }, 100);
                
                startBtn.style.display = 'none';
                pauseBtn.style.display = 'inline-block';
            });
            
            pauseBtn.addEventListener('click', () => {
                isRunning = false;
                clearInterval(interval);
                
                startBtn.style.display = 'inline-block';
                pauseBtn.style.display = 'none';
            });
            
            // 정지
            stopBtn.addEventListener('click', () => {
                this.completeTimer(false);
            });
            
            // 리셋
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    this.resetTimer();
                });
            }
            
            // 카운터 버튼들
            if (plusBtn) {
                plusBtn.addEventListener('click', () => {
                    if (currentMode !== 'counter') return;
                    
                    currentCount += params.step;
                    countDisplay.textContent = currentCount;
                    display.textContent = currentCount.toString();
                    
                    if (currentCount >= params.target) {
                        this.completeTimer(true);
                    }
                });
            }
            
            if (minusBtn) {
                minusBtn.addEventListener('click', () => {
                    if (currentMode !== 'counter') return;
                    
                    currentCount = Math.max(0, currentCount - params.step);
                    countDisplay.textContent = currentCount;
                    display.textContent = currentCount.toString();
                });
            }
            
            // 완료 처리
            this.completeTimer = (success) => {
                isRunning = false;
                clearInterval(interval);
                
                display.classList.add('pulse');
                
                if (success) {
                    result.textContent = currentMode === 'countdown' 
                        ? '⏰ 시간 완료! 수고하셨습니다!' 
                        : currentMode === 'counter'
                        ? `🎯 목표 달성! ${params.target}에 도달했습니다!`
                        : '⏱️ 측정 완료!';
                    result.className = 'timer-counter-result';
                } else {
                    result.textContent = '⏹️ 활동이 중단되었습니다.';
                    result.className = 'timer-counter-result warning';
                }
                
                result.style.display = 'block';
                startBtn.style.display = 'inline-block';
                pauseBtn.style.display = 'none';
                
                // 결과 저장 (전역 results 배열이 있는 경우)
                if (typeof window !== 'undefined' && window.results && window.currentActivity !== undefined) {
                    window.results[window.currentActivity] = {
                        type: 'timer-counter',
                        mode: currentMode,
                        elapsedTime: Math.floor(elapsedTime / 1000),
                        finalCount: currentCount,
                        success: success,
                        completedAt: new Date().toISOString()
                    };
                }
            };
            
            // 리셋 처리
            this.resetTimer = () => {
                isRunning = false;
                clearInterval(interval);
                
                currentTime = params.initialTime;
                elapsedTime = 0;
                currentCount = 0;
                
                display.classList.remove('pulse');
                display.textContent = currentMode === 'counter' 
                    ? '0' 
                    : this.formatTime(params.initialTime);
                
                elapsedDisplay.textContent = '0';
                countDisplay.textContent = '0';
                result.style.display = 'none';
                
                startBtn.style.display = 'inline-block';
                pauseBtn.style.display = 'none';
            };
            
            // 초기 UI 설정
            this.updateModeUI(currentMode, {
                startBtn, pauseBtn, stopBtn, plusBtn, minusBtn, display
            }, params);
        },
        
        /**
         * 모드별 UI 업데이트
         */
        updateModeUI(mode, elements, params) {
            const { startBtn, pauseBtn, stopBtn, plusBtn, minusBtn, display } = elements;
            
            if (mode === 'counter') {
                startBtn.style.display = 'none';
                pauseBtn.style.display = 'none';
                plusBtn.style.display = 'inline-block';
                minusBtn.style.display = 'inline-block';
                display.textContent = '0';
            } else {
                startBtn.style.display = 'inline-block';
                pauseBtn.style.display = 'none';
                plusBtn.style.display = 'none';
                minusBtn.style.display = 'none';
                display.textContent = this.formatTime(params.initialTime);
            }
        },
        
        /**
         * 시간 포맷팅
         */
        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },
        
        /**
         * 에디터 설정 (레슨 빌더용)
         */
        getEditorConfig() {
            return {
                fields: [
                    { name: 'title', type: 'text', label: '제목', required: true },
                    { name: 'instruction', type: 'textarea', label: '설명' },
                    { name: 'initialTime', type: 'number', label: '초기 시간(초)', min: 10, max: 3600 },
                    { name: 'mode', type: 'select', label: '기본 모드', 
                      options: [
                          { value: 'countdown', label: '카운트다운' },
                          { value: 'countup', label: '스톱워치' },
                          { value: 'counter', label: '카운터' }
                      ]
                    },
                    { name: 'target', type: 'number', label: '목표 숫자', min: 1, max: 100 },
                    { name: 'allowReset', type: 'checkbox', label: '리셋 버튼 표시' }
                ]
            };
        }
    };
    
    // 플러그인 자동 등록
    if (typeof window !== 'undefined' && window.registerEduPlugin) {
        console.log('🔌 Timer Counter 플러그인 자동 등록 중...');
        window.registerEduPlugin('timer-counter', '1.0.0', TimerCounterPlugin);
        console.log('✅ Timer Counter 플러그인 등록 완료!');
    } else {
        console.warn('⚠️ 플러그인 시스템을 찾을 수 없습니다. 수동 등록 준비됨.');
        window.TimerCounterPlugin = TimerCounterPlugin;
    }
    
    console.log('🕐 Timer Counter 플러그인 로드 완료!');
    
})();