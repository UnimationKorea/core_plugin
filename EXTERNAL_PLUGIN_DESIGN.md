# 🔌 외부 플러그인 시스템 설계 문서

## 📋 목차
1. [개요](#-개요)
2. [현재 시스템 분석](#-현재-시스템-분석)
3. [외부 플러그인 아키텍처](#-외부-플러그인-아키텍처)
4. [플러그인 개발 가이드](#-플러그인-개발-가이드)
5. [배포 및 등록 방법](#-배포-및-등록-방법)
6. [보안 및 격리](#-보안-및-격리)
7. [샘플 플러그인](#-샘플-플러그인)

---

## 🎯 개요

### 목표
외부 개발자가 코어 시스템 수정 없이 독립적으로 새로운 액티비티 템플릿을 개발하고 배포할 수 있는 플러그인 시스템 구축

### 핵심 원칙
1. **격리성 (Isolation)**: 플러그인이 서로 간섭하지 않음
2. **독립성 (Independence)**: 코어 시스템 수정 불필요
3. **안전성 (Security)**: 보안 검증 및 샌드박스 실행
4. **확장성 (Extensibility)**: 손쉬운 추가/제거
5. **호환성 (Compatibility)**: 버전 관리 및 하위 호환성

---

## 🔍 현재 시스템 분석

### 1. 기존 아키텍처 구성

#### A. **내장 템플릿 시스템** (`src/templates/`)
```
src/templates/
├── base/                    # 기본 인터페이스
├── multiple-choice/         # 객관식 문제
├── word-guess/             # 단어 맞추기
├── memory-game/            # 메모리 게임
├── video/                  # 비디오 플레이어
└── drag-drop/              # 드래그 앤 드롭
```

**특징:**
- TypeScript로 작성
- Vite 빌드 시스템 통합
- 직접 import 방식
- 타입 안정성 보장

#### B. **플러그인 시스템** (`plugin-system.js`)
```javascript
class PluginSystem {
  registerTemplate(name, version, plugin)
  loadExternalPlugin(scriptUrl)
  renderActivity(activity, container)
  validatePlugin(plugin)
}
```

**특징:**
- 동적 스크립트 로딩
- 런타임 등록
- 이벤트 시스템 통합

#### C. **템플릿 레지스트리** (`src/core/template-registry.ts`)
```typescript
class CoreTemplateRegistry {
  register(template: TemplateInfo)
  loadModule(id: string): Promise<ActivityModule>
  validate(template: TemplateInfo)
}
```

**특징:**
- 보안 검증 (도메인, API 호출 제한)
- 버전 관리
- 성능 모니터링
- 의존성 체크

### 2. 등록된 플러그인 예제

현재 `plugins/` 디렉토리에 4개의 외부 플러그인 존재:
- `chinese-pinyin-match-plugin.js` - 중국어 병음 매칭
- `chinese-tone-plugin.js` - 중국어 성조 학습
- `drawing-canvas-plugin.js` - 그리기 캔버스
- `timer-counter-plugin.js` - 타이머 카운터

### 3. 현재 시스템의 장단점

#### ✅ 장점
1. 두 가지 방식 모두 지원 (내장 + 외부)
2. 명확한 인터페이스 정의
3. 보안 검증 시스템 구축
4. 이벤트 기반 통신

#### ⚠️ 개선 필요 사항
1. **플러그인 로딩 메커니즘 통합** 부족
2. **개발자 문서 및 가이드** 미흡
3. **플러그인 마켓플레이스** 부재
4. **버전 충돌 관리** 시스템 필요
5. **Hot-reload** 개발 환경 지원 부족

---

## 🏗️ 외부 플러그인 아키텍처

### 1. 플러그인 라이프사이클

```
┌─────────────────────────────────────────────────────────┐
│                   플러그인 라이프사이클                     │
└─────────────────────────────────────────────────────────┘

1. 개발 (Development)
   ├── 플러그인 코드 작성
   ├── 로컬 테스트
   └── 빌드 및 번들링

2. 배포 (Deployment)
   ├── CDN 업로드 (jsdelivr, unpkg)
   ├── GitHub Release
   └── 플러그인 레지스트리 등록

3. 로딩 (Loading)
   ├── 스크립트 다운로드
   ├── 보안 검증
   ├── 의존성 체크
   └── 템플릿 레지스트리 등록

4. 실행 (Execution)
   ├── 액티비티 인스턴스 생성
   ├── 샌드박스 환경 설정
   ├── 렌더링 및 이벤트 바인딩
   └── 사용자 상호작용

5. 종료 (Cleanup)
   ├── 리소스 해제
   ├── 이벤트 리스너 제거
   └── 메모리 정리
```

### 2. 플러그인 구조

#### A. **UMD (Universal Module Definition) 방식**
```javascript
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MyPlugin = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  
  return {
    // 플러그인 구현
  };
}));
```

#### B. **ES Module 방식**
```javascript
export default {
  manifest: { /* ... */ },
  async mount(container, params, context) { /* ... */ },
  async unmount() { /* ... */ },
  async getResult() { /* ... */ }
}
```

### 3. 플러그인 인터페이스

#### 필수 구현 인터페이스
```typescript
interface ExternalPlugin {
  // 메타데이터
  name: string                // 플러그인 이름 (kebab-case)
  version: string             // 시맨틱 버전 (1.0.0)
  description?: string        // 설명
  author?: string            // 제작자
  homepage?: string          // 홈페이지 URL
  
  // 필수 메서드
  getDefaultParams(): object  // 기본 매개변수 반환
  
  render(                    // 액티비티 렌더링
    activity: Activity,
    container: HTMLElement
  ): Promise<void> | void
  
  // 선택적 메서드
  validate?(params: any): boolean           // 파라미터 검증
  cleanup?(): Promise<void> | void         // 정리 작업
  getResult?(): ActivityResult            // 결과 반환
  onEvent?(event: ActivityEvent): void    // 이벤트 핸들러
}

interface Activity {
  activityId: string
  template: string          // "plugin-name@version"
  params: Record<string, any>
  rules?: ActivityRules
}

interface ActivityResult {
  score: number            // 0.0 ~ 1.0
  success: boolean
  durationMs: number
  details?: any
}
```

### 4. 보안 및 격리 메커니즘

#### A. **샌드박스 정책**
```typescript
interface SecurityPolicy {
  // 허용된 외부 도메인
  allowedDomains: string[]
  
  // API 호출 제한
  maxApiCalls: number
  
  // 로컬 스토리지 접근
  allowLocalStorage: boolean
  
  // 쿠키 접근
  allowCookies: boolean
  
  // 실행 시간 제한 (ms)
  maxExecutionTime: number
  
  // 메모리 제한 (MB)
  maxMemoryUsage: number
}
```

#### B. **CSP (Content Security Policy)**
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net https://unpkg.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
">
```

#### C. **격리 실행 환경**
```javascript
// iframe 샌드박스
const sandbox = document.createElement('iframe');
sandbox.sandbox = 'allow-scripts allow-same-origin';
sandbox.srcdoc = pluginCode;

// Web Worker (향후 구현)
const worker = new Worker('plugin-worker.js');
worker.postMessage({ type: 'LOAD_PLUGIN', code: pluginCode });
```

---

## 📝 플러그인 개발 가이드

### 1. 기본 템플릿

#### **빈칸 채우기 (Fill in the Blanks) 플러그인 예제**

```javascript
/**
 * Fill in the Blanks Activity Plugin
 * @version 1.0.0
 */

(function() {
  'use strict';
  
  const FillInTheBlanksPlugin = {
    // 메타데이터
    name: 'fill-in-blanks',
    version: '1.0.0',
    description: '문장의 빈칸을 채우는 액티비티',
    author: 'Your Name',
    homepage: 'https://github.com/your-username/fill-in-blanks',
    
    /**
     * 기본 매개변수
     */
    getDefaultParams() {
      return {
        title: '빈칸 채우기',
        sentence: '고양이가 {blank}를 쫓아간다.',
        blanks: [
          { id: 'blank-1', position: '{blank}', answer: '쥐' }
        ],
        caseSensitive: false,
        showHints: true,
        hints: ['작은 동물', '치즈를 좋아함'],
        timeLimit: 0,
        feedback: {
          correct: '정답입니다! 🎉',
          incorrect: '다시 시도해보세요.'
        }
      };
    },
    
    /**
     * 파라미터 검증
     */
    validate(params) {
      if (!params.sentence || typeof params.sentence !== 'string') {
        console.error('sentence 필드가 필요합니다.');
        return false;
      }
      
      if (!Array.isArray(params.blanks) || params.blanks.length === 0) {
        console.error('blanks 배열이 필요합니다.');
        return false;
      }
      
      return true;
    },
    
    /**
     * 렌더링
     */
    async render(activity, container) {
      const params = { ...this.getDefaultParams(), ...activity.params };
      
      // 검증
      if (!this.validate(params)) {
        throw new Error('Invalid parameters');
      }
      
      // 스타일 주입
      this.injectStyles();
      
      // HTML 생성
      container.innerHTML = this.generateHTML(params);
      
      // 이벤트 바인딩
      this.setupEventListeners(container, params);
      
      // 시작 이벤트 발생
      if (window.PluginSystem) {
        window.PluginSystem.emit('activity:started', {
          activityId: activity.activityId,
          template: `${this.name}@${this.version}`
        });
      }
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
          data-answer="${blank.answer}"
          placeholder="?"
          autocomplete="off"
        />`;
        sentence = sentence.replace(blank.position, input);
      });
      
      return `
        <div class="fill-in-blanks-container">
          <div class="activity-header">
            <h2 class="activity-title">${params.title}</h2>
            ${params.timeLimit > 0 ? `
              <div class="timer" id="timer">
                ⏱️ <span id="time-remaining">${params.timeLimit}</span>초
              </div>
            ` : ''}
          </div>
          
          <div class="sentence-container">
            <p class="sentence">${sentence}</p>
          </div>
          
          ${params.showHints && params.hints ? `
            <div class="hints-section">
              <button class="hint-button" id="show-hints">💡 힌트 보기</button>
              <div class="hints-list" id="hints-list" style="display: none;">
                ${params.hints.map(hint => `<li>${hint}</li>`).join('')}
              </div>
            </div>
          ` : ''}
          
          <div class="actions">
            <button class="btn-primary" id="check-answer">정답 확인</button>
            <button class="btn-secondary" id="reset-activity">다시 하기</button>
          </div>
          
          <div class="feedback" id="feedback" style="display: none;"></div>
          
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
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
          max-width: 800px;
          margin: 2rem auto;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          color: white;
        }
        
        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .activity-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }
        
        .timer {
          font-size: 1.2rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }
        
        .sentence-container {
          background: rgba(255, 255, 255, 0.95);
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
        }
        
        .sentence {
          font-size: 1.5rem;
          line-height: 2;
          color: #2d3748;
          text-align: center;
          margin: 0;
        }
        
        .blank-input {
          display: inline-block;
          min-width: 100px;
          padding: 0.5rem 1rem;
          font-size: 1.25rem;
          text-align: center;
          border: 2px solid #667eea;
          border-radius: 8px;
          background: white;
          transition: all 0.3s ease;
          margin: 0 0.5rem;
        }
        
        .blank-input:focus {
          outline: none;
          border-color: #764ba2;
          box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.2);
          transform: scale(1.05);
        }
        
        .blank-input.correct {
          border-color: #48bb78;
          background: #f0fff4;
        }
        
        .blank-input.incorrect {
          border-color: #f56565;
          background: #fff5f5;
          animation: shake 0.5s;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        .hints-section {
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .hint-button {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.4);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .hint-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .hints-list {
          background: rgba(255, 255, 255, 0.15);
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
          list-style: none;
        }
        
        .hints-list li {
          padding: 0.5rem;
          margin: 0.25rem 0;
        }
        
        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }
        
        .btn-primary, .btn-secondary {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }
        
        .btn-primary {
          background: #48bb78;
          color: white;
        }
        
        .btn-primary:hover {
          background: #38a169;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.4);
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .feedback {
          text-align: center;
          padding: 1.5rem;
          border-radius: 8px;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .feedback.success {
          background: #48bb78;
          color: white;
        }
        
        .feedback.error {
          background: #f56565;
          color: white;
        }
        
        .progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #48bb78, #38a169);
          transition: width 0.3s ease;
        }
        
        @media (max-width: 768px) {
          .fill-in-blanks-container {
            padding: 1rem;
          }
          
          .activity-title {
            font-size: 1.5rem;
          }
          
          .sentence {
            font-size: 1.25rem;
          }
          
          .blank-input {
            min-width: 80px;
            font-size: 1rem;
          }
          
          .actions {
            flex-direction: column;
          }
        }
      `;
      
      document.head.appendChild(style);
    },
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners(container, params) {
      const checkBtn = container.querySelector('#check-answer');
      const resetBtn = container.querySelector('#reset-activity');
      const hintBtn = container.querySelector('#show-hints');
      const inputs = container.querySelectorAll('.blank-input');
      
      // 정답 확인
      checkBtn?.addEventListener('click', () => {
        this.checkAnswers(container, params);
      });
      
      // 다시 하기
      resetBtn?.addEventListener('click', () => {
        this.resetActivity(container);
      });
      
      // 힌트 보기
      hintBtn?.addEventListener('click', () => {
        const hintsList = container.querySelector('#hints-list');
        if (hintsList) {
          hintsList.style.display = 
            hintsList.style.display === 'none' ? 'block' : 'none';
        }
      });
      
      // Enter 키로 확인
      inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            checkBtn?.click();
          }
        });
      });
      
      // 타이머 시작
      if (params.timeLimit > 0) {
        this.startTimer(container, params.timeLimit);
      }
    },
    
    /**
     * 정답 확인
     */
    checkAnswers(container, params) {
      const inputs = container.querySelectorAll('.blank-input');
      let allCorrect = true;
      let correctCount = 0;
      
      inputs.forEach(input => {
        const userAnswer = input.value.trim();
        const correctAnswer = input.dataset.answer;
        
        const isCorrect = params.caseSensitive 
          ? userAnswer === correctAnswer
          : userAnswer.toLowerCase() === correctAnswer.toLowerCase();
        
        // 시각적 피드백
        input.classList.remove('correct', 'incorrect');
        input.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        if (isCorrect) {
          correctCount++;
          input.disabled = true;
        } else {
          allCorrect = false;
        }
      });
      
      // 진행률 업데이트
      const progress = (correctCount / inputs.length) * 100;
      const progressFill = container.querySelector('#progress-fill');
      if (progressFill) {
        progressFill.style.width = `${progress}%`;
      }
      
      // 피드백 표시
      const feedback = container.querySelector('#feedback');
      if (feedback) {
        feedback.style.display = 'block';
        feedback.className = 'feedback ' + (allCorrect ? 'success' : 'error');
        feedback.textContent = allCorrect 
          ? params.feedback.correct 
          : params.feedback.incorrect;
      }
      
      // 완료 이벤트
      if (allCorrect && window.PluginSystem) {
        window.PluginSystem.emit('activity:completed', {
          score: 1.0,
          success: true
        });
      }
    },
    
    /**
     * 액티비티 초기화
     */
    resetActivity(container) {
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
      
      const progressFill = container.querySelector('#progress-fill');
      if (progressFill) {
        progressFill.style.width = '0%';
      }
    },
    
    /**
     * 타이머 시작
     */
    startTimer(container, timeLimit) {
      let remaining = timeLimit;
      const timerDisplay = container.querySelector('#time-remaining');
      
      const interval = setInterval(() => {
        remaining--;
        if (timerDisplay) {
          timerDisplay.textContent = remaining;
        }
        
        if (remaining <= 0) {
          clearInterval(interval);
          // 시간 종료 처리
          const inputs = container.querySelectorAll('.blank-input');
          inputs.forEach(input => input.disabled = true);
          
          const feedback = container.querySelector('#feedback');
          if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'feedback error';
            feedback.textContent = '시간이 종료되었습니다! ⏰';
          }
        }
      }, 1000);
    },
    
    /**
     * 정리
     */
    cleanup() {
      // 타이머 정리 등
      console.log('Fill in the Blanks 플러그인 정리 완료');
    }
  };
  
  // 플러그인 등록
  if (window.registerEduPlugin) {
    window.registerEduPlugin(
      FillInTheBlanksPlugin.name,
      FillInTheBlanksPlugin.version,
      FillInTheBlanksPlugin
    );
    console.log('✅ Fill in the Blanks 플러그인 등록 완료');
  } else {
    console.error('❌ PluginSystem이 초기화되지 않았습니다.');
  }
})();
```

### 2. 개발 환경 설정

#### 로컬 테스트용 HTML
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Fill in the Blanks Plugin Test</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 2rem;
      background: #1a202c;
    }
  </style>
</head>
<body>
  <div id="activity-container"></div>
  
  <!-- 플러그인 시스템 로드 -->
  <script src="plugin-system.js"></script>
  
  <!-- 플러그인 로드 -->
  <script src="fill-in-blanks-plugin.js"></script>
  
  <!-- 테스트 실행 -->
  <script>
    const container = document.getElementById('activity-container');
    
    const testActivity = {
      activityId: 'test-1',
      template: 'fill-in-blanks@1.0.0',
      params: {
        title: '빈칸 채우기 테스트',
        sentence: '나는 {blank1}에서 {blank2}를 공부합니다.',
        blanks: [
          { id: 'blank-1', position: '{blank1}', answer: '학교' },
          { id: 'blank-2', position: '{blank2}', answer: '수학' }
        ],
        hints: ['교육 기관', '숫자를 다루는 과목'],
        timeLimit: 60
      }
    };
    
    // 렌더링
    window.PluginSystem.renderActivity(testActivity, container);
  </script>
</body>
</html>
```

---

## 🚀 배포 및 등록 방법

### 1. CDN 배포

#### Option A: jsDelivr (GitHub 연동)
```bash
# 1. GitHub에 푸시
git add fill-in-blanks-plugin.js
git commit -m "feat: Add fill-in-blanks plugin v1.0.0"
git tag v1.0.0
git push origin main --tags

# 2. jsDelivr URL
https://cdn.jsdelivr.net/gh/username/repo@1.0.0/fill-in-blanks-plugin.js
```

#### Option B: unpkg (npm 패키지)
```bash
# 1. npm 패키지 발행
npm publish

# 2. unpkg URL
https://unpkg.com/fill-in-blanks-plugin@1.0.0/dist/index.js
```

### 2. 플러그인 등록

#### A. 관리자 대시보드에서 등록
```javascript
// 플러그인 메타데이터
{
  "id": "fill-in-blanks@1.0.0",
  "name": "빈칸 채우기",
  "description": "문장의 빈칸을 채우는 액티비티",
  "author": "Your Name",
  "version": "1.0.0",
  "category": "assessment",
  "bundle": "https://cdn.jsdelivr.net/gh/username/repo@1.0.0/fill-in-blanks-plugin.js",
  "checksum": "sha256-xxxxx",
  "homepage": "https://github.com/username/fill-in-blanks-plugin",
  "icon": "https://example.com/icon.svg",
  "screenshots": [
    "https://example.com/screenshot1.png"
  ],
  "tags": ["assessment", "language", "interactive"]
}
```

#### B. 프로그래밍 방식 등록
```javascript
// 플랫폼 초기화 시 외부 플러그인 로드
async function loadExternalPlugins() {
  const plugins = [
    'https://cdn.jsdelivr.net/gh/username/fill-in-blanks@1.0.0/dist/index.js',
    'https://unpkg.com/sequence-order-plugin@1.0.0/dist/index.js'
  ];
  
  for (const url of plugins) {
    try {
      await window.PluginSystem.loadExternalPlugin(url);
      console.log(`✅ 플러그인 로드 완료: ${url}`);
    } catch (error) {
      console.error(`❌ 플러그인 로드 실패: ${url}`, error);
    }
  }
}

// 앱 시작 시 호출
loadExternalPlugins();
```

### 3. 레슨에서 사용

```json
{
  "lessonId": "korean-grammar-001",
  "title": "한국어 문법 연습",
  "flow": [
    {
      "activityId": "activity-1",
      "template": "fill-in-blanks@1.0.0",
      "params": {
        "title": "조사 넣기",
        "sentence": "나{blank1} 친구{blank2} 만났다.",
        "blanks": [
          { "id": "blank-1", "position": "{blank1}", "answer": "는" },
          { "id": "blank-2", "position": "{blank2}", "answer": "를" }
        ]
      }
    }
  ]
}
```

---

## 🔐 보안 및 격리

### 1. 보안 체크리스트

#### 플러그인 개발자
- [ ] XSS 방지: 사용자 입력 sanitize
- [ ] CSRF 방지: 외부 API 호출 시 토큰 사용
- [ ] 민감 정보 노출 방지
- [ ] eval() 사용 금지
- [ ] innerHTML 대신 textContent 사용 (가능한 경우)

#### 플랫폼 관리자
- [ ] 플러그인 코드 리뷰
- [ ] 신뢰할 수 있는 CDN만 허용
- [ ] Subresource Integrity (SRI) 사용
- [ ] 정기적인 보안 감사
- [ ] 플러그인 업데이트 모니터링

### 2. SRI (Subresource Integrity)

```javascript
// 체크섬 검증
async function loadPluginWithIntegrity(url, integrity) {
  const script = document.createElement('script');
  script.src = url;
  script.integrity = integrity;
  script.crossOrigin = 'anonymous';
  
  return new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// 사용 예시
await loadPluginWithIntegrity(
  'https://cdn.jsdelivr.net/gh/user/plugin@1.0.0/index.js',
  'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC'
);
```

---

## 📦 샘플 플러그인 모음

### 1. 순서 맞추기 (Sequence Order)

**기능:** 항목들을 올바른 순서로 배열

**파라미터:**
```javascript
{
  title: '역사적 사건 순서 맞추기',
  items: [
    { id: 'item-1', content: '프랑스 혁명', order: 2 },
    { id: 'item-2', content: '미국 독립', order: 1 },
    { id: 'item-3', content: '제1차 세계대전', order: 3 }
  ],
  direction: 'vertical',  // or 'horizontal'
  showNumbers: true,
  allowDragDrop: true
}
```

### 2. 이미지 핫스팟 (Image Hotspot)

**기능:** 이미지의 특정 영역 클릭하여 정보 확인

**파라미터:**
```javascript
{
  title: '인체 구조 학습',
  image: 'https://example.com/human-body.jpg',
  hotspots: [
    {
      id: 'hotspot-1',
      x: 50,  // percentage
      y: 30,
      label: '심장',
      description: '혈액을 순환시키는 기관',
      popup: true
    }
  ]
}
```

### 3. 타임라인 (Timeline)

**기능:** 시간 순서로 이벤트 표시

**파라미터:**
```javascript
{
  title: '한국 근현대사',
  events: [
    {
      id: 'event-1',
      date: '1945-08-15',
      title: '광복절',
      description: '일본 식민 통치로부터 해방',
      image: 'url'
    }
  ],
  orientation: 'horizontal',
  interactive: true
}
```

### 4. 플래시카드 (Flashcard)

**기능:** 앞뒤로 넘기며 학습

**파라미터:**
```javascript
{
  title: '영어 단어 암기',
  cards: [
    {
      id: 'card-1',
      front: 'Apple',
      back: '사과',
      image: 'apple.jpg',
      audio: 'apple.mp3'
    }
  ],
  shuffle: true,
  autoPlay: false,
  showProgress: true
}
```

---

## 🎓 추가 리소스

### 문서
- [플러그인 API 레퍼런스](./PLUGIN_API_REFERENCE.md)
- [보안 가이드라인](./SECURITY_GUIDELINES.md)
- [성능 최적화 팁](./PERFORMANCE_TIPS.md)

### 예제 저장소
- [공식 플러그인 컬렉션](https://github.com/UnimationKorea/official-plugins)
- [커뮤니티 플러그인](https://github.com/UnimationKorea/community-plugins)

### 지원
- [Discord 커뮤니티](https://discord.gg/xxx)
- [GitHub Discussions](https://github.com/UnimationKorea/core_plugin/discussions)
- Email: plugin-support@unimationkorea.com

---

## 📊 다음 단계

### Phase 1: 기반 구축 ✅
- [x] 현재 시스템 분석
- [x] 아키텍처 설계
- [x] 문서 작성

### Phase 2: 구현
- [ ] 플러그인 로더 개선
- [ ] 개발자 CLI 도구
- [ ] 플러그인 마켓플레이스
- [ ] 샘플 플러그인 구현

### Phase 3: 생태계 구축
- [ ] 커뮤니티 플러그인 저장소
- [ ] 플러그인 인증 시스템
- [ ] 분석 및 모니터링
- [ ] 문서 및 튜토리얼

---

**작성일:** 2025-10-21  
**버전:** 1.0.0  
**작성자:** AI Development Team
