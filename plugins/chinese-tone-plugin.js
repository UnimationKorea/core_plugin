/**
 * 중국어 성조 드래그 드롭 플러그인
 * 중국어 한자와 병음 성조를 매칭하는 교육용 플러그인
 * 
 * @author Plugin Developer
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    console.log('🇨🇳 Chinese Tone 플러그인 로딩 중...');
    
    // 플러그인 정의
    const ChineseTonePlugin = {
        name: 'chinese-tone',
        version: '1.0.0',
        description: '중국어 성조 학습용 드래그 드롭 활동',
        author: '외부 플러그인 개발자',
        
        /**
         * 기본 매개변수 반환
         */
        getDefaultParams() {
            return {
                title: '🇨🇳 중국어 성조 매칭',
                instruction: '한자를 올바른 성조(병음)에 드래그하세요!',
                characters: [
                    { hanzi: '你', pinyin: 'nǐ', tone: 3, meaning: '너' },
                    { hanzi: '好', pinyin: 'hǎo', tone: 3, meaning: '좋다' },
                    { hanzi: '我', pinyin: 'wǒ', tone: 3, meaning: '나' },
                    { hanzi: '是', pinyin: 'shì', tone: 4, meaning: '이다' }
                ],
                showMeaning: true,
                shuffleCharacters: true,
                maxAttempts: 3,
                showFeedback: true,
                backgroundColor: '#1a1a2e',
                primaryColor: '#e74c3c',
                secondaryColor: '#f39c12',
                successColor: '#27ae60'
            };
        },
        
        /**
         * 활동 렌더링 함수
         * @param {Object} activity - 활동 데이터
         * @param {HTMLElement} container - 렌더링할 컨테이너
         */
        async render(activity, container) {
            console.log('🇨🇳 Chinese Tone 렌더링 시작:', activity);
            
            const params = { ...this.getDefaultParams(), ...activity.params };
            
            // 스타일 주입
            this.injectStyles();
            
            // HTML 생성
            container.innerHTML = this.generateHTML(params);
            
            // 기능 초기화
            this.initializeDragDrop(container, params);
            
            console.log('✅ Chinese Tone 렌더링 완료');
        },
        
        /**
         * CSS 스타일 주입
         */
        injectStyles() {
            if (document.getElementById('chinese-tone-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'chinese-tone-styles';
            style.textContent = `
                .chinese-tone-container {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border-radius: 20px;
                    padding: 3rem;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    margin: 2rem 0;
                    box-shadow: 0 20px 40px rgba(26, 26, 46, 0.5);
                    min-height: 600px;
                }
                
                .chinese-tone-title {
                    font-size: 2.2rem;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 1rem;
                    background: linear-gradient(45deg, #e74c3c, #f39c12);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                
                .chinese-tone-instruction {
                    font-size: 1.1rem;
                    text-align: center;
                    opacity: 0.9;
                    margin-bottom: 2rem;
                }
                
                .chinese-tone-game-area {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3rem;
                    margin: 2rem 0;
                }
                
                .hanzi-characters {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 2rem;
                    backdrop-filter: blur(10px);
                }
                
                .section-title {
                    font-size: 1.3rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    color: #f39c12;
                }
                
                .hanzi-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                }
                
                .hanzi-card {
                    background: rgba(231, 76, 60, 0.1);
                    border: 2px solid rgba(231, 76, 60, 0.3);
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                    cursor: grab;
                    transition: all 0.3s ease;
                    user-select: none;
                    position: relative;
                }
                
                .hanzi-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(231, 76, 60, 0.3);
                    border-color: rgba(231, 76, 60, 0.6);
                }
                
                .hanzi-card.dragging {
                    cursor: grabbing;
                    transform: rotate(5deg) scale(1.1);
                    z-index: 1000;
                }
                
                .hanzi-card.matched {
                    background: rgba(39, 174, 96, 0.2);
                    border-color: rgba(39, 174, 96, 0.5);
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                .hanzi-character {
                    font-size: 3rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                    color: #e74c3c;
                }
                
                .hanzi-meaning {
                    font-size: 0.9rem;
                    color: #bdc3c7;
                    margin-top: 0.5rem;
                }
                
                .pinyin-zones {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 2rem;
                    backdrop-filter: blur(10px);
                }
                
                .pinyin-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
                
                .tone-zone {
                    background: rgba(52, 152, 219, 0.1);
                    border: 3px dashed rgba(52, 152, 219, 0.3);
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                    min-height: 100px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    transition: all 0.3s ease;
                    position: relative;
                }
                
                .tone-zone:hover {
                    border-color: rgba(52, 152, 219, 0.6);
                    background: rgba(52, 152, 219, 0.2);
                }
                
                .tone-zone.drag-over {
                    border-color: #f39c12;
                    background: rgba(243, 156, 18, 0.2);
                    border-style: solid;
                    transform: scale(1.05);
                }
                
                .tone-zone.correct {
                    border-color: #27ae60;
                    background: rgba(39, 174, 96, 0.2);
                    border-style: solid;
                }
                
                .tone-zone.incorrect {
                    border-color: #e74c3c;
                    background: rgba(231, 76, 60, 0.2);
                    border-style: solid;
                    animation: shake 0.5s ease-in-out;
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                
                .tone-number {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #3498db;
                    margin-bottom: 0.5rem;
                }
                
                .tone-description {
                    font-size: 0.9rem;
                    color: #95a5a6;
                }
                
                .dropped-hanzi {
                    background: rgba(39, 174, 96, 0.1);
                    border: 2px solid rgba(39, 174, 96, 0.5);
                    border-radius: 8px;
                    padding: 1rem;
                    margin-top: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .dropped-hanzi .hanzi-character {
                    font-size: 2rem;
                    margin-bottom: 0;
                }
                
                .stats-panel {
                    display: flex;
                    justify-content: space-around;
                    margin-top: 2rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 1.5rem;
                    backdrop-filter: blur(10px);
                }
                
                .stat-item {
                    text-align: center;
                }
                
                .stat-value {
                    font-size: 2rem;
                    font-weight: bold;
                    color: #f39c12;
                    display: block;
                }
                
                .stat-label {
                    font-size: 0.9rem;
                    color: #95a5a6;
                    margin-top: 0.5rem;
                }
                
                .feedback {
                    text-align: center;
                    padding: 1rem;
                    border-radius: 10px;
                    margin-top: 1rem;
                    font-weight: 600;
                    display: none;
                }
                
                .feedback.success {
                    background: rgba(39, 174, 96, 0.2);
                    color: #27ae60;
                    border: 2px solid rgba(39, 174, 96, 0.5);
                }
                
                .feedback.error {
                    background: rgba(231, 76, 60, 0.2);
                    color: #e74c3c;
                    border: 2px solid rgba(231, 76, 60, 0.5);
                }
                
                .reset-btn {
                    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    padding: 1rem 2rem;
                    cursor: pointer;
                    margin-top: 2rem;
                    transition: all 0.3s ease;
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .reset-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
                }
                
                .completion-message {
                    text-align: center;
                    padding: 2rem;
                    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
                    border-radius: 15px;
                    margin-top: 2rem;
                    display: none;
                    animation: slideInUp 0.6s ease;
                }
                
                @keyframes slideInUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .completion-title {
                    font-size: 1.8rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                }
                
                .completion-details {
                    font-size: 1.1rem;
                    opacity: 0.9;
                }
            `;
            document.head.appendChild(style);
        },
        
        /**
         * HTML 생성
         */
        generateHTML(params) {
            const toneDescriptions = {
                1: '第一声 (평성)',
                2: '第二声 (상성)', 
                3: '第三声 (거성)',
                4: '第四声 (입성)'
            };
            
            // 고유한 성조들 추출
            const uniqueTones = [...new Set(params.characters.map(char => char.tone))].sort();
            
            const hanziCardsHtml = params.characters.map(char => `
                <div class="hanzi-card" 
                     draggable="true" 
                     data-hanzi="${char.hanzi}" 
                     data-tone="${char.tone}"
                     data-pinyin="${char.pinyin}">
                    <div class="hanzi-character">${char.hanzi}</div>
                    <div class="hanzi-pinyin">${char.pinyin}</div>
                    ${params.showMeaning ? `<div class="hanzi-meaning">(${char.meaning})</div>` : ''}
                </div>
            `).join('');
            
            const toneZonesHtml = uniqueTones.map(tone => `
                <div class="tone-zone" data-tone="${tone}">
                    <div class="tone-number">${tone}성</div>
                    <div class="tone-description">${toneDescriptions[tone]}</div>
                </div>
            `).join('');
            
            return `
                <div class="chinese-tone-container">
                    <h2 class="chinese-tone-title">${params.title}</h2>
                    <p class="chinese-tone-instruction">${params.instruction}</p>
                    
                    <div class="chinese-tone-game-area">
                        <div class="hanzi-characters">
                            <div class="section-title">한자 (汉字)</div>
                            <div class="hanzi-grid">
                                ${hanziCardsHtml}
                            </div>
                        </div>
                        
                        <div class="pinyin-zones">
                            <div class="section-title">성조 구역</div>
                            <div class="pinyin-grid">
                                ${toneZonesHtml}
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-panel">
                        <div class="stat-item">
                            <span class="stat-value" id="correct-count">0</span>
                            <span class="stat-label">정답</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="total-count">${params.characters.length}</span>
                            <span class="stat-label">총 문제</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="attempts-count">0</span>
                            <span class="stat-label">시도 횟수</span>
                        </div>
                    </div>
                    
                    <div id="feedback" class="feedback"></div>
                    
                    <div id="completion-message" class="completion-message">
                        <div class="completion-title">🎉 축하합니다!</div>
                        <div class="completion-details">모든 한자를 올바른 성조에 매칭했습니다!</div>
                    </div>
                    
                    <button class="reset-btn" id="reset-btn">🔄 다시 시작</button>
                </div>
            `;
        },
        
        /**
         * 드래그 드롭 기능 초기화
         */
        initializeDragDrop(container, params) {
            let correctCount = 0;
            let attempts = 0;
            let gameCompleted = false;
            
            const hanziCards = container.querySelectorAll('.hanzi-card');
            const toneZones = container.querySelectorAll('.tone-zone');
            const correctCountEl = container.querySelector('#correct-count');
            const attemptsCountEl = container.querySelector('#attempts-count');
            const feedback = container.querySelector('#feedback');
            const completionMessage = container.querySelector('#completion-message');
            const resetBtn = container.querySelector('#reset-btn');
            
            // 드래그 시작
            hanziCards.forEach(card => {
                card.addEventListener('dragstart', (e) => {
                    if (card.classList.contains('matched') || gameCompleted) {
                        e.preventDefault();
                        return;
                    }
                    
                    card.classList.add('dragging');
                    e.dataTransfer.setData('text/plain', JSON.stringify({
                        hanzi: card.dataset.hanzi,
                        tone: card.dataset.tone,
                        pinyin: card.dataset.pinyin
                    }));
                });
                
                card.addEventListener('dragend', () => {
                    card.classList.remove('dragging');
                });
            });
            
            // 드롭 존 설정
            toneZones.forEach(zone => {
                zone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    zone.classList.add('drag-over');
                });
                
                zone.addEventListener('dragleave', () => {
                    zone.classList.remove('drag-over');
                });
                
                zone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    zone.classList.remove('drag-over');
                    
                    if (gameCompleted) return;
                    
                    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                    const zoneTone = parseInt(zone.dataset.tone);
                    const cardTone = parseInt(data.tone);
                    
                    attempts++;
                    attemptsCountEl.textContent = attempts;
                    
                    if (cardTone === zoneTone) {
                        // 정답
                        this.handleCorrectDrop(zone, data, container);
                        correctCount++;
                        correctCountEl.textContent = correctCount;
                        
                        // 해당 카드를 매칭됨 상태로 변경
                        const matchedCard = Array.from(hanziCards).find(card => 
                            card.dataset.hanzi === data.hanzi
                        );
                        if (matchedCard) {
                            matchedCard.classList.add('matched');
                        }
                        
                        this.showFeedback(feedback, `✅ 정답! ${data.hanzi} (${data.pinyin})는 ${cardTone}성입니다.`, 'success');
                        
                        // 게임 완료 체크
                        if (correctCount === params.characters.length) {
                            this.completeGame(completionMessage, correctCount, attempts);
                            gameCompleted = true;
                        }
                        
                    } else {
                        // 틀림
                        zone.classList.add('incorrect');
                        setTimeout(() => {
                            zone.classList.remove('incorrect');
                        }, 500);
                        
                        this.showFeedback(feedback, `❌ 틀렸습니다. ${data.hanzi}는 ${cardTone}성이 아닙니다.`, 'error');
                    }
                });
            });
            
            // 리셋 버튼
            resetBtn.addEventListener('click', () => {
                this.resetGame(container, params);
            });
            
            // 캐릭터 섞기
            if (params.shuffleCharacters) {
                this.shuffleCards(container.querySelector('.hanzi-grid'));
            }
        },
        
        /**
         * 정답 처리
         */
        handleCorrectDrop(zone, data, container) {
            zone.classList.add('correct');
            
            // 드롭된 한자 표시
            const droppedHanzi = document.createElement('div');
            droppedHanzi.className = 'dropped-hanzi';
            droppedHanzi.innerHTML = `
                <div>
                    <span class="hanzi-character">${data.hanzi}</span>
                    <span>${data.pinyin}</span>
                </div>
                <div>✅</div>
            `;
            zone.appendChild(droppedHanzi);
        },
        
        /**
         * 피드백 표시
         */
        showFeedback(feedbackEl, message, type) {
            feedbackEl.textContent = message;
            feedbackEl.className = `feedback ${type}`;
            feedbackEl.style.display = 'block';
            
            setTimeout(() => {
                feedbackEl.style.display = 'none';
            }, 3000);
        },
        
        /**
         * 게임 완료
         */
        completeGame(completionEl, correct, attempts) {
            const accuracy = ((correct / attempts) * 100).toFixed(1);
            
            completionEl.querySelector('.completion-details').textContent = 
                `총 ${attempts}번 시도해서 ${correct}개 모두 정답! 정확도: ${accuracy}%`;
            completionEl.style.display = 'block';
            
            // 결과 저장 (전역 results 배열이 있는 경우)
            if (typeof window !== 'undefined' && window.results && window.currentActivity !== undefined) {
                window.results[window.currentActivity] = {
                    type: 'chinese-tone',
                    correct: correct,
                    attempts: attempts,
                    accuracy: parseFloat(accuracy),
                    completedAt: new Date().toISOString()
                };
            }
        },
        
        /**
         * 게임 리셋
         */
        resetGame(container, params) {
            // 상태 초기화
            const hanziCards = container.querySelectorAll('.hanzi-card');
            const toneZones = container.querySelectorAll('.tone-zone');
            
            hanziCards.forEach(card => {
                card.classList.remove('matched');
            });
            
            toneZones.forEach(zone => {
                zone.classList.remove('correct', 'incorrect');
                const droppedHanzi = zone.querySelector('.dropped-hanzi');
                if (droppedHanzi) {
                    droppedHanzi.remove();
                }
            });
            
            // 통계 리셋
            container.querySelector('#correct-count').textContent = '0';
            container.querySelector('#attempts-count').textContent = '0';
            container.querySelector('#feedback').style.display = 'none';
            container.querySelector('#completion-message').style.display = 'none';
            
            // 카드 섞기
            if (params.shuffleCharacters) {
                this.shuffleCards(container.querySelector('.hanzi-grid'));
            }
        },
        
        /**
         * 카드 섞기
         */
        shuffleCards(gridContainer) {
            const cards = Array.from(gridContainer.children);
            const shuffled = cards.sort(() => Math.random() - 0.5);
            
            shuffled.forEach(card => {
                gridContainer.appendChild(card);
            });
        },
        
        /**
         * 에디터 설정 (레슨 빌더용)
         */
        getEditorConfig() {
            return {
                fields: [
                    { name: 'title', type: 'text', label: '제목', required: true },
                    { name: 'instruction', type: 'textarea', label: '설명' },
                    { name: 'characters', type: 'json', label: '중국어 문자 데이터', 
                      placeholder: '[{"hanzi":"你","pinyin":"nǐ","tone":3,"meaning":"너"}]' },
                    { name: 'showMeaning', type: 'checkbox', label: '한글 뜻 표시' },
                    { name: 'shuffleCharacters', type: 'checkbox', label: '문자 순서 섞기' },
                    { name: 'maxAttempts', type: 'number', label: '최대 시도 횟수', min: 1, max: 10 }
                ]
            };
        }
    };
    
    // 플러그인 자동 등록
    if (typeof window !== 'undefined' && window.registerEduPlugin) {
        console.log('🔌 Chinese Tone 플러그인 자동 등록 중...');
        window.registerEduPlugin('chinese-tone', '1.0.0', ChineseTonePlugin);
        console.log('✅ Chinese Tone 플러그인 등록 완료!');
    } else {
        console.warn('⚠️ 플러그인 시스템을 찾을 수 없습니다. 수동 등록 준비됨.');
        window.ChineseTonePlugin = ChineseTonePlugin;
    }
    
    console.log('🇨🇳 Chinese Tone 플러그인 로드 완료!');
    
})();