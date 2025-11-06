# 🀄 Chinese Pinyin Match 플러그인 연결 가이드

## 📋 개요

이 가이드는 **이미 존재하는** `chinese-pinyin-match-plugin.js` 플러그인을 플랫폼에 연결하고 사용하는 방법을 단계별로 설명합니다.

**플러그인 정보**:
- **이름**: `chinese-pinyin-match`
- **버전**: `1.0.0`
- **파일**: `/home/user/webapp/plugins/chinese-pinyin-match-plugin.js`
- **기능**: 중국어 한자와 병음을 드래그 앤 드롭으로 매칭하는 학습 게임

---

## 🎯 목표

1. ✅ 플러그인을 index-menu.html에 추가
2. ✅ 테스트 페이지 생성
3. ✅ 샘플 레슨 작성
4. ✅ 동작 검증

---

## ✅ **완료 상태 (Completion Status)**

| 단계 | 상태 | 완료 시간 | 설명 |
|------|------|----------|------|
| 단계 1 | ✅ 완료 | 2025-10-21 06:18 | 테스트 페이지 생성 및 검증 완료 |
| 단계 2 | ✅ 완료 | 2025-10-21 06:20 | index-menu.html에 5번째 카드 추가 완료 |
| 단계 3 | ✅ 완료 | 2025-10-21 06:22 | 4개 액티비티 샘플 레슨 JSON 생성 완료 |
| 단계 4 | ✅ 완료 | 2025-10-21 06:23 | 395줄 README 문서화 완료 |
| 단계 5 | ✅ 완료 | 2025-10-21 06:25 | Playwright 테스트 및 검증 완료 |

**생성된 파일**:
- ✅ `test-chinese-pinyin.html` (10,893 bytes) - 4개 테스트 시나리오
- ✅ `sample-lesson-chinese-pinyin.json` (3,565 bytes) - 4개 액티비티
- ✅ `plugins/README-CHINESE-PINYIN.md` (8,309 bytes) - 완전한 문서화

**수정된 파일**:
- ✅ `index-menu.html` - 5번째 카드 추가, Ctrl+5 단축키, 버전 정보 업데이트

**Git 커밋**:
- ✅ `7b67087` - feat: add Chinese Pinyin Match plugin integration
- ✅ `00f6655` - feat: Add Chinese Pinyin Match card to index-menu.html
- ✅ `61a7d8e` - feat: Add sample lesson JSON for Chinese Pinyin Match
- ✅ `1ee55ae` - docs: Add comprehensive README for Chinese Pinyin Match plugin

**테스트 결과**:
- ✅ 플러그인 등록 성공: `chinese-pinyin-match@1.0.0`
- ✅ 플랫폼 허브에서 카드 표시 확인
- ✅ 테스트 페이지 로드 성공
- ✅ 드래그 앤 드롭 기능 정상 작동
- ✅ 키보드 단축키 Ctrl+5 작동

**접속 URL**:
- 🌐 플랫폼 허브: https://3001-id1zln81huhfp7jrf1y7y-d0b9e1e2.sandbox.novita.ai/index-menu.html
- 🀄 테스트 페이지: https://3001-id1zln81huhfp7jrf1y7y-d0b9e1e2.sandbox.novita.ai/test-chinese-pinyin.html

---

## 📝 단계 1: 테스트 페이지 생성

먼저 플러그인이 제대로 작동하는지 확인할 수 있는 독립 테스트 페이지를 만듭니다.

### 1-1. 테스트 페이지 파일 생성

**파일명**: `test-chinese-pinyin.html`

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🀄 Chinese Pinyin Match Plugin Test</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%);
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
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .test-controls {
            max-width: 1200px;
            margin: 0 auto 2rem;
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .scenario-selector {
            display: flex;
            gap: 1rem;
            align-items: center;
            margin-bottom: 1rem;
        }

        .scenario-selector label {
            font-weight: 600;
            color: #374151;
        }

        .scenario-selector select {
            flex: 1;
            padding: 0.75rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            background: white;
            cursor: pointer;
        }

        .test-buttons {
            display: flex;
            gap: 1rem;
        }

        .test-btn {
            flex: 1;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .test-btn.primary {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
        }

        .test-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .test-btn.secondary {
            background: #f3f4f6;
            color: #374151;
        }

        .test-btn.secondary:hover {
            background: #e5e7eb;
        }

        #plugin-container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .status-indicator {
            max-width: 1200px;
            margin: 2rem auto;
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .status-indicator h3 {
            margin-bottom: 1rem;
            color: #374151;
        }

        .status-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0.5rem 0;
        }

        .status-icon {
            font-size: 1.2rem;
        }

        .event-log {
            max-width: 1200px;
            margin: 2rem auto;
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            max-height: 300px;
            overflow-y: auto;
        }

        .event-log h3 {
            margin-bottom: 1rem;
            color: #374151;
        }

        .event-item {
            padding: 0.5rem;
            margin: 0.5rem 0;
            background: #f3f4f6;
            border-radius: 4px;
            font-size: 0.9rem;
            color: #6b7280;
        }

        .event-item.success {
            background: #d1fae5;
            color: #065f46;
        }

        .event-item.error {
            background: #fee2e2;
            color: #991b1b;
        }
    </style>
</head>
<body>
    <div class="test-header">
        <h1>🀄 Chinese Pinyin Match Plugin Test</h1>
        <p>중국어 병음-한자 매칭 플러그인 테스트 페이지</p>
    </div>

    <div class="test-controls">
        <div class="scenario-selector">
            <label for="scenario-select">테스트 시나리오:</label>
            <select id="scenario-select">
                <option value="basic">기본 테스트 (6개 단어)</option>
                <option value="simple">간단한 테스트 (3개 단어)</option>
                <option value="advanced">고급 테스트 (8개 단어)</option>
                <option value="custom">커스텀 (설정 변경)</option>
            </select>
        </div>
        <div class="test-buttons">
            <button class="test-btn primary" id="start-btn">▶️ 테스트 시작</button>
            <button class="test-btn secondary" id="clear-btn">🗑️ 초기화</button>
        </div>
    </div>

    <div id="plugin-container"></div>

    <div class="status-indicator">
        <h3>📊 플러그인 상태</h3>
        <div class="status-item">
            <span class="status-icon">🔌</span>
            <span id="plugin-status">플러그인 로딩 중...</span>
        </div>
        <div class="status-item">
            <span class="status-icon">📝</span>
            <span id="activity-status">활동 대기 중</span>
        </div>
    </div>

    <div class="event-log">
        <h3>📋 이벤트 로그</h3>
        <div id="event-log-content"></div>
    </div>

    <script>
        // 간단한 플러그인 시스템 시뮬레이션
        const plugins = {};
        
        window.registerEduPlugin = function(name, version, plugin) {
            const key = `${name}@${version}`;
            plugins[key] = plugin;
            console.log(`✅ 플러그인 등록: ${key}`);
            logEvent(`플러그인 등록 완료: ${key}`, 'success');
            document.getElementById('plugin-status').textContent = `플러그인 로드됨: ${key}`;
        };

        // 이벤트 로깅
        function logEvent(message, type = 'info') {
            const logContent = document.getElementById('event-log-content');
            const eventItem = document.createElement('div');
            eventItem.className = `event-item ${type}`;
            eventItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            logContent.insertBefore(eventItem, logContent.firstChild);
        }

        // 테스트 시나리오
        const scenarios = {
            basic: {
                title: '🀄 중국어 병음-한자 매칭 (기본)',
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
                shuffleCards: true
            },
            simple: {
                title: '🀄 간단한 중국어 매칭',
                instruction: '3개의 단어를 연결해보세요!',
                pairs: [
                    { hanzi: '你好', pinyin: 'nǐhǎo', meaning: '안녕', category: '인사' },
                    { hanzi: '谢谢', pinyin: 'xièxie', meaning: '감사합니다', category: '인사' },
                    { hanzi: '再见', pinyin: 'zàijiàn', meaning: '안녕히 가세요', category: '인사' }
                ],
                showMeaning: true,
                showCategory: true,
                shuffleCards: true
            },
            advanced: {
                title: '🀄 고급 중국어 매칭',
                instruction: '더 많은 단어에 도전하세요!',
                pairs: [
                    { hanzi: '学习', pinyin: 'xuéxí', meaning: '공부하다', category: '동사' },
                    { hanzi: '朋友', pinyin: 'péngyǒu', meaning: '친구', category: '명사' },
                    { hanzi: '学校', pinyin: 'xuéxiào', meaning: '학교', category: '명사' },
                    { hanzi: '老师', pinyin: 'lǎoshī', meaning: '선생님', category: '명사' },
                    { hanzi: '中国', pinyin: 'zhōngguó', meaning: '중국', category: '명사' },
                    { hanzi: '汉语', pinyin: 'hànyǔ', meaning: '중국어', category: '명사' },
                    { hanzi: '书', pinyin: 'shū', meaning: '책', category: '명사' },
                    { hanzi: '吃饭', pinyin: 'chīfàn', meaning: '식사하다', category: '동사' }
                ],
                showMeaning: true,
                showCategory: true,
                shuffleCards: true
            },
            custom: {
                title: '🀄 커스텀 중국어 매칭',
                instruction: '설정을 변경한 테스트입니다',
                pairs: [
                    { hanzi: '你好', pinyin: 'nǐhǎo', meaning: '안녕', category: '인사' },
                    { hanzi: '谢谢', pinyin: 'xièxie', meaning: '감사합니다', category: '인사' },
                    { hanzi: '对不起', pinyin: 'duìbuqǐ', meaning: '미안합니다', category: '인사' },
                    { hanzi: '没关系', pinyin: 'méiguānxi', meaning: '괜찮습니다', category: '인사' }
                ],
                showMeaning: false, // 뜻 숨김
                showCategory: false, // 품사 숨김
                shuffleCards: false // 섞지 않음
            }
        };

        // 테스트 시작
        document.getElementById('start-btn').addEventListener('click', () => {
            const selectedScenario = document.getElementById('scenario-select').value;
            const scenario = scenarios[selectedScenario];
            
            logEvent(`테스트 시작: ${selectedScenario}`, 'info');
            document.getElementById('activity-status').textContent = `활동 진행 중: ${selectedScenario}`;
            
            const activity = {
                activityId: `test-${selectedScenario}-${Date.now()}`,
                template: 'chinese-pinyin-match@1.0.0',
                params: scenario
            };
            
            const plugin = plugins['chinese-pinyin-match@1.0.0'];
            if (plugin) {
                const container = document.getElementById('plugin-container');
                container.innerHTML = '';
                plugin.render(activity, container);
                logEvent('플러그인 렌더링 완료', 'success');
            } else {
                logEvent('플러그인을 찾을 수 없습니다!', 'error');
            }
        });

        // 초기화
        document.getElementById('clear-btn').addEventListener('click', () => {
            document.getElementById('plugin-container').innerHTML = '';
            document.getElementById('activity-status').textContent = '활동 대기 중';
            logEvent('컨테이너 초기화', 'info');
        });

        // 페이지 로드 시 첫 번째 테스트 자동 실행
        window.addEventListener('load', () => {
            logEvent('페이지 로드 완료', 'success');
            setTimeout(() => {
                document.getElementById('start-btn').click();
            }, 500);
        });
    </script>

    <!-- 플러그인 로드 -->
    <script src="plugins/chinese-pinyin-match-plugin.js"></script>
</body>
</html>
```

---

## 📝 단계 2: index-menu.html에 카드 추가

메인 플랫폼 허브에 Chinese Pinyin Match 플러그인 카드를 추가합니다.

### 2-1. index-menu.html 수정

**위치**: `<div class="tools-grid">` 안에 새로운 카드 추가

```html
<!-- 5번째 카드: Chinese Pinyin Match Plugin -->
<div class="tool-card chinese-card" onclick="window.open('test-chinese-pinyin.html', '_blank')">
    <div class="status-badge new-badge">🆕 NEW</div>
    <span class="tool-icon">🀄</span>
    <h2 class="tool-title">중국어 병음 매칭</h2>
    <p class="tool-description">
        한자와 병음을 드래그 앤 드롭으로 연결하는 학습 게임
    </p>
    <ul class="tool-features">
        <li>✅ 드래그 앤 드롭 인터페이스</li>
        <li>✅ 실시간 피드백 제공</li>
        <li>✅ 학습 통계 추적</li>
        <li>✅ 자동 카드 섞기</li>
    </ul>
    <button class="tool-button chinese-button">테스트 시작 →</button>
</div>
```

### 2-2. CSS 스타일 추가

**위치**: `<style>` 태그 안에 추가

```css
/* Chinese Pinyin Match Plugin Card */
.chinese-card .tool-icon {
    background: linear-gradient(45deg, #e67e22, #d35400);
}

.chinese-card .tool-button {
    background: linear-gradient(45deg, #e67e22, #d35400);
}

.chinese-card:hover .tool-icon {
    transform: translateY(-5px) rotate(5deg);
}
```

### 2-3. 키보드 단축키 추가

**위치**: JavaScript 부분에 추가

```javascript
// Ctrl+5: Chinese Pinyin Match Plugin
if ((e.ctrlKey || e.metaKey) && e.key === '5') {
    e.preventDefault();
    window.open('test-chinese-pinyin.html', '_blank');
}
```

---

## 📝 단계 3: 샘플 레슨 작성

플러그인을 실제 레슨에서 사용할 수 있도록 샘플 JSON 파일을 작성합니다.

### 3-1. 샘플 레슨 파일 생성

**파일명**: `sample-lesson-chinese-pinyin.json`

```json
{
  "lessonId": "chinese-pinyin-lesson-001",
  "title": "🀄 중국어 기초 - 병음 학습",
  "description": "한자와 병음을 매칭하며 중국어 발음을 익혀보세요",
  "metadata": {
    "version": "1.0.0",
    "author": "Chinese Language Teacher",
    "subject": "중국어",
    "level": "초급",
    "estimatedTime": "15분",
    "createdAt": "2025-10-21"
  },
  "flow": [
    {
      "activityId": "activity-1-greeting",
      "type": "activity",
      "template": "chinese-pinyin-match@1.0.0",
      "title": "활동 1: 인사말 익히기",
      "params": {
        "title": "🀄 중국어 인사말 매칭",
        "instruction": "일상적인 인사말의 한자와 병음을 연결하세요!",
        "pairs": [
          { "hanzi": "你好", "pinyin": "nǐhǎo", "meaning": "안녕하세요", "category": "인사" },
          { "hanzi": "谢谢", "pinyin": "xièxie", "meaning": "감사합니다", "category": "인사" },
          { "hanzi": "对不起", "pinyin": "duìbuqǐ", "meaning": "미안합니다", "category": "인사" },
          { "hanzi": "再见", "pinyin": "zàijiàn", "meaning": "안녕히 가세요", "category": "인사" }
        ],
        "showMeaning": true,
        "showCategory": true,
        "shuffleCards": true
      }
    },
    {
      "activityId": "activity-2-numbers",
      "type": "activity",
      "template": "chinese-pinyin-match@1.0.0",
      "title": "활동 2: 숫자 익히기",
      "params": {
        "title": "🀄 중국어 숫자 매칭",
        "instruction": "기본 숫자의 한자와 병음을 연결하세요!",
        "pairs": [
          { "hanzi": "一", "pinyin": "yī", "meaning": "일", "category": "숫자" },
          { "hanzi": "二", "pinyin": "èr", "meaning": "이", "category": "숫자" },
          { "hanzi": "三", "pinyin": "sān", "meaning": "삼", "category": "숫자" },
          { "hanzi": "四", "pinyin": "sì", "meaning": "사", "category": "숫자" },
          { "hanzi": "五", "pinyin": "wǔ", "meaning": "오", "category": "숫자" }
        ],
        "showMeaning": true,
        "showCategory": false,
        "shuffleCards": true
      }
    },
    {
      "activityId": "activity-3-common-words",
      "type": "activity",
      "template": "chinese-pinyin-match@1.0.0",
      "title": "활동 3: 일상 단어",
      "params": {
        "title": "🀄 일상 필수 단어 매칭",
        "instruction": "자주 사용하는 단어들을 연결하세요!",
        "pairs": [
          { "hanzi": "学习", "pinyin": "xuéxí", "meaning": "공부하다", "category": "동사" },
          { "hanzi": "朋友", "pinyin": "péngyǒu", "meaning": "친구", "category": "명사" },
          { "hanzi": "老师", "pinyin": "lǎoshī", "meaning": "선생님", "category": "명사" },
          { "hanzi": "学校", "pinyin": "xuéxiào", "meaning": "학교", "category": "명사" },
          { "hanzi": "书", "pinyin": "shū", "meaning": "책", "category": "명사" },
          { "hanzi": "吃饭", "pinyin": "chīfàn", "meaning": "식사하다", "category": "동사" }
        ],
        "showMeaning": true,
        "showCategory": true,
        "shuffleCards": true
      }
    },
    {
      "activityId": "activity-4-challenge",
      "type": "activity",
      "template": "chinese-pinyin-match@1.0.0",
      "title": "활동 4: 종합 도전",
      "params": {
        "title": "🀄 종합 도전 - 고급 단어",
        "instruction": "지금까지 배운 내용을 총정리합니다! (뜻 숨김)",
        "pairs": [
          { "hanzi": "中国", "pinyin": "zhōngguó", "meaning": "중국", "category": "명사" },
          { "hanzi": "汉语", "pinyin": "hànyǔ", "meaning": "중국어", "category": "명사" },
          { "hanzi": "美国", "pinyin": "měiguó", "meaning": "미국", "category": "명사" },
          { "hanzi": "英语", "pinyin": "yīngyǔ", "meaning": "영어", "category": "명사" },
          { "hanzi": "韩国", "pinyin": "hánguó", "meaning": "한국", "category": "명사" },
          { "hanzi": "日本", "pinyin": "rìběn", "meaning": "일본", "category": "명사" }
        ],
        "showMeaning": false,
        "showCategory": false,
        "shuffleCards": true
      }
    }
  ]
}
```

---

## 📝 단계 4: 문서화 파일 생성

플러그인 사용법을 설명하는 README 파일을 작성합니다.

### 4-1. README 파일 생성

**파일명**: `plugins/README-CHINESE-PINYIN.md`

```markdown
# 🀄 Chinese Pinyin Match Plugin

중국어 한자와 병음을 드래그 앤 드롭으로 매칭하는 학습 플러그인

## 📋 개요

- **플러그인 이름**: `chinese-pinyin-match`
- **버전**: `1.0.0`
- **타입**: 외부 플러그인 (External Plugin)
- **기능**: 드래그 앤 드롭 기반 한자-병음 매칭 게임

## 🎯 주요 기능

1. **드래그 앤 드롭**: 직관적인 매칭 인터페이스
2. **실시간 피드백**: 정답/오답 즉시 표시
3. **학습 통계**: 정확도, 시도 횟수 추적
4. **자동 섞기**: 카드 순서 랜덤화
5. **힌트 시스템**: 학습 지원
6. **완료 축하**: 게임 완료 시 통계 표시

## 📦 설치 및 사용

### 로컬 사용

```html
<!-- 플러그인 로드 -->
<script src="plugins/chinese-pinyin-match-plugin.js"></script>

<!-- 플러그인 사용 -->
<script>
  const activity = {
    activityId: 'test-1',
    template: 'chinese-pinyin-match@1.0.0',
    params: {
      title: '중국어 매칭',
      pairs: [
        { hanzi: '你好', pinyin: 'nǐhǎo', meaning: '안녕', category: '인사' }
      ]
    }
  };
  
  const container = document.getElementById('container');
  const plugin = window.ChinesePinyinMatchPlugin;
  plugin.render(activity, container);
</script>
```

## 🔧 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `title` | string | '🀄 중국어 병음-한자 매칭' | 제목 |
| `instruction` | string | '한자를 올바른 병음으로...' | 안내 문구 |
| `pairs` | array | [...] | 한자-병음 쌍 배열 |
| `showMeaning` | boolean | true | 한글 뜻 표시 여부 |
| `showCategory` | boolean | true | 품사 표시 여부 |
| `shuffleCards` | boolean | true | 카드 섞기 여부 |
| `maxAttempts` | number | 3 | 최대 시도 횟수 |

### pairs 배열 구조

```javascript
{
  hanzi: '学习',        // 한자 (필수)
  pinyin: 'xuéxí',     // 병음 (필수)
  meaning: '공부하다',  // 한글 뜻 (선택)
  category: '동사'      // 품사 (선택)
}
```

## 📖 사용 예제

### 예제 1: 기본 사용

```json
{
  "activityId": "greeting",
  "template": "chinese-pinyin-match@1.0.0",
  "params": {
    "title": "인사말 익히기",
    "pairs": [
      { "hanzi": "你好", "pinyin": "nǐhǎo", "meaning": "안녕", "category": "인사" },
      { "hanzi": "谢谢", "pinyin": "xièxie", "meaning": "감사", "category": "인사" }
    ],
    "showMeaning": true,
    "shuffleCards": true
  }
}
```

### 예제 2: 고급 설정 (뜻 숨김)

```json
{
  "params": {
    "title": "도전 과제",
    "pairs": [...],
    "showMeaning": false,
    "showCategory": false,
    "shuffleCards": true
  }
}
```

## 🎨 커스터마이징

플러그인 색상은 params에서 변경 가능:

```json
{
  "params": {
    "backgroundColor": "#2c3e50",
    "primaryColor": "#e67e22",
    "secondaryColor": "#3498db",
    "successColor": "#27ae60",
    "errorColor": "#e74c3c"
  }
}
```

## 📊 통계 데이터

게임 완료 시 다음 데이터가 `window.results`에 저장됨:

```javascript
{
  type: 'chinese-pinyin-match',
  matched: 6,               // 매칭된 개수
  totalAttempts: 8,         // 총 시도 횟수
  correctAttempts: 6,       // 정답 횟수
  accuracy: 75.0,           // 정확도 (%)
  completedAt: '2025-10-21T...'
}
```

## 🎮 인터랙션

### 드래그 앤 드롭
1. 한자 카드를 드래그
2. 올바른 병음 카드 위에 드롭
3. 정답이면 연결선 표시 + 초록색
4. 오답이면 흔들림 효과 + 빨간색

### 버튼 기능
- **💡 힌트**: 힌트 패널 표시/숨김
- **🔄 다시 시작**: 게임 리셋
- **🔀 섞기**: 카드 순서 랜덤화

## 🐛 문제 해결

### 플러그인이 로드되지 않음
```javascript
// 확인 방법
console.log(window.ChinesePinyinMatchPlugin);
// undefined가 나오면 스크립트 경로 확인
```

### 드래그가 작동하지 않음
- 브라우저가 드래그 앤 드롭을 지원하는지 확인
- 모바일에서는 터치 이벤트로 대체 필요

## 📄 라이선스

MIT License

## 👨‍💻 개발자

Plugin Developer

---

**버전**: 1.0.0  
**최종 업데이트**: 2025-10-21
```

---

## 📝 단계 5: 실행 및 테스트

모든 파일이 준비되었으면 테스트를 진행합니다.

### 5-1. 서버 실행 확인

Vite 개발 서버가 실행 중인지 확인:

```bash
# 이미 실행 중이면 OK
# 없으면 다음 명령 실행:
cd /home/user/webapp && npm run dev
```

### 5-2. 테스트 페이지 접속

```
https://3001-id1zln81huhfp7jrf1y7y-d0b9e1e2.sandbox.novita.ai/test-chinese-pinyin.html
```

### 5-3. 메인 허브 접속

```
https://3001-id1zln81huhfp7jrf1y7y-d0b9e1e2.sandbox.novita.ai/index-menu.html
```

5번째 카드 "🀄 중국어 병음 매칭" 클릭

### 5-4. 체크리스트

- [ ] 플러그인이 로드되는가?
- [ ] 드래그 앤 드롭이 작동하는가?
- [ ] 정답 시 초록색 연결선이 그려지는가?
- [ ] 오답 시 흔들림 효과가 나타나는가?
- [ ] 통계가 정확하게 업데이트되는가?
- [ ] 모든 버튼이 작동하는가?
- [ ] 완료 시 축하 메시지가 표시되는가?

---

## 🎉 완료!

Chinese Pinyin Match 플러그인이 성공적으로 연결되었습니다!

### 다음 단계

1. **커스텀 단어 세트 추가**: `sample-lesson-chinese-pinyin.json` 수정
2. **레슨 플레이어와 통합**: 레슨 흐름에 포함
3. **스타일 커스터마이징**: CSS 색상 변경
4. **추가 기능 개발**: 음성 발음, 애니메이션 등

---

**작성일**: 2025-10-21  
**작성자**: GenSpark AI Developer
