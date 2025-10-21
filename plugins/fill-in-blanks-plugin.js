/**
 * Fill in the Blanks Activity Plugin
 * 빈칸 채우기 액티비티 플러그인
 * 
 * @author UnimationKorea AI Team
 * @version 1.0.0
 * @license MIT
 */

(function() {
    'use strict';
    
    const FillInTheBlanksPlugin = {
        // 메타데이터
        name: 'fill-in-blanks',
        version: '1.0.0',
        description: '문장의 빈칸을 채우는 인터랙티브 액티비티',
        author: 'UnimationKorea AI Team',
        homepage: 'https://github.com/UnimationKorea/core_plugin',
        
        /**
         * 기본 매개변수 반환
         */
        getDefaultParams() {
            return {
                title: '빈칸 채우기',
                sentence: '고양이가 {blank}를 쫓아간다.',
                blanks: [
                    { id: 'blank-1', position: '{blank}', answer: '쥐', alternatives: ['쥐', '생쥐'] }
                ],
                caseSensitive: false,
                showHints: true,
                hints: ['작은 동물', '치즈를 좋아함'],
                timeLimit: 0, // 0 = 무제한
                feedback: {
                    correct: '정답입니다! 🎉',
                    incorrect: '다시 시도해보세요. 💭',
                    timeout: '시간이 종료되었습니다! ⏰',
                    complete: '모든 빈칸을 완성했습니다! 🌟'
                },
                allowMultipleAttempts: true,
                showProgressBar: true,
                autoCheckOnComplete: false
            };
        },
        
        /**
         * 파라미터 검증
         */
        validate(params) {
            if (!params.sentence || typeof params.sentence !== 'string') {
                console.error('❌ sentence 필드가 필요합니다.');
                return false;
            }
            
            if (!Array.isArray(params.blanks) || params.blanks.length === 0) {
                console.error('❌ blanks 배열이 필요합니다.');
                return false;
            }
            
            // 각 빈칸 검증
            for (const blank of params.blanks) {
                if (!blank.answer || typeof blank.answer !== 'string') {
                    console.error('❌ 빈칸에 answer가 필요합니다:', blank);
                    return false;
                }
                
                if (!blank.position || !params.sentence.includes(blank.position)) {
                    console.error('❌ sentence에 position이 존재하지 않습니다:', blank.position);
                    return false;
                }
            }
            
            return true;
        },
        
        /**
         * 액티비티 렌더링
         */
        async render(activity, container) {
            const params = { ...this.getDefaultParams(), ...activity.params };
            
            // 파라미터 검증
            if (!this.validate(params)) {
                container.innerHTML = `
                    <div style="padding: 2rem; background: #fff5f5; border: 2px solid #fc8181; border-radius: 8px; color: #c53030;">
                        <h3>❌ 플러그인 오류</h3>
                        <p>파라미터 검증에 실패했습니다. 콘솔을 확인하세요.</p>
                    </div>
                `;
                return;
            }
            
            // 스타일 주입
            this.injectStyles();
            
            // 상태 초기화
            this.state = {
                activityId: activity.activityId,
                params: params,
                startTime: Date.now(),
                attempts: 0,
                correctCount: 0,
                timerInterval: null,
                remainingTime: params.timeLimit,
                completed: false,
                userAnswers: {}
            };
            
            // HTML 생성
            container.innerHTML = this.generateHTML(params);
            
            // 이벤트 바인딩
            this.setupEventListeners(container, params);
            
            // 타이머 시작
            if (params.timeLimit > 0) {
                this.startTimer(container, params.timeLimit);
            }
            
            // 시작 이벤트 발생
            this.emitEvent('activity:started', {
                activityId: activity.activityId,
                timestamp: Date.now()
            });
            
            console.log('✅ Fill in the Blanks 플러그인 렌더링 완료');
        },
        
        /**
         * HTML 생성
         */
        generateHTML(params) {
            const blanksCount = params.blanks.length;
            let sentence = params.sentence;
            
            // 빈칸을 입력 필드로 변환
            params.blanks.forEach((blank, index) => {
                const input = `<input 
                    type="text" 
                    class="blank-input" 
                    id="blank-${index}" 
                    data-index="${index}"
                    data-answer="${this.escapeHtml(blank.answer)}"
                    data-alternatives="${blank.alternatives ? this.escapeHtml(JSON.stringify(blank.alternatives)) : '[]'}"
                    placeholder="?"
                    autocomplete="off"
                    spellcheck="false"
                />`;
                sentence = sentence.replace(blank.position, input);
            });
            
            return `
                <div class="fill-in-blanks-container" id="fill-in-blanks-root">
                    <!-- Header -->
                    <div class="activity-header">
                        <div class="header-left">
                            <h2 class="activity-title">✏️ ${this.escapeHtml(params.title)}</h2>
                            <div class="activity-stats">
                                <span class="stat-item">📝 빈칸: ${blanksCount}개</span>
                                ${params.timeLimit > 0 ? `<span class="stat-item">⏱️ 제한: ${params.timeLimit}초</span>` : ''}
                            </div>
                        </div>
                        ${params.timeLimit > 0 ? `
                            <div class="timer-display" id="timer-display">
                                <div class="timer-icon">⏰</div>
                                <div class="timer-value" id="timer-value">${params.timeLimit}</div>
                                <div class="timer-label">초</div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Sentence Container -->
                    <div class="sentence-container">
                        <div class="sentence">${sentence}</div>
                    </div>
                    
                    <!-- Hints Section -->
                    ${params.showHints && params.hints && params.hints.length > 0 ? `
                        <div class="hints-section">
                            <button class="hint-button" id="show-hints-btn">
                                💡 힌트 보기
                            </button>
                            <div class="hints-list" id="hints-list" style="display: none;">
                                <h4>💭 힌트</h4>
                                <ul>
                                    ${params.hints.map(hint => `<li>${this.escapeHtml(hint)}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Actions -->
                    <div class="actions">
                        <button class="btn btn-primary" id="check-answer-btn">
                            <span class="btn-icon">✓</span>
                            <span>정답 확인</span>
                        </button>
                        <button class="btn btn-secondary" id="reset-activity-btn">
                            <span class="btn-icon">↻</span>
                            <span>다시 하기</span>
                        </button>
                    </div>
                    
                    <!-- Feedback -->
                    <div class="feedback" id="feedback" style="display: none;"></div>
                    
                    <!-- Progress Bar -->
                    ${params.showProgressBar ? `
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>진행률</span>
                                <span id="progress-text">0 / ${blanksCount}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Debug Info (개발용) -->
                    <div class="debug-info" style="display: none;">
                        <h5>디버그 정보</h5>
                        <pre id="debug-output"></pre>
                    </div>
                </div>
            `;
        },
        
        /**
         * CSS 스타일 주입
         */
        injectStyles() {
            if (document.getElementById('fill-in-blanks-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'fill-in-blanks-styles';
            style.textContent = `
                .fill-in-blanks-container {
                    max-width: 900px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                
                /* Header */
                .activity-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                    gap: 1rem;
                }
                
                .header-left {
                    flex: 1;
                }
                
                .activity-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0 0 0.5rem 0;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                
                .activity-stats {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                
                .stat-item {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 0.4rem 0.8rem;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    backdrop-filter: blur(10px);
                }
                
                /* Timer */
                .timer-display {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.95);
                    padding: 1rem 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .timer-icon {
                    font-size: 1.5rem;
                }
                
                .timer-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #667eea;
                    min-width: 60px;
                    text-align: center;
                }
                
                .timer-value.warning {
                    color: #f59e0b;
                    animation: pulse 1s infinite;
                }
                
                .timer-value.danger {
                    color: #ef4444;
                    animation: pulse 0.5s infinite;
                }
                
                .timer-label {
                    color: #4a5568;
                    font-size: 0.9rem;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                
                /* Sentence Container */
                .sentence-container {
                    background: rgba(255, 255, 255, 0.95);
                    padding: 2.5rem;
                    border-radius: 16px;
                    margin-bottom: 2rem;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                }
                
                .sentence {
                    font-size: 1.5rem;
                    line-height: 2.5;
                    color: #2d3748;
                    text-align: center;
                    margin: 0;
                    word-wrap: break-word;
                }
                
                /* Blank Input */
                .blank-input {
                    display: inline-block;
                    min-width: 120px;
                    padding: 0.6rem 1rem;
                    font-size: 1.25rem;
                    text-align: center;
                    border: 3px solid #667eea;
                    border-radius: 10px;
                    background: white;
                    transition: all 0.3s ease;
                    margin: 0 0.3rem;
                    font-weight: 600;
                    color: #2d3748;
                    outline: none;
                }
                
                .blank-input:focus {
                    border-color: #764ba2;
                    box-shadow: 0 0 0 4px rgba(118, 75, 162, 0.2);
                    transform: scale(1.05);
                }
                
                .blank-input:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                .blank-input.correct {
                    border-color: #10b981;
                    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
                    color: #065f46;
                }
                
                .blank-input.incorrect {
                    border-color: #ef4444;
                    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                    color: #991b1b;
                    animation: shake 0.5s;
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }
                
                /* Hints Section */
                .hints-section {
                    margin-bottom: 2rem;
                    text-align: center;
                }
                
                .hint-button {
                    background: rgba(255, 255, 255, 0.2);
                    border: 2px solid rgba(255, 255, 255, 0.4);
                    color: white;
                    padding: 0.8rem 1.5rem;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }
                
                .hint-button:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                
                .hints-list {
                    background: rgba(255, 255, 255, 0.15);
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-top: 1rem;
                    backdrop-filter: blur(10px);
                    text-align: left;
                }
                
                .hints-list h4 {
                    margin: 0 0 1rem 0;
                    font-size: 1.1rem;
                }
                
                .hints-list ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .hints-list li {
                    padding: 0.6rem 0;
                    margin: 0.3rem 0;
                    padding-left: 1.5rem;
                    position: relative;
                }
                
                .hints-list li:before {
                    content: "💡";
                    position: absolute;
                    left: 0;
                }
                
                /* Actions */
                .actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }
                
                .btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem 2rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                
                .btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
                }
                
                .btn:active {
                    transform: translateY(-1px);
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                }
                
                .btn-primary:hover {
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                }
                
                .btn-secondary {
                    background: rgba(255, 255, 255, 0.25);
                    color: white;
                    border: 2px solid rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(10px);
                }
                
                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.35);
                }
                
                .btn-icon {
                    font-size: 1.3rem;
                }
                
                /* Feedback */
                .feedback {
                    text-align: center;
                    padding: 1.5rem;
                    border-radius: 12px;
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    animation: slideIn 0.3s ease;
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .feedback.success {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
                }
                
                .feedback.error {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                }
                
                .feedback.info {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                }
                
                /* Progress */
                .progress-container {
                    background: rgba(255, 255, 255, 0.15);
                    padding: 1rem;
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                }
                
                .progress-label {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                
                .progress-bar {
                    height: 12px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 6px;
                    overflow: hidden;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #059669);
                    transition: width 0.5s ease;
                    border-radius: 6px;
                }
                
                /* Debug */
                .debug-info {
                    margin-top: 2rem;
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                    font-size: 0.8rem;
                }
                
                .debug-info pre {
                    margin: 0;
                    white-space: pre-wrap;
                    word-break: break-all;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .fill-in-blanks-container {
                        padding: 1.5rem;
                        margin: 1rem;
                        border-radius: 16px;
                    }
                    
                    .activity-header {
                        flex-direction: column;
                    }
                    
                    .activity-title {
                        font-size: 1.5rem;
                    }
                    
                    .timer-display {
                        align-self: stretch;
                        justify-content: center;
                    }
                    
                    .sentence-container {
                        padding: 1.5rem;
                    }
                    
                    .sentence {
                        font-size: 1.25rem;
                        line-height: 2;
                    }
                    
                    .blank-input {
                        min-width: 100px;
                        font-size: 1.1rem;
                        margin: 0.2rem;
                    }
                    
                    .actions {
                        flex-direction: column;
                    }
                    
                    .btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `;
            
            document.head.appendChild(style);
        },
        
        /**
         * 이벤트 리스너 설정
         */
        setupEventListeners(container, params) {
            const checkBtn = container.querySelector('#check-answer-btn');
            const resetBtn = container.querySelector('#reset-activity-btn');
            const hintBtn = container.querySelector('#show-hints-btn');
            const inputs = container.querySelectorAll('.blank-input');
            
            // 정답 확인
            if (checkBtn) {
                checkBtn.addEventListener('click', () => {
                    this.checkAnswers(container, params);
                });
            }
            
            // 다시 하기
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    this.resetActivity(container, params);
                });
            }
            
            // 힌트 토글
            if (hintBtn) {
                hintBtn.addEventListener('click', () => {
                    const hintsList = container.querySelector('#hints-list');
                    if (hintsList) {
                        const isVisible = hintsList.style.display !== 'none';
                        hintsList.style.display = isVisible ? 'none' : 'block';
                        hintBtn.textContent = isVisible ? '💡 힌트 보기' : '🔒 힌트 숨기기';
                    }
                });
            }
            
            // Enter 키로 확인
            inputs.forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.checkAnswers(container, params);
                    }
                });
                
                // 입력 시 자동 체크 (옵션)
                if (params.autoCheckOnComplete) {
                    input.addEventListener('input', () => {
                        const allFilled = Array.from(inputs).every(inp => inp.value.trim() !== '');
                        if (allFilled) {
                            setTimeout(() => this.checkAnswers(container, params), 500);
                        }
                    });
                }
            });
        },
        
        /**
         * 정답 확인
         */
        checkAnswers(container, params) {
            const inputs = container.querySelectorAll('.blank-input');
            let allCorrect = true;
            let correctCount = 0;
            const totalCount = inputs.length;
            
            this.state.attempts++;
            
            inputs.forEach((input, index) => {
                const userAnswer = input.value.trim();
                const correctAnswer = input.dataset.answer;
                const alternatives = JSON.parse(input.dataset.alternatives || '[]');
                
                // 정답 체크 (대소문자 구분 옵션)
                const answersToCheck = [correctAnswer, ...alternatives];
                const isCorrect = answersToCheck.some(answer => 
                    params.caseSensitive 
                        ? userAnswer === answer
                        : userAnswer.toLowerCase() === answer.toLowerCase()
                );
                
                // 시각적 피드백
                input.classList.remove('correct', 'incorrect');
                input.classList.add(isCorrect ? 'correct' : 'incorrect');
                
                if (isCorrect) {
                    correctCount++;
                    input.disabled = true;
                    this.state.userAnswers[index] = userAnswer;
                } else {
                    allCorrect = false;
                    if (!params.allowMultipleAttempts) {
                        input.disabled = true;
                    }
                }
            });
            
            this.state.correctCount = correctCount;
            
            // 진행률 업데이트
            this.updateProgress(container, correctCount, totalCount);
            
            // 피드백 표시
            this.showFeedback(container, params, allCorrect, correctCount, totalCount);
            
            // 완료 처리
            if (allCorrect && !this.state.completed) {
                this.completeActivity(container, params);
            }
        },
        
        /**
         * 진행률 업데이트
         */
        updateProgress(container, correctCount, totalCount) {
            const progressFill = container.querySelector('#progress-fill');
            const progressText = container.querySelector('#progress-text');
            
            const percentage = (correctCount / totalCount) * 100;
            
            if (progressFill) {
                progressFill.style.width = `${percentage}%`;
            }
            
            if (progressText) {
                progressText.textContent = `${correctCount} / ${totalCount}`;
            }
        },
        
        /**
         * 피드백 표시
         */
        showFeedback(container, params, allCorrect, correctCount, totalCount) {
            const feedback = container.querySelector('#feedback');
            if (!feedback) return;
            
            feedback.style.display = 'block';
            
            if (allCorrect) {
                feedback.className = 'feedback success';
                feedback.textContent = params.feedback.complete;
            } else if (correctCount > 0) {
                feedback.className = 'feedback info';
                feedback.textContent = `${correctCount}/${totalCount}개 정답! 나머지도 해볼까요? 💪`;
            } else {
                feedback.className = 'feedback error';
                feedback.textContent = params.feedback.incorrect;
            }
        },
        
        /**
         * 액티비티 완료
         */
        completeActivity(container, params) {
            this.state.completed = true;
            this.state.endTime = Date.now();
            const duration = this.state.endTime - this.state.startTime;
            
            // 타이머 중지
            if (this.state.timerInterval) {
                clearInterval(this.state.timerInterval);
            }
            
            // 모든 입력 비활성화
            const inputs = container.querySelectorAll('.blank-input');
            inputs.forEach(input => input.disabled = true);
            
            // 완료 이벤트 발생
            const score = 1.0; // 100%
            this.emitEvent('activity:completed', {
                activityId: this.state.activityId,
                score: score,
                success: true,
                durationMs: duration,
                attempts: this.state.attempts,
                details: {
                    correctCount: this.state.correctCount,
                    totalCount: inputs.length,
                    userAnswers: this.state.userAnswers
                }
            });
            
            console.log('🎉 액티비티 완료!', {
                score: score,
                duration: `${(duration / 1000).toFixed(1)}초`,
                attempts: this.state.attempts
            });
        },
        
        /**
         * 액티비티 초기화
         */
        resetActivity(container, params) {
            const inputs = container.querySelectorAll('.blank-input');
            inputs.forEach(input => {
                input.value = '';
                input.disabled = false;
                input.classList.remove('correct', 'incorrect');
            });
            
            const feedback = container.querySelector('#feedback');
            if (feedback) {
                feedback.style.display = 'none';
            }
            
            // 진행률 초기화
            this.updateProgress(container, 0, inputs.length);
            
            // 상태 초기화
            this.state.attempts = 0;
            this.state.correctCount = 0;
            this.state.completed = false;
            this.state.userAnswers = {};
            this.state.startTime = Date.now();
            
            // 타이머 재시작
            if (this.state.timerInterval) {
                clearInterval(this.state.timerInterval);
            }
            
            if (params.timeLimit > 0) {
                this.state.remainingTime = params.timeLimit;
                const timerValue = container.querySelector('#timer-value');
                if (timerValue) {
                    timerValue.textContent = params.timeLimit;
                    timerValue.className = 'timer-value';
                }
                this.startTimer(container, params.timeLimit);
            }
            
            // 첫 번째 입력에 포커스
            if (inputs[0]) {
                inputs[0].focus();
            }
        },
        
        /**
         * 타이머 시작
         */
        startTimer(container, timeLimit) {
            const timerValue = container.querySelector('#timer-value');
            if (!timerValue) return;
            
            this.state.remainingTime = timeLimit;
            
            this.state.timerInterval = setInterval(() => {
                this.state.remainingTime--;
                timerValue.textContent = this.state.remainingTime;
                
                // 경고 색상
                if (this.state.remainingTime <= 10) {
                    timerValue.className = 'timer-value danger';
                } else if (this.state.remainingTime <= 30) {
                    timerValue.className = 'timer-value warning';
                }
                
                // 시간 종료
                if (this.state.remainingTime <= 0) {
                    clearInterval(this.state.timerInterval);
                    this.handleTimeout(container);
                }
            }, 1000);
        },
        
        /**
         * 타임아웃 처리
         */
        handleTimeout(container) {
            const inputs = container.querySelectorAll('.blank-input');
            inputs.forEach(input => input.disabled = true);
            
            const feedback = container.querySelector('#feedback');
            if (feedback) {
                feedback.style.display = 'block';
                feedback.className = 'feedback error';
                feedback.textContent = this.state.params.feedback.timeout;
            }
            
            this.emitEvent('activity:timeout', {
                activityId: this.state.activityId,
                correctCount: this.state.correctCount,
                totalCount: inputs.length
            });
        },
        
        /**
         * 이벤트 발생
         */
        emitEvent(eventType, data) {
            if (window.PluginSystem) {
                window.PluginSystem.emit(eventType, data);
            }
            
            // CustomEvent로도 발생
            const event = new CustomEvent(eventType, { detail: data });
            document.dispatchEvent(event);
        },
        
        /**
         * HTML 이스케이프
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        /**
         * 정리 (cleanup)
         */
        cleanup() {
            if (this.state && this.state.timerInterval) {
                clearInterval(this.state.timerInterval);
            }
            console.log('🧹 Fill in the Blanks 플러그인 정리 완료');
        }
    };
    
    // 플러그인 등록
    if (window.registerEduPlugin) {
        window.registerEduPlugin(
            FillInTheBlanksPlugin.name,
            FillInTheBlanksPlugin.version,
            FillInTheBlanksPlugin
        );
        console.log('✅ Fill in the Blanks 플러그인 등록 완료:', FillInTheBlanksPlugin.name + '@' + FillInTheBlanksPlugin.version);
    } else {
        console.error('❌ PluginSystem이 로드되지 않았습니다. plugin-system.js를 먼저 로드하세요.');
    }
})();
