/**
 * 그리기 캔버스 플러그인
 * 외부에서 제작된 독립적인 교육 활동 템플릿
 * 
 * @author External Developer
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // 플러그인 정의
    const DrawingCanvasPlugin = {
        name: 'drawing-canvas',
        version: '1.0.0',
        description: '자유 그리기 및 스케치 활동',
        author: 'External Plugin Developer',
        
        /**
         * 기본 매개변수 반환
         */
        getDefaultParams() {
            return {
                title: '자유 그리기',
                canvasWidth: 800,
                canvasHeight: 600,
                backgroundColor: '#ffffff',
                brushColor: '#000000',
                brushSize: 5,
                allowColorChange: true,
                allowSizeChange: true,
                instruction: '자유롭게 그림을 그려보세요!',
                saveEnabled: true,
                clearEnabled: true,
                tools: ['brush', 'eraser', 'line', 'circle', 'rectangle']
            };
        },
        
        /**
         * 활동 렌더링 함수
         * @param {Object} activity - 활동 데이터
         * @param {HTMLElement} container - 렌더링할 컨테이너
         */
        async render(activity, container) {
            const params = { ...this.getDefaultParams(), ...activity.params };
            
            // 스타일 주입 (한 번만)
            if (!document.getElementById('drawing-canvas-styles')) {
                this.injectStyles();
            }
            
            // HTML 생성
            container.innerHTML = this.generateHTML(params);
            
            // 캔버스 초기화
            this.initializeCanvas(container, params);
            
            console.log('🎨 Drawing Canvas 플러그인 렌더링 완료');
        },
        
        /**
         * CSS 스타일 주입
         */
        injectStyles() {
            const style = document.createElement('style');
            style.id = 'drawing-canvas-styles';
            style.textContent = `
                .drawing-canvas-container {
                    text-align: center;
                    padding: 2rem;
                    background: #f8f9fa;
                    border-radius: 12px;
                    margin: 1rem 0;
                }
                
                .drawing-canvas-title {
                    color: #495057;
                    margin-bottom: 1rem;
                    font-size: 1.5rem;
                    font-weight: 600;
                }
                
                .drawing-canvas-instruction {
                    color: #6c757d;
                    margin-bottom: 2rem;
                    font-size: 1rem;
                }
                
                .drawing-canvas-toolbar {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }
                
                .drawing-canvas-tool {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .drawing-canvas-tool:hover {
                    background: #0056b3;
                }
                
                .drawing-canvas-tool.active {
                    background: #28a745;
                }
                
                .drawing-canvas {
                    border: 2px solid #dee2e6;
                    border-radius: 8px;
                    cursor: crosshair;
                    margin: 1rem auto;
                    display: block;
                    background: white;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .drawing-canvas-controls {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-top: 1rem;
                    flex-wrap: wrap;
                }
                
                .drawing-canvas-slider {
                    margin: 0 0.5rem;
                }
                
                .drawing-canvas-color {
                    width: 40px;
                    height: 40px;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
        },
        
        /**
         * HTML 생성
         */
        generateHTML(params) {
            return `
                <div class="drawing-canvas-container">
                    <h3 class="drawing-canvas-title">${params.title}</h3>
                    <p class="drawing-canvas-instruction">${params.instruction}</p>
                    
                    <div class="drawing-canvas-toolbar">
                        ${params.tools.map(tool => `
                            <button class="drawing-canvas-tool" data-tool="${tool}" 
                                    ${tool === 'brush' ? 'class="drawing-canvas-tool active"' : ''}>
                                ${this.getToolIcon(tool)} ${this.getToolName(tool)}
                            </button>
                        `).join('')}
                    </div>
                    
                    <canvas class="drawing-canvas" 
                            width="${params.canvasWidth}" 
                            height="${params.canvasHeight}"
                            style="background-color: ${params.backgroundColor};">
                    </canvas>
                    
                    <div class="drawing-canvas-controls">
                        ${params.allowColorChange ? `
                            <div>
                                <label>색상: </label>
                                <input type="color" class="drawing-canvas-color" value="${params.brushColor}">
                            </div>
                        ` : ''}
                        
                        ${params.allowSizeChange ? `
                            <div>
                                <label>크기: </label>
                                <input type="range" class="drawing-canvas-slider" 
                                       min="1" max="50" value="${params.brushSize}">
                                <span class="size-display">${params.brushSize}px</span>
                            </div>
                        ` : ''}
                        
                        ${params.clearEnabled ? `
                            <button class="drawing-canvas-tool" data-action="clear">
                                🗑️ 지우기
                            </button>
                        ` : ''}
                        
                        ${params.saveEnabled ? `
                            <button class="drawing-canvas-tool" data-action="save">
                                💾 저장
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="result" style="margin-top: 1rem; display: none;">
                        그리기 완료! 창의적인 작품이 만들어졌습니다! 🎨
                    </div>
                </div>
            `;
        },
        
        /**
         * 캔버스 초기화 및 이벤트 연결
         */
        initializeCanvas(container, params) {
            const canvas = container.querySelector('.drawing-canvas');
            const ctx = canvas.getContext('2d');
            
            let isDrawing = false;
            let currentTool = 'brush';
            let currentColor = params.brushColor;
            let currentSize = params.brushSize;
            let startX, startY;
            
            // 도구 설정
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // 도구 버튼 이벤트
            container.querySelectorAll('[data-tool]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // 기존 active 클래스 제거
                    container.querySelectorAll('.drawing-canvas-tool').forEach(b => 
                        b.classList.remove('active'));
                    
                    // 새 도구 활성화
                    e.target.classList.add('active');
                    currentTool = e.target.dataset.tool;
                    
                    // 커서 변경
                    canvas.style.cursor = currentTool === 'eraser' ? 'grab' : 'crosshair';
                });
            });
            
            // 색상 변경 이벤트
            const colorPicker = container.querySelector('.drawing-canvas-color');
            if (colorPicker) {
                colorPicker.addEventListener('change', (e) => {
                    currentColor = e.target.value;
                });
            }
            
            // 크기 변경 이벤트
            const sizePicker = container.querySelector('.drawing-canvas-slider');
            const sizeDisplay = container.querySelector('.size-display');
            if (sizePicker && sizeDisplay) {
                sizePicker.addEventListener('input', (e) => {
                    currentSize = e.target.value;
                    sizeDisplay.textContent = currentSize + 'px';
                });
            }
            
            // 액션 버튼 이벤트
            container.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.target.dataset.action;
                    
                    if (action === 'clear') {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        this.showResult(container, '캔버스가 초기화되었습니다! 🧹');
                    } else if (action === 'save') {
                        this.saveCanvas(canvas);
                        this.showResult(container, '작품이 저장되었습니다! 💾');
                    }
                });
            });
            
            // 마우스 이벤트
            canvas.addEventListener('mousedown', (e) => {
                isDrawing = true;
                const rect = canvas.getBoundingClientRect();
                startX = e.clientX - rect.left;
                startY = e.clientY - rect.top;
                
                this.startDrawing(ctx, startX, startY, currentTool, currentColor, currentSize);
            });
            
            canvas.addEventListener('mousemove', (e) => {
                if (!isDrawing) return;
                
                const rect = canvas.getBoundingClientRect();
                const currentX = e.clientX - rect.left;
                const currentY = e.clientY - rect.top;
                
                this.draw(ctx, startX, startY, currentX, currentY, currentTool, currentColor, currentSize);
                
                if (currentTool === 'brush' || currentTool === 'eraser') {
                    startX = currentX;
                    startY = currentY;
                }
            });
            
            canvas.addEventListener('mouseup', () => {
                isDrawing = false;
            });
            
            canvas.addEventListener('mouseout', () => {
                isDrawing = false;
            });
        },
        
        /**
         * 그리기 시작
         */
        startDrawing(ctx, x, y, tool, color, size) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            
            if (tool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = color;
            }
            
            ctx.lineWidth = size;
        },
        
        /**
         * 그리기 실행
         */
        draw(ctx, startX, startY, currentX, currentY, tool, color, size) {
            switch (tool) {
                case 'brush':
                case 'eraser':
                    ctx.lineTo(currentX, currentY);
                    ctx.stroke();
                    break;
                    
                case 'line':
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    // 실제 구현에서는 임시 캔버스 사용
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(currentX, currentY);
                    ctx.stroke();
                    break;
                    
                case 'circle':
                    const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
                    ctx.beginPath();
                    ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                    ctx.stroke();
                    break;
                    
                case 'rectangle':
                    const width = currentX - startX;
                    const height = currentY - startY;
                    ctx.beginPath();
                    ctx.rect(startX, startY, width, height);
                    ctx.stroke();
                    break;
            }
        },
        
        /**
         * 도구 아이콘 가져오기
         */
        getToolIcon(tool) {
            const icons = {
                'brush': '🖌️',
                'eraser': '🧹',
                'line': '📏',
                'circle': '⭕',
                'rectangle': '⬜'
            };
            return icons[tool] || '🖊️';
        },
        
        /**
         * 도구 이름 가져오기
         */
        getToolName(tool) {
            const names = {
                'brush': '브러시',
                'eraser': '지우개',
                'line': '직선',
                'circle': '원',
                'rectangle': '사각형'
            };
            return names[tool] || tool;
        },
        
        /**
         * 캔버스 저장
         */
        saveCanvas(canvas) {
            const link = document.createElement('a');
            link.download = `drawing-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        },
        
        /**
         * 결과 표시
         */
        showResult(container, message) {
            const result = container.querySelector('.result');
            if (result) {
                result.textContent = message;
                result.style.display = 'block';
                
                setTimeout(() => {
                    result.style.display = 'none';
                }, 3000);
            }
        },
        
        /**
         * 에디터용 기본 매개변수 (레슨 빌더용)
         */
        getEditorConfig() {
            return {
                fields: [
                    { name: 'title', type: 'text', label: '제목', required: true },
                    { name: 'instruction', type: 'textarea', label: '설명' },
                    { name: 'canvasWidth', type: 'number', label: '캔버스 너비', min: 400, max: 1200 },
                    { name: 'canvasHeight', type: 'number', label: '캔버스 높이', min: 300, max: 800 },
                    { name: 'brushColor', type: 'color', label: '기본 색상' },
                    { name: 'brushSize', type: 'range', label: '기본 크기', min: 1, max: 50 },
                    { name: 'allowColorChange', type: 'checkbox', label: '색상 변경 허용' },
                    { name: 'allowSizeChange', type: 'checkbox', label: '크기 변경 허용' }
                ]
            };
        }
    };
    
    // 플러그인 자동 등록
    if (typeof window !== 'undefined' && window.registerEduPlugin) {
        window.registerEduPlugin('drawing-canvas', '1.0.0', DrawingCanvasPlugin);
    } else {
        console.warn('플러그인 시스템을 찾을 수 없습니다. 수동으로 등록해주세요.');
        
        // 전역으로 노출 (수동 등록용)
        window.DrawingCanvasPlugin = DrawingCanvasPlugin;
    }
    
    console.log('🎨 Drawing Canvas 플러그인이 로드되었습니다!');
    
})();