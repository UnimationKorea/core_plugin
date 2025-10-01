/**
 * 중국어 병음-한자 매칭 플러그인
 * 중국어 한자와 병음을 연결하는 드래그 드롭 학습 활동
 * 
 * @author Plugin Developer
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    console.log('🀄 Chinese Pinyin Match 플러그인 로딩 중...');
    
    // 플러그인 정의
    const ChinesePinyinMatchPlugin = {
        name: 'chinese-pinyin-match',
        version: '1.0.0',
        description: '중국어 한자와 병음 매칭 학습용 드래그 드롭 활동',
        author: '외부 플러그인 개발자',
        
        /**
         * 기본 매개변수 반환
         */
        getDefaultParams() {
            return {
                title: '🀄 중국어 병음-한자 매칭',
                instruction: '한자를 올바른 병음으로 드래그해서 연결하세요!',
                pairs: [
                    { hanzi: '学习', pinyin: 'xuéxí', meaning: '공부하다', category: '동사' },
                    { hanzi: '朋友', pinyin: 'péngyǒu', meaning: '친구', category: '명사' },
                    { hanzi: '学校', pinyin: 'xuéxiào', meaning: '학교', category: '명사' },
                    { hanzi: '老师', pinyin: 'lǎoshī', meaning: '선생님', category: '명사' },
                    { hanzi: '中国', pinyin: 'zhōngguó', meaning: '중국', category: '명사' },
                    { hanzi: '汉语', pinyin: 'hànyǔ', meaning: '중국어', category: '명사' }
                ],
                showMeaning: true,
                showCategory: true,
                shuffleCards: true,
                maxAttempts: 3,
                showFeedback: true,
                gameMode: 'drag-connect', // 'drag-connect' 또는 'drag-drop'
                backgroundColor: '#2c3e50',
                primaryColor: '#e67e22',
                secondaryColor: '#3498db',
                successColor: '#27ae60',
                errorColor: '#e74c3c'
            };
        },
        
        /**
         * 활동 렌더링 함수
         */
        async render(activity, container) {
            console.log('🀄 Chinese Pinyin Match 렌더링 시작:', activity);
            
            const params = { ...this.getDefaultParams(), ...activity.params };
            
            // 스타일 주입
            this.injectStyles();
            
            // HTML 생성
            container.innerHTML = this.generateHTML(params);
            
            // 기능 초기화
            this.initializeMatching(container, params);
            
            console.log('✅ Chinese Pinyin Match 렌더링 완료');
        },
        
        /**
         * CSS 스타일 주입
         */
        injectStyles() {
            if (document.getElementById('chinese-pinyin-match-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'chinese-pinyin-match-styles';
            style.textContent = `
                .chinese-pinyin-match-container {
                    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                    border-radius: 20px;
                    padding: 3rem;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    margin: 2rem 0;
                    box-shadow: 0 20px 40px rgba(44, 62, 80, 0.5);
                    min-height: 700px;
                    position: relative;
                }
                
                .pinyin-match-title {
                    font-size: 2.2rem;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 1rem;
                    background: linear-gradient(45deg, #e67e22, #f39c12);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                
                .pinyin-match-instruction {
                    font-size: 1.1rem;
                    text-align: center;
                    opacity: 0.9;
                    margin-bottom: 2.5rem;
                }
                
                .matching-game-area {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                    margin: 2rem 0;
                    position: relative;
                }
                
                .hanzi-column, .pinyin-column {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 2rem;
                    backdrop-filter: blur(10px);
                }
                
                .column-title {
                    font-size: 1.3rem;
                    font-weight: 600;
                    text-align: center;
                    margin-bottom: 1.5rem;
                    color: #f39c12;
                }
                
                .cards-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .hanzi-card, .pinyin-card {
                    background: rgba(230, 126, 34, 0.1);
                    border: 2px solid rgba(230, 126, 34, 0.3);
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    user-select: none;
                    position: relative;
                }
                
                .hanzi-card {
                    cursor: grab;
                }
                
                .hanzi-card:hover {
                    transform: translateX(-10px);
                    box-shadow: 5px 10px 25px rgba(230, 126, 34, 0.3);
                    border-color: rgba(230, 126, 34, 0.6);
                }
                
                .pinyin-card:hover {
                    transform: translateX(10px);
                    box-shadow: -5px 10px 25px rgba(52, 152, 219, 0.3);
                    border-color: rgba(52, 152, 219, 0.6);
                }
                
                .hanzi-card.dragging {
                    cursor: grabbing;
                    transform: rotate(3deg) scale(1.05);
                    z-index: 1000;
                    box-shadow: 0 15px 35px rgba(230, 126, 34, 0.4);
                }
                
                .pinyin-card {
                    background: rgba(52, 152, 219, 0.1);
                    border-color: rgba(52, 152, 219, 0.3);
                }
                
                .pinyin-card.drop-zone {
                    border-color: #f39c12;
                    background: rgba(243, 156, 18, 0.2);
                    border-style: dashed;
                    animation: pulse-border 2s infinite;
                }
                
                @keyframes pulse-border {
                    0%, 100% { border-color: #f39c12; }
                    50% { border-color: #e67e22; }
                }
                
                .hanzi-card.matched, .pinyin-card.matched {
                    background: rgba(39, 174, 96, 0.2);
                    border-color: rgba(39, 174, 96, 0.6);
                    cursor: not-allowed;
                }
                
                .hanzi-card.matched::after, .pinyin-card.matched::after {
                    content: '✓';
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    color: #27ae60;
                    font-size: 1.5rem;
                    font-weight: bold;
                }
                
                .card-main-text {
                    font-size: 2.2rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                    color: #ffffff;
                }
                
                .card-meaning {
                    font-size: 0.9rem;
                    color: #bdc3c7;
                    margin-top: 0.5rem;
                }
                
                .card-category {
                    font-size: 0.8rem;
                    color: #95a5a6;
                    background: rgba(149, 165, 166, 0.2);
                    border-radius: 12px;
                    padding: 0.2rem 0.6rem;
                    margin-top: 0.5rem;
                    display: inline-block;
                }
                
                .connection-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 10;
                }
                
                .connection-line {
                    position: absolute;
                    height: 3px;
                    background: linear-gradient(90deg, #27ae60, #2ecc71);
                    border-radius: 2px;
                    transform-origin: left center;
                    z-index: 10;
                    box-shadow: 0 2px 8px rgba(39, 174, 96, 0.4);
                    animation: drawLine 0.8s ease-out;
                }
                
                @keyframes drawLine {
                    from { width: 0; }
                    to { width: 100%; }
                }
                
                .stats-dashboard {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    margin-top: 2rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 1.5rem;
                    backdrop-filter: blur(10px);
                }
                
                .stat-card {
                    text-align: center;
                    padding: 1rem;
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .stat-value {
                    font-size: 1.8rem;
                    font-weight: bold;
                    color: #f39c12;
                    display: block;
                }
                
                .stat-label {
                    font-size: 0.9rem;
                    color: #95a5a6;
                    margin-top: 0.5rem;
                }
                
                .progress-bar {
                    background: rgba(149, 165, 166, 0.3);
                    border-radius: 10px;
                    height: 8px;
                    margin: 0.5rem 0;
                    overflow: hidden;
                }
                
                .progress-fill {
                    background: linear-gradient(90deg, #27ae60, #2ecc71);
                    height: 100%;
                    border-radius: 10px;
                    width: 0%;
                    transition: width 0.6s ease;
                }
                
                .feedback-panel {
                    text-align: center;
                    padding: 1rem;
                    border-radius: 12px;
                    margin-top: 1rem;
                    font-weight: 600;
                    display: none;
                    animation: slideInDown 0.5s ease;
                }
                
                @keyframes slideInDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .feedback-panel.success {
                    background: rgba(39, 174, 96, 0.2);
                    color: #27ae60;
                    border: 2px solid rgba(39, 174, 96, 0.5);
                }
                
                .feedback-panel.error {
                    background: rgba(231, 76, 60, 0.2);
                    color: #e74c3c;
                    border: 2px solid rgba(231, 76, 60, 0.5);
                }
                
                .game-controls {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-top: 2rem;
                }
                
                .control-btn {
                    background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    padding: 1rem 2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .control-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(230, 126, 34, 0.3);
                }
                
                .control-btn.secondary {
                    background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
                }
                
                .completion-celebration {
                    text-align: center;
                    padding: 3rem 2rem;
                    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
                    border-radius: 20px;
                    margin-top: 2rem;
                    display: none;
                    animation: bounceIn 1s ease;
                }
                
                @keyframes bounceIn {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                .celebration-emoji {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                
                .celebration-title {
                    font-size: 2rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                }
                
                .celebration-details {
                    font-size: 1.1rem;
                    opacity: 0.9;
                    line-height: 1.6;
                }
                
                .hint-panel {
                    background: rgba(52, 152, 219, 0.1);
                    border: 2px solid rgba(52, 152, 219, 0.3);
                    border-radius: 12px;
                    padding: 1rem;
                    margin-top: 1rem;
                    text-align: center;
                    color: #3498db;
                    display: none;
                }
                
                .incorrect-shake {
                    animation: shake 0.6s ease-in-out;
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        },
        
        /**
         * HTML 생성
         */
        generateHTML(params) {
            const hanziCardsHtml = params.pairs.map((pair, index) => `
                <div class="hanzi-card" 
                     draggable="true" 
                     data-hanzi="${pair.hanzi}" 
                     data-pinyin="${pair.pinyin}"
                     data-index="${index}">
                    <div class="card-main-text">${pair.hanzi}</div>
                    ${params.showMeaning ? `<div class="card-meaning">${pair.meaning}</div>` : ''}
                    ${params.showCategory ? `<div class="card-category">${pair.category}</div>` : ''}
                </div>
            `).join('');
            
            const pinyinCardsHtml = params.pairs.map((pair, index) => `
                <div class="pinyin-card" 
                     data-pinyin="${pair.pinyin}"
                     data-hanzi="${pair.hanzi}" 
                     data-index="${index}">
                    <div class="card-main-text">${pair.pinyin}</div>
                    ${params.showMeaning ? `<div class="card-meaning">${pair.meaning}</div>` : ''}
                </div>
            `).join('');
            
            return `
                <div class="chinese-pinyin-match-container">
                    <h2 class="pinyin-match-title">${params.title}</h2>
                    <p class="pinyin-match-instruction">${params.instruction}</p>
                    
                    <div class="matching-game-area">
                        <svg class="connection-canvas" id="connection-canvas"></svg>
                        
                        <div class="hanzi-column">
                            <div class="column-title">汉字 (한자)</div>
                            <div class="cards-container" id="hanzi-container">
                                ${hanziCardsHtml}
                            </div>
                        </div>
                        
                        <div class="pinyin-column">
                            <div class="column-title">拼音 (병음)</div>
                            <div class="cards-container" id="pinyin-container">
                                ${pinyinCardsHtml}
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-dashboard">
                        <div class="stat-card">
                            <span class="stat-value" id="matched-count">0</span>
                            <span class="stat-label">매칭 완료</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-value" id="total-pairs">${params.pairs.length}</span>
                            <span class="stat-label">총 단어</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-value" id="accuracy">0%</span>
                            <span class="stat-label">정확도</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-value" id="attempts">0</span>
                            <span class="stat-label">시도 횟수</span>
                        </div>
                    </div>
                    
                    <div style="margin-top: 1rem;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill"></div>
                        </div>
                    </div>
                    
                    <div id="feedback-panel" class="feedback-panel"></div>
                    
                    <div id="hint-panel" class="hint-panel">
                        💡 팁: 한자를 같은 뜻의 병음으로 드래그하세요!
                    </div>
                    
                    <div class="game-controls">
                        <button class="control-btn secondary" id="hint-btn">💡 힌트</button>
                        <button class="control-btn" id="reset-btn">🔄 다시 시작</button>
                        <button class="control-btn secondary" id="shuffle-btn">🔀 섞기</button>
                    </div>
                    
                    <div id="completion-celebration" class="completion-celebration">
                        <div class="celebration-emoji">🎊🀄🎉</div>
                        <div class="celebration-title">완벽한 매칭!</div>
                        <div class="celebration-details">
                            모든 한자와 병음을 올바르게 연결했습니다!<br>
                            중국어 학습 실력이 향상되고 있어요! 👏
                        </div>
                    </div>
                </div>
            `;
        },
        
        /**
         * 매칭 게임 초기화
         */
        initializeMatching(container, params) {
            let matchedCount = 0;
            let totalAttempts = 0;
            let correctAttempts = 0;
            let gameCompleted = false;
            const connections = new Map();
            
            const hanziCards = container.querySelectorAll('.hanzi-card');
            const pinyinCards = container.querySelectorAll('.pinyin-card');
            const matchedCountEl = container.querySelector('#matched-count');
            const accuracyEl = container.querySelector('#accuracy');
            const attemptsEl = container.querySelector('#attempts');
            const progressFill = container.querySelector('#progress-fill');
            const feedbackPanel = container.querySelector('#feedback-panel');
            const hintPanel = container.querySelector('#hint-panel');
            const completionCelebration = container.querySelector('#completion-celebration');
            const connectionCanvas = container.querySelector('#connection-canvas');
            
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
                        pinyin: card.dataset.pinyin,
                        index: card.dataset.index
                    }));
                });
                
                card.addEventListener('dragend', () => {
                    card.classList.remove('dragging');
                });
            });
            
            // 드롭 존 설정
            pinyinCards.forEach(card => {
                card.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    if (!card.classList.contains('matched') && !gameCompleted) {
                        card.classList.add('drop-zone');
                    }
                });
                
                card.addEventListener('dragleave', () => {
                    card.classList.remove('drop-zone');
                });
                
                card.addEventListener('drop', (e) => {
                    e.preventDefault();
                    card.classList.remove('drop-zone');
                    
                    if (gameCompleted || card.classList.contains('matched')) return;
                    
                    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
                    const isCorrect = dragData.pinyin === card.dataset.pinyin;
                    
                    totalAttempts++;
                    attemptsEl.textContent = totalAttempts;
                    
                    if (isCorrect) {
                        this.handleCorrectMatch(dragData, card, container, connections);
                        correctAttempts++;
                        matchedCount++;
                        matchedCountEl.textContent = matchedCount;
                        
                        // 정확도 업데이트
                        const accuracy = ((correctAttempts / totalAttempts) * 100).toFixed(1);
                        accuracyEl.textContent = accuracy + '%';
                        
                        // 프로그레스 바 업데이트
                        const progress = (matchedCount / params.pairs.length) * 100;
                        progressFill.style.width = progress + '%';
                        
                        this.showFeedback(feedbackPanel, 
                            `✅ 정답! ${dragData.hanzi} ↔ ${dragData.pinyin}`, 'success');
                        
                        // 게임 완료 체크
                        if (matchedCount === params.pairs.length) {
                            this.completeGame(completionCelebration, matchedCount, totalAttempts, correctAttempts);
                            gameCompleted = true;
                        }
                        
                    } else {
                        card.classList.add('incorrect-shake');
                        setTimeout(() => {
                            card.classList.remove('incorrect-shake');
                        }, 600);
                        
                        this.showFeedback(feedbackPanel, 
                            `❌ 틀렸습니다. ${dragData.hanzi}는 ${dragData.pinyin}가 맞습니다.`, 'error');
                        
                        // 정확도 업데이트
                        const accuracy = ((correctAttempts / totalAttempts) * 100).toFixed(1);
                        accuracyEl.textContent = accuracy + '%';
                    }
                });
            });
            
            // 컨트롤 버튼들
            const hintBtn = container.querySelector('#hint-btn');
            const resetBtn = container.querySelector('#reset-btn');
            const shuffleBtn = container.querySelector('#shuffle-btn');
            
            hintBtn.addEventListener('click', () => {
                hintPanel.style.display = hintPanel.style.display === 'none' ? 'block' : 'none';
            });
            
            resetBtn.addEventListener('click', () => {
                this.resetGame(container, params);
            });
            
            shuffleBtn.addEventListener('click', () => {
                this.shuffleCards(container);
            });
            
            // 초기 카드 섞기
            if (params.shuffleCards) {
                this.shuffleCards(container);
            }
        },
        
        /**
         * 정답 매칭 처리
         */
        handleCorrectMatch(dragData, targetCard, container, connections) {
            const hanziCard = container.querySelector(`[data-hanzi="${dragData.hanzi}"]`);
            
            // 카드들을 매칭 상태로 변경
            hanziCard.classList.add('matched');
            targetCard.classList.add('matched');
            
            // 연결선 그리기
            this.drawConnection(hanziCard, targetCard, container);
            
            // 연결 정보 저장
            connections.set(dragData.hanzi, dragData.pinyin);
        },
        
        /**
         * 연결선 그리기
         */
        drawConnection(fromCard, toCard, container) {
            const fromRect = fromCard.getBoundingClientRect();
            const toRect = toCard.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // 상대적 위치 계산
            const fromX = fromRect.right - containerRect.left;
            const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
            const toX = toRect.left - containerRect.left;
            const toY = toRect.top + toRect.height / 2 - containerRect.top;
            
            // 연결선 요소 생성
            const line = document.createElement('div');
            line.className = 'connection-line';
            
            // 길이와 각도 계산
            const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
            const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);
            
            // 스타일 적용
            line.style.left = fromX + 'px';
            line.style.top = fromY + 'px';
            line.style.width = length + 'px';
            line.style.transform = `rotate(${angle}deg)`;
            
            container.appendChild(line);
        },
        
        /**
         * 피드백 표시
         */
        showFeedback(feedbackEl, message, type) {
            feedbackEl.textContent = message;
            feedbackEl.className = `feedback-panel ${type}`;
            feedbackEl.style.display = 'block';
            
            setTimeout(() => {
                feedbackEl.style.display = 'none';
            }, 3000);
        },
        
        /**
         * 게임 완료
         */
        completeGame(celebrationEl, matched, totalAttempts, correctAttempts) {
            const accuracy = ((correctAttempts / totalAttempts) * 100).toFixed(1);
            
            celebrationEl.querySelector('.celebration-details').innerHTML = 
                `총 ${totalAttempts}번의 시도로 ${matched}개 단어를 모두 매칭!<br>정확도: ${accuracy}% - 훌륭한 실력입니다! 👏`;
            celebrationEl.style.display = 'block';
            
            // 결과 저장
            if (typeof window !== 'undefined' && window.results && window.currentActivity !== undefined) {
                window.results[window.currentActivity] = {
                    type: 'chinese-pinyin-match',
                    matched: matched,
                    totalAttempts: totalAttempts,
                    correctAttempts: correctAttempts,
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
            container.querySelectorAll('.hanzi-card, .pinyin-card').forEach(card => {
                card.classList.remove('matched');
            });
            
            // 연결선 제거
            container.querySelectorAll('.connection-line').forEach(line => {
                line.remove();
            });
            
            // 통계 리셋
            container.querySelector('#matched-count').textContent = '0';
            container.querySelector('#accuracy').textContent = '0%';
            container.querySelector('#attempts').textContent = '0';
            container.querySelector('#progress-fill').style.width = '0%';
            container.querySelector('#feedback-panel').style.display = 'none';
            container.querySelector('#completion-celebration').style.display = 'none';
            container.querySelector('#hint-panel').style.display = 'none';
            
            // 카드 섞기
            if (params.shuffleCards) {
                this.shuffleCards(container);
            }
        },
        
        /**
         * 카드 섞기
         */
        shuffleCards(container) {
            const hanziContainer = container.querySelector('#hanzi-container');
            const pinyinContainer = container.querySelector('#pinyin-container');
            
            // 한자 카드 섞기
            const hanziCards = Array.from(hanziContainer.children);
            const shuffledHanzi = hanziCards.sort(() => Math.random() - 0.5);
            shuffledHanzi.forEach(card => hanziContainer.appendChild(card));
            
            // 병음 카드 섞기
            const pinyinCards = Array.from(pinyinContainer.children);
            const shuffledPinyin = pinyinCards.sort(() => Math.random() - 0.5);
            shuffledPinyin.forEach(card => pinyinContainer.appendChild(card));
        },
        
        /**
         * 에디터 설정 (레슨 빌더용)
         */
        getEditorConfig() {
            return {
                fields: [
                    { name: 'title', type: 'text', label: '제목', required: true },
                    { name: 'instruction', type: 'textarea', label: '설명' },
                    { name: 'pairs', type: 'json', label: '한자-병음 쌍 데이터', 
                      placeholder: '[{"hanzi":"学习","pinyin":"xuéxí","meaning":"공부하다","category":"동사"}]' },
                    { name: 'showMeaning', type: 'checkbox', label: '한글 뜻 표시' },
                    { name: 'showCategory', type: 'checkbox', label: '품사 표시' },
                    { name: 'shuffleCards', type: 'checkbox', label: '카드 순서 섞기' },
                    { name: 'maxAttempts', type: 'number', label: '최대 시도 횟수', min: 1, max: 10 }
                ]
            };
        }
    };
    
    // 플러그인 자동 등록
    if (typeof window !== 'undefined' && window.registerEduPlugin) {
        console.log('🔌 Chinese Pinyin Match 플러그인 자동 등록 중...');
        window.registerEduPlugin('chinese-pinyin-match', '1.0.0', ChinesePinyinMatchPlugin);
        console.log('✅ Chinese Pinyin Match 플러그인 등록 완료!');
    } else {
        console.warn('⚠️ 플러그인 시스템을 찾을 수 없습니다. 수동 등록 준비됨.');
        window.ChinesePinyinMatchPlugin = ChinesePinyinMatchPlugin;
    }
    
    console.log('🀄 Chinese Pinyin Match 플러그인 로드 완료!');
    
})();