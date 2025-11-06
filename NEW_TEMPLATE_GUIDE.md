# 🆕 새로운 템플릿(플러그인) 추가 가이드

## 📌 개요

이 가이드는 **새로운 템플릿을 신규로 추가**할 때 필요한 **모든 단계**를 실무 중심으로 설명합니다.

**작성일**: 2025-10-21  
**대상 독자**: 플러그인 개발자, 교육 콘텐츠 제작자  
**예상 소요 시간**: 1-2시간 (간단한 플러그인 기준)

---

## 🎯 두 가지 방식 비교

### 방식 1: 외부 플러그인 (추천 ⭐)

| 장점 | 단점 |
|------|------|
| ✅ 코어 시스템 수정 불필요 | ⚠️ CDN 의존성 |
| ✅ 빠른 배포 (빌드 없음) | ⚠️ 타입 안정성 낮음 |
| ✅ 독립적 버전 관리 | ⚠️ 보안 검증 필요 |
| ✅ 실험적 기능에 적합 | ⚠️ 약간의 성능 오버헤드 |

**추천 상황**:
- 🚀 빠른 프로토타이핑이 필요할 때
- 🧪 실험적 기능을 테스트할 때
- 👥 커뮤니티 기여를 받을 때
- 📦 특정 고객 맞춤 기능

### 방식 2: 내장 템플릿

| 장점 | 단점 |
|------|------|
| ✅ 높은 타입 안정성 | ❌ 빌드 과정 필요 |
| ✅ 최적화된 성능 | ❌ 배포 시간 김 |
| ✅ 강력한 보안 | ❌ 코어 저장소 수정 필요 |
| ✅ 핵심 기능에 적합 | ❌ 버전 관리 복잡 |

**추천 상황**:
- 🏢 플랫폼 핵심 기능
- 🔒 높은 보안이 필요할 때
- ⚡ 최고 성능이 필요할 때
- 📊 복잡한 타입 정의가 필요할 때

---

## 🚀 방식 1: 외부 플러그인 추가 (단계별 가이드)

### 📋 전체 프로세스

```
1. 플러그인 개발
   ↓
2. 로컬 테스트
   ↓
3. CDN 배포
   ↓
4. 플랫폼 등록
   ↓
5. 레슨에서 사용
```

---

### Step 1: 플러그인 개발 🔧

#### 1-1. 프로젝트 구조 생성

```bash
mkdir my-awesome-plugin
cd my-awesome-plugin

# 파일 구조
my-awesome-plugin/
├── index.js              # 메인 플러그인 코드
├── test.html             # 로컬 테스트 페이지
├── README.md             # 문서
└── package.json          # (선택) npm 배포 시
```

#### 1-2. 플러그인 코드 작성 (index.js)

```javascript
/**
 * My Awesome Plugin - 예제 플러그인
 * @version 1.0.0
 * @description 간단한 예제 플러그인입니다
 */

(function(global) {
  'use strict';

  // ========================================
  // 1. 플러그인 정의
  // ========================================
  const MyAwesomePlugin = {
    // 필수 속성
    name: 'my-awesome-plugin',
    version: '1.0.0',
    description: '놀라운 기능을 제공하는 플러그인',

    // ========================================
    // 2. 기본 파라미터 (필수)
    // ========================================
    getDefaultParams() {
      return {
        title: '기본 제목',
        content: '기본 내용',
        showTimer: false,
        timeLimit: 60,
        difficulty: 'medium',
        theme: 'default',
        // 커스텀 파라미터 추가...
      };
    },

    // ========================================
    // 3. 파라미터 검증 (선택, 권장)
    // ========================================
    validate(params) {
      const errors = [];

      if (!params.title || params.title.trim() === '') {
        errors.push('title은 필수입니다');
      }

      if (params.timeLimit && params.timeLimit < 0) {
        errors.push('timeLimit은 0보다 커야 합니다');
      }

      if (errors.length > 0) {
        throw new Error(`파라미터 검증 실패:\n${errors.join('\n')}`);
      }

      return true;
    },

    // ========================================
    // 4. 렌더링 함수 (필수) ⭐⭐⭐
    // ========================================
    async render(activity, container) {
      try {
        // 4-1. 파라미터 병합
        const params = {
          ...this.getDefaultParams(),
          ...activity.params
        };

        // 4-2. 파라미터 검증
        this.validate(params);

        // 4-3. 스타일 주입 (한 번만)
        this.injectStyles();

        // 4-4. HTML 생성 및 렌더링
        container.innerHTML = this.generateHTML(params);

        // 4-5. 이벤트 리스너 설정
        this.setupEventListeners(container, params, activity);

        // 4-6. 초기화 작업
        this.initialize(container, params, activity);

        // 4-7. activity:started 이벤트 발생
        this.emitEvent('activity:started', {
          activityId: activity.activityId,
          template: `${this.name}@${this.version}`,
          timestamp: Date.now()
        });

        console.log(`✅ ${this.name} 렌더링 완료`);
      } catch (error) {
        console.error(`❌ ${this.name} 렌더링 실패:`, error);
        this.renderError(container, error.message);
      }
    },

    // ========================================
    // 5. HTML 생성
    // ========================================
    generateHTML(params) {
      return `
        <div class="my-plugin-container" data-theme="${params.theme}">
          <!-- 헤더 -->
          <div class="my-plugin-header">
            <h2 class="my-plugin-title">${this.escapeHtml(params.title)}</h2>
            ${params.showTimer ? this.generateTimerHTML(params.timeLimit) : ''}
          </div>

          <!-- 메인 콘텐츠 -->
          <div class="my-plugin-content">
            <p class="my-plugin-text">${this.escapeHtml(params.content)}</p>
          </div>

          <!-- 버튼 영역 -->
          <div class="my-plugin-actions">
            <button class="my-plugin-btn my-plugin-btn-primary" data-action="submit">
              제출하기
            </button>
            <button class="my-plugin-btn my-plugin-btn-secondary" data-action="reset">
              다시하기
            </button>
          </div>

          <!-- 피드백 영역 -->
          <div class="my-plugin-feedback" style="display: none;">
            <div class="feedback-message"></div>
          </div>
        </div>
      `;
    },

    // ========================================
    // 6. 타이머 HTML 생성 (예제)
    // ========================================
    generateTimerHTML(timeLimit) {
      return `
        <div class="my-plugin-timer" data-time-limit="${timeLimit}">
          <span class="timer-icon">⏱️</span>
          <span class="timer-value">${timeLimit}</span>초
        </div>
      `;
    },

    // ========================================
    // 7. CSS 주입 (한 번만 실행)
    // ========================================
    injectStyles() {
      const styleId = `${this.name}-styles`;
      if (document.getElementById(styleId)) return; // 이미 주입됨

      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* 컨테이너 */
        .my-plugin-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* 헤더 */
        .my-plugin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .my-plugin-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        /* 타이머 */
        .my-plugin-timer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #dbeafe;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e40af;
        }

        .my-plugin-timer.warning {
          background: #fef3c7;
          color: #92400e;
        }

        .my-plugin-timer.danger {
          background: #fee2e2;
          color: #991b1b;
        }

        /* 콘텐츠 */
        .my-plugin-content {
          margin-bottom: 1.5rem;
        }

        .my-plugin-text {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #374151;
        }

        /* 버튼 */
        .my-plugin-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .my-plugin-btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .my-plugin-btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .my-plugin-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .my-plugin-btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .my-plugin-btn-secondary:hover {
          background: #e5e7eb;
        }

        .my-plugin-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* 피드백 */
        .my-plugin-feedback {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 8px;
        }

        .my-plugin-feedback.success {
          background: #d1fae5;
          color: #065f46;
        }

        .my-plugin-feedback.error {
          background: #fee2e2;
          color: #991b1b;
        }

        /* 반응형 */
        @media (max-width: 640px) {
          .my-plugin-container {
            padding: 1rem;
          }

          .my-plugin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .my-plugin-actions {
            flex-direction: column;
          }
        }
      `;
      document.head.appendChild(style);
    },

    // ========================================
    // 8. 이벤트 리스너 설정
    // ========================================
    setupEventListeners(container, params, activity) {
      // 제출 버튼
      const submitBtn = container.querySelector('[data-action="submit"]');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          this.handleSubmit(container, params, activity);
        });
      }

      // 리셋 버튼
      const resetBtn = container.querySelector('[data-action="reset"]');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.handleReset(container, params, activity);
        });
      }
    },

    // ========================================
    // 9. 초기화 작업
    // ========================================
    initialize(container, params, activity) {
      // 타이머 시작
      if (params.showTimer) {
        this.startTimer(container, params, activity);
      }

      // 초점 설정
      const firstInput = container.querySelector('input, textarea, select');
      if (firstInput) {
        firstInput.focus();
      }
    },

    // ========================================
    // 10. 타이머 시작 (예제)
    // ========================================
    startTimer(container, params, activity) {
      const timerElement = container.querySelector('.my-plugin-timer');
      if (!timerElement) return;

      let timeLeft = params.timeLimit;
      const timerValueEl = timerElement.querySelector('.timer-value');

      const interval = setInterval(() => {
        timeLeft--;
        timerValueEl.textContent = timeLeft;

        // 경고 색상 변경
        if (timeLeft <= 10) {
          timerElement.classList.remove('warning');
          timerElement.classList.add('danger');
        } else if (timeLeft <= 30) {
          timerElement.classList.add('warning');
        }

        // 시간 종료
        if (timeLeft <= 0) {
          clearInterval(interval);
          this.handleTimeout(container, params, activity);
        }
      }, 1000);

      // 정리를 위해 interval ID 저장
      container.dataset.timerId = interval;
    },

    // ========================================
    // 11. 제출 처리
    // ========================================
    handleSubmit(container, params, activity) {
      console.log('제출 버튼 클릭됨');

      // 답안 검증 로직
      const isCorrect = this.validateAnswer(container, params);

      // 피드백 표시
      this.showFeedback(container, isCorrect);

      // 이벤트 발생
      this.emitEvent('activity:completed', {
        activityId: activity.activityId,
        result: isCorrect ? 'success' : 'failure',
        score: isCorrect ? 100 : 0,
        timestamp: Date.now()
      });
    },

    // ========================================
    // 12. 리셋 처리
    // ========================================
    handleReset(container, params, activity) {
      console.log('리셋 버튼 클릭됨');

      // 피드백 숨기기
      const feedback = container.querySelector('.my-plugin-feedback');
      if (feedback) {
        feedback.style.display = 'none';
      }

      // 입력 필드 초기화
      const inputs = container.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.value = '';
      });

      // 타이머 재시작
      if (params.showTimer) {
        const oldInterval = container.dataset.timerId;
        if (oldInterval) {
          clearInterval(oldInterval);
        }
        this.startTimer(container, params, activity);
      }
    },

    // ========================================
    // 13. 타임아웃 처리
    // ========================================
    handleTimeout(container, params, activity) {
      console.log('시간 초과');

      // 버튼 비활성화
      const buttons = container.querySelectorAll('.my-plugin-btn');
      buttons.forEach(btn => btn.disabled = true);

      // 피드백 표시
      this.showFeedback(container, false, '시간이 초과되었습니다.');

      // 이벤트 발생
      this.emitEvent('activity:timeout', {
        activityId: activity.activityId,
        timestamp: Date.now()
      });
    },

    // ========================================
    // 14. 답안 검증 (예제)
    // ========================================
    validateAnswer(container, params) {
      // 실제 검증 로직 구현
      // 예: 입력 필드가 비어있지 않으면 정답으로 간주
      const inputs = container.querySelectorAll('input');
      return Array.from(inputs).every(input => input.value.trim() !== '');
    },

    // ========================================
    // 15. 피드백 표시
    // ========================================
    showFeedback(container, isCorrect, customMessage = null) {
      const feedback = container.querySelector('.my-plugin-feedback');
      const message = container.querySelector('.feedback-message');

      if (!feedback || !message) return;

      feedback.style.display = 'block';
      feedback.className = 'my-plugin-feedback ' + (isCorrect ? 'success' : 'error');
      message.textContent = customMessage || (isCorrect ? '정답입니다! 🎉' : '다시 시도해보세요. 💪');
    },

    // ========================================
    // 16. 이벤트 발생 (플랫폼 이벤트 시스템 연동)
    // ========================================
    emitEvent(eventType, data) {
      if (typeof window.dispatchEduEvent === 'function') {
        window.dispatchEduEvent(eventType, data);
      }

      // 커스텀 이벤트도 발생
      const event = new CustomEvent(`plugin:${this.name}:${eventType}`, {
        detail: data,
        bubbles: true
      });
      document.dispatchEvent(event);
    },

    // ========================================
    // 17. 정리 (cleanup) - 메모리 누수 방지
    // ========================================
    cleanup(container) {
      // 타이머 정리
      const timerId = container.dataset.timerId;
      if (timerId) {
        clearInterval(timerId);
      }

      // 이벤트 리스너 제거 (addEventListener로 추가한 경우)
      // 브라우저가 자동으로 정리하지만, 명시적으로 제거하는 것이 좋음
      const buttons = container.querySelectorAll('.my-plugin-btn');
      buttons.forEach(btn => {
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
      });

      console.log(`🧹 ${this.name} 정리 완료`);
    },

    // ========================================
    // 18. 에러 렌더링
    // ========================================
    renderError(container, errorMessage) {
      container.innerHTML = `
        <div class="my-plugin-error">
          <h3>❌ 오류 발생</h3>
          <p>${this.escapeHtml(errorMessage)}</p>
        </div>
      `;
    },

    // ========================================
    // 19. HTML 이스케이프 (XSS 방지)
    // ========================================
    escapeHtml(unsafe) {
      if (typeof unsafe !== 'string') return '';
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  // ========================================
  // 20. 플러그인 등록 (필수)
  // ========================================
  if (typeof window.registerEduPlugin === 'function') {
    window.registerEduPlugin(
      MyAwesomePlugin.name,
      MyAwesomePlugin.version,
      MyAwesomePlugin
    );
    console.log(`✅ ${MyAwesomePlugin.name}@${MyAwesomePlugin.version} 등록 완료`);
  } else {
    console.warn('⚠️ 플러그인 시스템이 로드되지 않았습니다. window.registerEduPlugin이 없습니다.');
  }

  // 전역 객체에도 노출 (디버깅용, 선택사항)
  global.MyAwesomePlugin = MyAwesomePlugin;

})(typeof window !== 'undefined' ? window : this);
```

---

### Step 2: 로컬 테스트 🧪

#### 2-1. 테스트 페이지 생성 (test.html)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Awesome Plugin - Test</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }

    .test-header {
      text-align: center;
      color: white;
      margin-bottom: 2rem;
    }

    .test-header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .test-controls {
      max-width: 900px;
      margin: 0 auto 2rem;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .test-controls button {
      padding: 0.75rem 1.5rem;
      margin-right: 1rem;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      background: #667eea;
      color: white;
    }

    .test-controls button:hover {
      background: #5568d3;
    }

    #plugin-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .event-log {
      max-width: 900px;
      margin: 2rem auto;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .event-log h3 {
      margin-bottom: 1rem;
      color: #374151;
    }

    .event-log pre {
      background: #f3f4f6;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="test-header">
    <h1>🧪 My Awesome Plugin Test</h1>
    <p>플러그인 테스트 페이지</p>
  </div>

  <div class="test-controls">
    <button onclick="runTest1()">테스트 1: 기본</button>
    <button onclick="runTest2()">테스트 2: 타이머 포함</button>
    <button onclick="runTest3()">테스트 3: 커스텀 테마</button>
    <button onclick="clearContainer()">초기화</button>
  </div>

  <div id="plugin-container"></div>

  <div class="event-log">
    <h3>📋 이벤트 로그</h3>
    <pre id="event-log"></pre>
  </div>

  <!-- 1. 플러그인 시스템 로드 (실제 환경에서는 플랫폼이 제공) -->
  <script>
    // 간단한 플러그인 시스템 시뮬레이션
    window.plugins = {};
    
    window.registerEduPlugin = function(name, version, plugin) {
      const key = `${name}@${version}`;
      window.plugins[key] = plugin;
      console.log(`✅ 플러그인 등록: ${key}`);
    };

    window.dispatchEduEvent = function(eventType, data) {
      console.log(`📢 이벤트:`, eventType, data);
      const log = document.getElementById('event-log');
      log.textContent += `[${new Date().toLocaleTimeString()}] ${eventType}\n${JSON.stringify(data, null, 2)}\n\n`;
    };
  </script>

  <!-- 2. 플러그인 로드 -->
  <script src="index.js"></script>

  <!-- 3. 테스트 스크립트 -->
  <script>
    const container = document.getElementById('plugin-container');

    function runTest1() {
      const activity = {
        activityId: 'test-1',
        template: 'my-awesome-plugin@1.0.0',
        params: {
          title: '기본 테스트',
          content: '이것은 기본 테스트입니다.',
          showTimer: false
        }
      };

      const plugin = window.plugins['my-awesome-plugin@1.0.0'];
      if (plugin) {
        plugin.render(activity, container);
      } else {
        console.error('플러그인을 찾을 수 없습니다');
      }
    }

    function runTest2() {
      const activity = {
        activityId: 'test-2',
        template: 'my-awesome-plugin@1.0.0',
        params: {
          title: '타이머 테스트',
          content: '30초 안에 완료하세요!',
          showTimer: true,
          timeLimit: 30
        }
      };

      const plugin = window.plugins['my-awesome-plugin@1.0.0'];
      if (plugin) {
        plugin.render(activity, container);
      }
    }

    function runTest3() {
      const activity = {
        activityId: 'test-3',
        template: 'my-awesome-plugin@1.0.0',
        params: {
          title: '커스텀 테마 테스트',
          content: '다크 테마가 적용되었습니다.',
          theme: 'dark',
          showTimer: false
        }
      };

      const plugin = window.plugins['my-awesome-plugin@1.0.0'];
      if (plugin) {
        plugin.render(activity, container);
      }
    }

    function clearContainer() {
      container.innerHTML = '';
      document.getElementById('event-log').textContent = '';
    }

    // 페이지 로드 시 첫 번째 테스트 실행
    window.addEventListener('load', () => {
      runTest1();
    });
  </script>
</body>
</html>
```

#### 2-2. 로컬 서버 실행

```bash
# 방법 1: Python (Python 3 권장)
cd my-awesome-plugin
python3 -m http.server 8080

# 방법 2: Python 2
python -m SimpleHTTPServer 8080

# 방법 3: Node.js (http-server 패키지)
npx http-server -p 8080

# 방법 4: PHP
php -S localhost:8080
```

#### 2-3. 브라우저에서 테스트

```
http://localhost:8080/test.html
```

**체크리스트**:
- [ ] 플러그인이 정상적으로 로드되는가?
- [ ] 3가지 테스트 시나리오가 모두 작동하는가?
- [ ] 이벤트 로그가 정상적으로 기록되는가?
- [ ] 콘솔에 에러가 없는가?
- [ ] 모바일 화면에서도 잘 보이는가? (개발자 도구 활용)

---

### Step 3: CDN 배포 📦

#### Option A: GitHub + jsDelivr (추천)

```bash
# 1. GitHub 저장소 생성
# https://github.com/new

# 2. 로컬 저장소 초기화 및 푸시
git init
git add .
git commit -m "feat: Initial release of my-awesome-plugin v1.0.0"

# 3. 원격 저장소 연결
git remote add origin https://github.com/YOUR_USERNAME/my-awesome-plugin.git
git branch -M main
git push -u origin main

# 4. 태그 생성 (버전 관리)
git tag v1.0.0
git push origin v1.0.0

# 5. jsDelivr CDN URL 자동 생성 (즉시 사용 가능)
# https://cdn.jsdelivr.net/gh/YOUR_USERNAME/my-awesome-plugin@1.0.0/index.js
```

**장점**:
- ✅ 무료
- ✅ 즉시 사용 가능 (빌드 불필요)
- ✅ 전 세계 CDN
- ✅ 버전 관리 자동화

#### Option B: npm + unpkg

```bash
# 1. package.json 생성
cat > package.json << 'EOF'
{
  "name": "@yourname/my-awesome-plugin",
  "version": "1.0.0",
  "description": "놀라운 교육 플러그인",
  "main": "index.js",
  "keywords": ["education", "plugin", "template"],
  "author": "Your Name <you@example.com>",
  "license": "MIT"
}
EOF

# 2. npm 로그인
npm login

# 3. npm 발행
npm publish --access public

# 4. unpkg CDN URL (자동 생성)
# https://unpkg.com/@yourname/my-awesome-plugin@1.0.0/index.js
```

#### Option C: 자체 서버 호스팅

```nginx
# nginx 설정 예제
location /plugins/ {
    alias /var/www/plugins/;
    add_header Access-Control-Allow-Origin *;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

```
# URL
https://yourdomain.com/plugins/my-awesome-plugin/v1.0.0/index.js
```

---

### Step 4: 플랫폼 등록 🔗

#### 방법 1: 직접 HTML에서 로드

```html
<!-- index.html 또는 lesson-player.html -->
<script>
  // 플랫폼 초기화 후
  async function loadExternalPlugins() {
    const plugins = [
      'https://cdn.jsdelivr.net/gh/YOUR_USERNAME/my-awesome-plugin@1.0.0/index.js',
      // 추가 플러그인 URL...
    ];

    for (const url of plugins) {
      await window.PluginSystem.loadExternalPlugin(url);
    }
  }

  // 플랫폼 준비 완료 시 실행
  window.addEventListener('platform:ready', () => {
    loadExternalPlugins();
  });
</script>
```

#### 방법 2: 설정 파일로 관리 (권장)

```typescript
// src/config/plugins.ts
export const externalPlugins = [
  {
    id: 'my-awesome-plugin@1.0.0',
    name: 'My Awesome Plugin',
    description: '놀라운 기능을 제공하는 플러그인',
    url: 'https://cdn.jsdelivr.net/gh/YOUR_USERNAME/my-awesome-plugin@1.0.0/index.js',
    version: '1.0.0',
    author: 'Your Name',
    enabled: true,
    category: 'interaction',
    tags: ['quiz', 'interactive', 'timer']
  },
  // 추가 플러그인...
];
```

```typescript
// src/services/PluginLoader.ts
import { externalPlugins } from '../config/plugins';

export class PluginLoader {
  static async loadAllExternalPlugins() {
    const enabledPlugins = externalPlugins.filter(p => p.enabled);
    
    for (const plugin of enabledPlugins) {
      try {
        await this.loadPlugin(plugin.url);
        console.log(`✅ ${plugin.name} 로드 완료`);
      } catch (error) {
        console.error(`❌ ${plugin.name} 로드 실패:`, error);
      }
    }
  }

  static async loadPlugin(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.head.appendChild(script);
    });
  }
}
```

#### 방법 3: 관리자 페이지에서 등록

```typescript
// 플러그인 관리 UI (admin-plugins.html)
interface PluginConfig {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

class PluginManager {
  private plugins: PluginConfig[] = [];

  loadFromStorage() {
    const stored = localStorage.getItem('external-plugins');
    if (stored) {
      this.plugins = JSON.parse(stored);
    }
  }

  saveToStorage() {
    localStorage.setItem('external-plugins', JSON.stringify(this.plugins));
  }

  addPlugin(config: PluginConfig) {
    this.plugins.push(config);
    this.saveToStorage();
  }

  togglePlugin(id: string) {
    const plugin = this.plugins.find(p => p.id === id);
    if (plugin) {
      plugin.enabled = !plugin.enabled;
      this.saveToStorage();
    }
  }
}
```

---

### Step 5: 레슨에서 사용 📝

#### 5-1. 레슨 JSON에 추가

```json
{
  "lessonId": "lesson-awesome-001",
  "title": "나의 첫 번째 레슨",
  "description": "My Awesome Plugin을 사용하는 레슨",
  "metadata": {
    "version": "1.0.0",
    "author": "Your Name",
    "createdAt": "2025-10-21"
  },
  "flow": [
    {
      "activityId": "activity-1",
      "template": "my-awesome-plugin@1.0.0",
      "params": {
        "title": "활동 1: 기본 사용",
        "content": "이것은 첫 번째 활동입니다.",
        "showTimer": false,
        "difficulty": "easy"
      }
    },
    {
      "activityId": "activity-2",
      "template": "my-awesome-plugin@1.0.0",
      "params": {
        "title": "활동 2: 타이머 사용",
        "content": "30초 안에 완료하세요!",
        "showTimer": true,
        "timeLimit": 30,
        "difficulty": "medium"
      }
    },
    {
      "activityId": "activity-3",
      "template": "multiple-choice@1.0.0",
      "params": {
        "question": "이 플러그인이 마음에 드시나요?",
        "options": ["매우 좋음", "좋음", "보통", "별로"]
      }
    }
  ]
}
```

#### 5-2. 레슨 플레이어에서 실행

```typescript
// lesson-player에서 자동으로 처리
import { LessonPlayer } from './LessonPlayer';

const player = new LessonPlayer('lesson-container');

// 레슨 로드
await player.loadLesson('lesson-awesome-001.json');

// 플레이 시작
await player.play();
```

---

## 📊 방식 2: 내장 템플릿 추가 (고급)

내장 템플릿으로 추가하려면 TypeScript로 작성하고 빌드 과정이 필요합니다.

### 간단한 프로세스

```bash
# 1. 코어 저장소 클론
git clone https://github.com/UnimationKorea/core_plugin.git
cd core_plugin

# 2. 템플릿 파일 생성
mkdir -p src/templates/myAwesomeTemplate
touch src/templates/myAwesomeTemplate/MyAwesomeTemplate.ts
touch src/templates/myAwesomeTemplate/types.ts

# 3. 템플릿 구현 (TypeScript)
# ... 코드 작성 ...

# 4. 템플릿 등록
# src/templates/index.ts에 추가

# 5. 빌드
npm run build

# 6. 테스트
npm run dev

# 7. 커밋 및 배포
git add .
git commit -m "feat: Add MyAwesome template"
git push
```

**자세한 내용은 별도 문서 참조**:
- `INTERNAL_TEMPLATE_GUIDE.md` (작성 예정)

---

## 🔍 디버깅 및 문제 해결

### 문제 1: 플러그인이 로드되지 않음

**증상**:
```
console: ⚠️ 플러그인 시스템이 로드되지 않았습니다
```

**해결책**:
1. `window.registerEduPlugin` 함수가 존재하는지 확인
2. 플러그인 시스템이 먼저 로드되었는지 확인 (스크립트 순서)
3. CDN URL이 올바른지 확인
4. CORS 에러가 없는지 확인

### 문제 2: CORS 에러

**증상**:
```
Access to script at '...' from origin '...' has been blocked by CORS policy
```

**해결책**:
- jsDelivr, unpkg 같은 CORS를 허용하는 CDN 사용
- 자체 서버의 경우 CORS 헤더 추가:
  ```
  Access-Control-Allow-Origin: *
  ```

### 문제 3: 이벤트가 발생하지 않음

**증상**:
```
이벤트 로그에 아무것도 표시되지 않음
```

**해결책**:
1. `window.dispatchEduEvent` 함수가 정의되어 있는지 확인
2. 이벤트 이름이 정확한지 확인 (`activity:started` 등)
3. 브라우저 콘솔에서 이벤트 리스너 확인

### 문제 4: 스타일이 적용되지 않음

**증상**:
```
플러그인은 로드되지만 스타일이 깨짐
```

**해결책**:
1. `injectStyles()` 함수가 호출되는지 확인
2. CSS 선택자가 정확한지 확인
3. 다른 스타일과 충돌하는지 확인 (특이성 문제)
4. `!important` 사용 고려 (최후의 수단)

---

## ✅ 체크리스트

### 개발 단계
- [ ] 플러그인 인터페이스 구현 (name, version, render)
- [ ] 기본 파라미터 정의 (getDefaultParams)
- [ ] 파라미터 검증 로직 (validate)
- [ ] HTML 생성 로직 (generateHTML)
- [ ] CSS 스타일 정의 (injectStyles)
- [ ] 이벤트 리스너 설정 (setupEventListeners)
- [ ] 이벤트 발생 (activity:started, completed, timeout)
- [ ] 정리 로직 (cleanup)
- [ ] XSS 방지 (escapeHtml)
- [ ] 에러 처리

### 테스트 단계
- [ ] 로컬 테스트 페이지 작성
- [ ] 3가지 이상 시나리오 테스트
- [ ] 모바일 반응형 확인
- [ ] 콘솔 에러 없음
- [ ] 이벤트 정상 발생

### 배포 단계
- [ ] README.md 작성
- [ ] 버전 태그 생성 (v1.0.0)
- [ ] GitHub에 푸시
- [ ] CDN URL 확인
- [ ] CDN에서 로드 테스트

### 통합 단계
- [ ] 플랫폼 설정 파일에 추가
- [ ] 관리자 페이지에 등록 (있는 경우)
- [ ] 샘플 레슨 작성
- [ ] 레슨 플레이어에서 테스트
- [ ] 문서 업데이트

---

## 📚 추가 리소스

- **상세 설계 문서**: `EXTERNAL_PLUGIN_DESIGN.md`
- **빠른 참조 가이드**: `PLUGIN_SYSTEM_SUMMARY.md`
- **Fill-in-Blanks 예제**: `plugins/fill-in-blanks-plugin.js`
- **검증 보고서**: `IMPLEMENTATION_VERIFICATION.md`

---

## 🎓 예제 플러그인 모음

### 1. 간단한 카운터 플러그인

```javascript
const CounterPlugin = {
  name: 'simple-counter',
  version: '1.0.0',
  
  getDefaultParams() {
    return { startValue: 0, maxValue: 10 };
  },
  
  async render(activity, container) {
    const params = { ...this.getDefaultParams(), ...activity.params };
    let count = params.startValue;
    
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <h2 id="count-display">${count}</h2>
        <button id="increment">+1</button>
        <button id="decrement">-1</button>
      </div>
    `;
    
    container.querySelector('#increment').onclick = () => {
      if (count < params.maxValue) {
        count++;
        container.querySelector('#count-display').textContent = count;
      }
    };
    
    container.querySelector('#decrement').onclick = () => {
      if (count > 0) {
        count--;
        container.querySelector('#count-display').textContent = count;
      }
    };
  }
};

if (window.registerEduPlugin) {
  window.registerEduPlugin(CounterPlugin.name, CounterPlugin.version, CounterPlugin);
}
```

### 2. 이미지 갤러리 플러그인

```javascript
const ImageGalleryPlugin = {
  name: 'image-gallery',
  version: '1.0.0',
  
  getDefaultParams() {
    return {
      images: [],
      autoPlay: false,
      interval: 3000
    };
  },
  
  async render(activity, container) {
    const params = { ...this.getDefaultParams(), ...activity.params };
    let currentIndex = 0;
    
    const html = `
      <div class="gallery">
        <img id="gallery-image" src="${params.images[0]}" alt="Gallery">
        <div class="gallery-controls">
          <button id="prev">◀ 이전</button>
          <span id="counter">1 / ${params.images.length}</span>
          <button id="next">다음 ▶</button>
        </div>
      </div>
    `;
    
    this.injectStyles();
    container.innerHTML = html;
    
    const updateImage = () => {
      container.querySelector('#gallery-image').src = params.images[currentIndex];
      container.querySelector('#counter').textContent = `${currentIndex + 1} / ${params.images.length}`;
    };
    
    container.querySelector('#prev').onclick = () => {
      currentIndex = (currentIndex - 1 + params.images.length) % params.images.length;
      updateImage();
    };
    
    container.querySelector('#next').onclick = () => {
      currentIndex = (currentIndex + 1) % params.images.length;
      updateImage();
    };
    
    if (params.autoPlay) {
      setInterval(() => {
        currentIndex = (currentIndex + 1) % params.images.length;
        updateImage();
      }, params.interval);
    }
  },
  
  injectStyles() {
    if (document.getElementById('image-gallery-styles')) return;
    const style = document.createElement('style');
    style.id = 'image-gallery-styles';
    style.textContent = `
      .gallery {
        max-width: 600px;
        margin: 0 auto;
        text-align: center;
      }
      .gallery img {
        width: 100%;
        border-radius: 12px;
        margin-bottom: 1rem;
      }
      .gallery-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .gallery-controls button {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        border: none;
        background: #3b82f6;
        color: white;
        border-radius: 8px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }
};

if (window.registerEduPlugin) {
  window.registerEduPlugin(ImageGalleryPlugin.name, ImageGalleryPlugin.version, ImageGalleryPlugin);
}
```

---

## 🚀 다음 단계

1. ✅ 이 가이드를 따라 첫 번째 플러그인 개발
2. 🧪 로컬 테스트 페이지에서 충분히 테스트
3. 📦 GitHub + jsDelivr로 배포
4. 🔗 플랫폼에 등록
5. 📝 샘플 레슨 작성 및 테스트
6. 📚 문서 작성 (README.md)
7. 🌟 커뮤니티에 공유

---

**작성일**: 2025-10-21  
**버전**: 1.0.0  
**문의**: plugin-support@unimationkorea.com
