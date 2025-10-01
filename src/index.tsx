import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Static file serving will be handled by Cloudflare Pages automatically

// API Routes
app.get('/api/templates', async (c) => {
  // 템플릿 카탈로그 반환 (추후 D1에서 조회)
  const templates = [
    {
      id: 'video@2.0.0',
      name: 'Video Player',
      category: 'media',
      capabilities: ['autoplay', 'controls'],
      paramsSchema: {
        type: 'object',
        properties: {
          src: { type: 'string', description: 'Video source URL' },
          autoplay: { type: 'boolean', default: false }
        },
        required: ['src']
      }
    },
    {
      id: 'drag-drop-choices@2.0.0',
      name: 'Drag & Drop Multiple Choice',
      category: 'interaction',
      capabilities: ['drag', 'drop', 'keyboard'],
      paramsSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Question prompt' },
          choices: { type: 'array', items: { type: 'string' } },
          answer: { type: 'string', description: 'Correct answer' },
          image: { type: 'string', description: 'Optional image URL' }
        },
        required: ['prompt', 'choices', 'answer']
      }
    },
    {
      id: 'multiple-choice@1.0.0',
      name: '4지 선다형 문제',
      category: 'assessment',
      capabilities: ['keyboard', 'mouse', 'touch', 'audio'],
      paramsSchema: {
        type: 'object',
        properties: {
          question: { type: 'string', description: '문제 텍스트' },
          choices: { type: 'array', description: '선택지 목록' },
          correctAnswer: { description: '정답 ID(들)' },
          timeLimit: { type: 'number', description: '제한 시간 (초)' },
          allowMultiple: { type: 'boolean', description: '다중 선택 허용' },
          explanation: { type: 'string', description: '정답 해설' }
        },
        required: ['question', 'choices', 'correctAnswer']
      }
    },
    {
      id: 'memory-game@1.0.0',
      name: '메모리 게임',
      category: 'game',
      capabilities: ['keyboard', 'mouse', 'touch'],
      paramsSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '게임 제목' },
          cards: { type: 'array', description: '카드 목록 (짝수 개수 필요)' },
          gridSize: { type: 'string', description: '그리드 크기' },
          timeLimit: { type: 'number', description: '제한 시간 (초)' },
          allowRetries: { type: 'boolean', description: '재시도 허용' }
        },
        required: ['title', 'cards']
      }
    },
    {
      id: 'word-guess@1.0.0',
      name: '단어 맞추기',
      category: 'game',
      capabilities: ['keyboard', 'mouse', 'touch', 'timer'],
      paramsSchema: {
        type: 'object',
        properties: {
          word: { 
            type: 'string', 
            description: '맞춰야 할 단어 (3-15자)',
            minLength: 3,
            maxLength: 15
          },
          hint: { 
            type: 'string', 
            description: '단어에 대한 힌트',
            maxLength: 200
          },
          category: {
            type: 'string',
            description: '단어 카테고리',
            enum: ['동물', '음식', '직업', '색깔', '나라', '기타'],
            default: '기타'
          },
          maxAttempts: {
            type: 'number',
            description: '최대 시도 횟수 (3-10)',
            minimum: 3,
            maximum: 10,
            default: 6
          },
          showHintAfter: {
            type: 'number',
            description: '몇 번 틀린 후 힌트 표시 (1-5)',
            minimum: 1,
            maximum: 5,
            default: 3
          },
          timeLimit: {
            type: 'number',
            description: '제한 시간(초), 0이면 무제한',
            minimum: 0,
            maximum: 600,
            default: 0
          },
          difficulty: {
            type: 'string',
            description: '난이도',
            enum: ['쉬움', '보통', '어려움'],
            default: '보통'
          }
        },
        required: ['word', 'hint']
      }
    }
  ]
  return c.json({ templates })
})

app.get('/api/lessons/:id', async (c) => {
  const lessonId = c.req.param('id')
  // 추후 D1에서 레슨 데이터 조회
  return c.json({ error: 'Not implemented' }, 501)
})

app.post('/api/lessons', async (c) => {
  const lessonData = await c.req.json()
  // 추후 D1에 레슨 데이터 저장
  return c.json({ error: 'Not implemented' }, 501)
})

// Serve sample lesson files
const sampleLessons = {
  'sample-lesson-multiple-choice.json': {
    "lessonId": "multiple-choice-demo-001",
    "title": "4지 선다형 문제 데모",
    "locale": "ko",
    "version": "1.0.0",
    "flow": [
      {
        "activityId": "korean-grammar-question",
        "template": "multiple-choice@1.0.0",
        "params": {
          "question": "다음 문장에서 빈 칸에 들어갈 적절한 조사는 무엇입니까?\\n\\n'이 책___ 매우 재미있습니다.'",
          "choices": [
            { "id": "choice-a", "text": "은" },
            { "id": "choice-b", "text": "는" },
            { "id": "choice-c", "text": "이" },
            { "id": "choice-d", "text": "가" }
          ],
          "correctAnswer": "choice-a",
          "allowMultiple": false,
          "shuffle": true,
          "timeLimit": 30,
          "explanation": "'책'은 받침이 있으므로 '은'을 사용합니다. '은/는'은 주제를 나타내는 조사입니다.",
          "showFeedback": true,
          "hints": [
            "'책'에 받침이 있는지 확인해보세요.",
            "주제를 나타내는 조사는 '은/는'입니다."
          ]
        },
        "rules": {
          "scoreWeight": 1,
          "required": true
        }
      },
      {
        "activityId": "math-multiple-selection",
        "template": "multiple-choice@1.0.0",
        "params": {
          "question": "다음 중 소수(Prime Number)에 해당하는 것을 모두 선택하세요.",
          "choices": [
            { "id": "choice-a", "text": "2" },
            { "id": "choice-b", "text": "3" },
            { "id": "choice-c", "text": "4" },
            { "id": "choice-d", "text": "5" }
          ],
          "correctAnswer": ["choice-a", "choice-b", "choice-d"],
          "allowMultiple": true,
          "shuffle": true,
          "timeLimit": 45,
          "explanation": "소수는 1과 자기 자신으로만 나누어지는 1보다 큰 자연수입니다. 2, 3, 5가 소수입니다. 4는 2×2이므로 소수가 아닙니다.",
          "showFeedback": true,
          "hints": [
            "소수의 정의를 다시 생각해보세요.",
            "4는 2로 나누어집니다."
          ]
        },
        "rules": {
          "scoreWeight": 2,
          "required": true
        }
      }
    ],
    "grading": {
      "mode": "weighted-sum",
      "passLine": 0.7,
      "showScores": true,
      "showProgress": true
    },
    "metadata": {
      "author": "Education Team",
      "createdAt": "2024-01-15T10:00:00Z",
      "tags": ["multiple-choice", "korean", "math"],
      "difficulty": "intermediate",
      "estimatedTime": 10
    }
  },
  'sample-lesson-memory-game.json': {
    "lessonId": "memory-game-demo-001",
    "title": "메모리 게임 데모",
    "locale": "ko",
    "version": "1.0.0",
    "flow": [
      {
        "activityId": "korean-family-memory",
        "template": "memory-game@1.0.0",
        "params": {
          "title": "🏠 가족 관련 단어 기억하기",
          "cards": [
            { "id": "card-1", "content": "아버지", "type": "text", "matchId": "father" },
            { "id": "card-2", "content": "Father", "type": "text", "matchId": "father" },
            { "id": "card-3", "content": "어머니", "type": "text", "matchId": "mother" },
            { "id": "card-4", "content": "Mother", "type": "text", "matchId": "mother" }
          ],
          "gridSize": "4x4",
          "timeLimit": 120,
          "allowRetries": true,
          "shuffle": true
        }
      }
    ],
    "grading": {
      "mode": "pass-fail",
      "passLine": 0.6,
      "showScores": true,
      "showProgress": true
    },
    "metadata": {
      "author": "Education Team",
      "createdAt": "2024-01-15T10:00:00Z",
      "tags": ["memory", "korean", "family"],
      "difficulty": "beginner",
      "estimatedTime": 5
    }
  },
  'sample-lesson-word-guess.json': {
    "lessonId": "word-guess-demo-001",
    "title": "단어 맞추기 게임 모음",
    "locale": "ko",
    "version": "1.0.0",
    "flow": [
      {
        "activityId": "word-game-animals",
        "template": "word-guess@1.0.0",
        "params": {
          "word": "코끼리",
          "hint": "아프리카에 사는 큰 귀를 가진 회색 동물",
          "category": "동물",
          "maxAttempts": 6,
          "showHintAfter": 3,
          "timeLimit": 120,
          "difficulty": "쉬움"
        },
        "rules": {
          "scoreWeight": 1,
          "required": true
        }
      }
    ],
    "grading": {
      "mode": "weighted-sum",
      "passLine": 0.6,
      "showScores": true,
      "showProgress": true
    },
    "metadata": {
      "author": "Educational Platform Team",
      "createdAt": "2024-09-30T12:00:00.000Z",
      "tags": ["어휘", "게임", "한국어"],
      "difficulty": "mixed",
      "estimatedTime": 5
    }
  },
  'sample-lesson-mixed-templates.json': {
    "lessonId": "mixed-templates-demo-001",
    "title": "혼합 템플릿 종합 데모",
    "locale": "ko",
    "version": "1.0.0",
    "flow": [
      {
        "activityId": "intro-video",
        "template": "video@2.0.0",
        "params": {
          "src": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
          "autoplay": false,
          "controls": true
        },
        "rules": {
          "scoreWeight": 1,
          "required": true
        }
      },
      {
        "activityId": "vocabulary-memory-game",
        "template": "memory-game@1.0.0",
        "params": {
          "title": "📚 영어 단어 기억 게임",
          "cards": [
            { "id": "card-1", "content": "Apple", "type": "text", "matchId": "apple" },
            { "id": "card-2", "content": "🍎", "type": "emoji", "matchId": "apple" },
            { "id": "card-3", "content": "Book", "type": "text", "matchId": "book" },
            { "id": "card-4", "content": "📖", "type": "emoji", "matchId": "book" },
            { "id": "card-5", "content": "Car", "type": "text", "matchId": "car" },
            { "id": "card-6", "content": "🚗", "type": "emoji", "matchId": "car" },
            { "id": "card-7", "content": "House", "type": "text", "matchId": "house" },
            { "id": "card-8", "content": "🏠", "type": "emoji", "matchId": "house" }
          ],
          "gridSize": "4x4",
          "timeLimit": 90,
          "allowRetries": true,
          "maxAttempts": 3,
          "showTimer": true,
          "successMessage": "🎉 영단어를 잘 기억했습니다!",
          "failureMessage": "💪 다시 한 번 도전해보세요!",
          "shuffle": true
        },
        "rules": {
          "scoreWeight": 2,
          "required": true
        }
      },
      {
        "activityId": "grammar-quiz",
        "template": "multiple-choice@1.0.0",
        "params": {
          "question": "다음 중 올바른 영어 문장은?",
          "choices": [
            { "id": "choice-a", "text": "I have a apple." },
            { "id": "choice-b", "text": "I have an apple." },
            { "id": "choice-c", "text": "I have apple." },
            { "id": "choice-d", "text": "I has an apple." }
          ],
          "correctAnswer": "choice-b",
          "allowMultiple": false,
          "shuffle": true,
          "timeLimit": 30,
          "explanation": "'apple'은 모음으로 시작하므로 부정관사 'an'을 사용합니다.",
          "showFeedback": true,
          "hints": [
            "부정관사 'a'와 'an'의 사용법을 생각해보세요.",
            "'apple'의 첫 글자를 확인해보세요."
          ]
        },
        "rules": {
          "scoreWeight": 3,
          "required": true
        }
      },
      {
        "activityId": "drag-drop-exercise",
        "template": "drag-drop-choices@2.0.0",
        "params": {
          "prompt": "올바른 단어를 빈 칸에 드래그하세요: She ___ to school every day.",
          "choices": ["go", "goes", "going", "gone"],
          "answer": "goes",
          "allowMultiple": false,
          "shuffleChoices": true,
          "maxAttempts": 3,
          "showFeedback": true,
          "hints": [
            "주語가 3인칭 단수일 때의 동사 변화를 생각해보세요.",
            "'She'는 3인칭 단수입니다."
          ]
        },
        "rules": {
          "scoreWeight": 2,
          "required": true
        }
      },
      {
        "activityId": "comprehensive-quiz",
        "template": "multiple-choice@1.0.0",
        "params": {
          "question": "다음 중 복수형이 올바른 것을 모두 선택하세요.",
          "choices": [
            { "id": "choice-a", "text": "child → children" },
            { "id": "choice-b", "text": "foot → foots" },
            { "id": "choice-c", "text": "mouse → mice" },
            { "id": "choice-d", "text": "book → books" }
          ],
          "correctAnswer": ["choice-a", "choice-c", "choice-d"],
          "allowMultiple": true,
          "shuffle": true,
          "timeLimit": 60,
          "explanation": "불규칙 복수형: child→children, mouse→mice, foot→feet. 규칙 복수형: book→books.",
          "showFeedback": true,
          "hints": [
            "규칙 복수형과 불규칙 복수형을 구분해보세요.",
            "'foot'의 복수형은 'feet'입니다."
          ]
        },
        "rules": {
          "scoreWeight": 3,
          "required": true
        }
      }
    ],
    "grading": {
      "mode": "weighted-sum",
      "passLine": 0.7,
      "showScores": true,
      "showProgress": true
    },
    "metadata": {
      "author": "Education Team",
      "createdAt": "2024-01-15T10:00:00Z",
      "tags": ["mixed", "english", "vocabulary", "grammar", "comprehensive"],
      "difficulty": "intermediate",
      "estimatedTime": 25
    }
  }
}

// Sample lesson endpoints
app.get('/sample-lesson-multiple-choice.json', async (c) => {
  return c.json(sampleLessons['sample-lesson-multiple-choice.json'])
})

app.get('/sample-lesson-memory-game.json', async (c) => {
  return c.json(sampleLessons['sample-lesson-memory-game.json'])
})

app.get('/sample-lesson-word-guess.json', async (c) => {
  return c.json(sampleLessons['sample-lesson-word-guess.json'])
})

app.get('/sample-lesson-mixed-templates.json', async (c) => {
  return c.json(sampleLessons['sample-lesson-mixed-templates.json'])
})

// Test templates page
app.get('/test-new-templates.html', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>새 템플릿 테스트 - Multiple Choice & Memory Game</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #e6edf7;
            min-height: 100vh;
            font-family: Arial, sans-serif;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .lesson-container { background: #1e293b; border-radius: 12px; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .template-info { background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; }
        .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin: 0.5rem; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-primary:hover { background: #2563eb; }
        .btn-secondary { background: #475569; color: white; }
        .btn-secondary:hover { background: #334155; }
        .activity-container { background: #334155; border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem; min-height: 400px; }
        .sample-selection { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .sample-card { background: #475569; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.15s; border: 2px solid transparent; }
        .sample-card:hover { background: #64748b; border-color: #3b82f6; }
        .sample-card.active { border-color: #22c55e; background: rgba(34, 197, 94, 0.1); }
        .sample-title { font-weight: 600; color: #e6edf7; margin-bottom: 0.5rem; }
        .sample-description { font-size: 0.875rem; color: #94a3b8; line-height: 1.4; }
        .control-panel { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; margin-bottom: 1.5rem; padding: 1rem; background: rgba(15, 23, 42, 0.5); border-radius: 8px; }
        .status-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-ready { background: #22c55e; }
        .status-active { background: #3b82f6; }
        .status-complete { background: #f59e0b; }
    </style>
</head>
<body>
    <div class="container">
        <header class="text-center mb-8">
            <h1 class="text-4xl font-bold mb-4">
                <i class="fas fa-puzzle-piece mr-3"></i>
                새 템플릿 테스트
            </h1>
            <p class="text-xl text-gray-300">Multiple Choice & Memory Game 템플릿</p>
        </header>

        <!-- Multiple Choice Template Test -->
        <div class="lesson-container">
            <div class="template-info">
                <h2 class="text-2xl font-bold mb-2">
                    <i class="fas fa-check-square mr-2"></i>
                    Multiple Choice Template (4지 선다형)
                </h2>
                <p>단일/다중 선택, 타이머, 힌트, 해설 기능을 포함한 객관식 문제 템플릿</p>
            </div>

            <div class="sample-selection" id="mc-samples">
                <div class="sample-card" data-sample="korean-grammar">
                    <div class="sample-title">한국어 문법 문제</div>
                    <div class="sample-description">조사 '은/는' 사용법을 다루는 기초 문법 문제 (30초 제한)</div>
                </div>
                <div class="sample-card" data-sample="math-multiple">
                    <div class="sample-title">수학 다중 선택</div>
                    <div class="sample-description">소수 찾기 문제 - 다중 선택 허용 (45초 제한)</div>
                </div>
                <div class="sample-card" data-sample="science-chemistry">
                    <div class="sample-title">화학 공식 문제</div>
                    <div class="sample-description">물의 화학식 관련 문제 (이미지 포함, 60초 제한)</div>
                </div>
            </div>

            <div class="control-panel">
                <div class="status-indicator">
                    <span class="status-dot status-ready" id="mc-status-dot"></span>
                    <span id="mc-status">준비됨</span>
                </div>
                <button class="btn btn-primary" onclick="startMultipleChoice()">
                    <i class="fas fa-play mr-1"></i>선택한 샘플 시작
                </button>
                <button class="btn btn-secondary" onclick="resetMultipleChoice()">
                    <i class="fas fa-redo mr-1"></i>초기화
                </button>
            </div>

            <div class="activity-container" id="mc-container">
                <div class="text-center text-gray-400">
                    <i class="fas fa-mouse-pointer text-4xl mb-4"></i>
                    <p>위에서 샘플을 선택하고 시작 버튼을 클릭하세요.</p>
                </div>
            </div>
        </div>

        <!-- Memory Game Template Test -->
        <div class="lesson-container">
            <div class="template-info">
                <h2 class="text-2xl font-bold mb-2">
                    <i class="fas fa-brain mr-2"></i>
                    Memory Game Template (메모리 게임)
                </h2>
                <p>카드 매칭 기억 게임 - 텍스트, 이미지, 이모지 카드 지원</p>
            </div>

            <div class="sample-selection" id="mg-samples">
                <div class="sample-card" data-sample="korean-family">
                    <div class="sample-title">한국어 가족 단어</div>
                    <div class="sample-description">한국어-영어 가족 단어 매칭 (4x4 그리드, 120초)</div>
                </div>
                <div class="sample-card" data-sample="math-symbols">
                    <div class="sample-title">수학 기호 매칭</div>
                    <div class="sample-description">수학 기호와 의미 매칭 (4x6 그리드, 180초)</div>
                </div>
                <div class="sample-card" data-sample="animal-emoji">
                    <div class="sample-title">동물 이모지 게임</div>
                    <div class="sample-description">동물 이모지와 이름 매칭 (4x4 그리드, 240초)</div>
                </div>
            </div>

            <div class="control-panel">
                <div class="status-indicator">
                    <span class="status-dot status-ready" id="mg-status-dot"></span>
                    <span id="mg-status">준비됨</span>
                </div>
                <button class="btn btn-primary" onclick="startMemoryGame()">
                    <i class="fas fa-play mr-1"></i>선택한 샘플 시작
                </button>
                <button class="btn btn-secondary" onclick="resetMemoryGame()">
                    <i class="fas fa-redo mr-1"></i>초기화
                </button>
            </div>

            <div class="activity-container" id="mg-container">
                <div class="text-center text-gray-400">
                    <i class="fas fa-mouse-pointer text-4xl mb-4"></i>
                    <p>위에서 샘플을 선택하고 시작 버튼을 클릭하세요.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Load Orchestrator -->
    <script src="/static/js/orchestrator.js"></script>

    <script>
        // Sample data
        const mcSamples = {
            'korean-grammar': {
                question: "다음 문장에서 빈 칸에 들어갈 적절한 조사는 무엇입니까?\\n\\n'이 책___ 매우 재미있습니다.'",
                choices: [
                    { id: "choice-a", text: "은" },
                    { id: "choice-b", text: "는" },
                    { id: "choice-c", text: "이" },
                    { id: "choice-d", text: "가" }
                ],
                correctAnswer: "choice-a",
                allowMultiple: false,
                shuffle: true,
                timeLimit: 30,
                explanation: "'책'은 받침이 있으므로 '은'을 사용합니다. '은/는'은 주제를 나타내는 조사입니다.",
                showFeedback: true,
                hints: ["'책'에 받침이 있는지 확인해보세요.", "주제를 나타내는 조사는 '은/는'입니다."]
            },
            'math-multiple': {
                question: "다음 중 소수(Prime Number)에 해당하는 것을 모두 선택하세요.",
                choices: [
                    { id: "choice-a", text: "2" },
                    { id: "choice-b", text: "3" },
                    { id: "choice-c", text: "4" },
                    { id: "choice-d", text: "5" }
                ],
                correctAnswer: ["choice-a", "choice-b", "choice-d"],
                allowMultiple: true,
                shuffle: true,
                timeLimit: 45,
                explanation: "소수는 1과 자기 자신으로만 나누어지는 1보다 큰 자연수입니다. 2, 3, 5가 소수입니다. 4는 2×2이므로 소수가 아닙니다.",
                showFeedback: true,
                hints: ["소수의 정의를 다시 생각해보세요.", "4는 2로 나누어집니다."]
            },
            'science-chemistry': {
                question: "물(H₂O)에서 수소와 산소의 원자 개수 비는 몇 대 몇입니까?",
                choices: [
                    { id: "choice-a", text: "1 : 1" },
                    { id: "choice-b", text: "2 : 1" },
                    { id: "choice-c", text: "1 : 2" },
                    { id: "choice-d", text: "3 : 1" }
                ],
                correctAnswer: "choice-b",
                allowMultiple: false,
                shuffle: true,
                timeLimit: 60,
                explanation: "H₂O에서 수소(H) 원자는 2개, 산소(O) 원자는 1개이므로 비율은 2:1입니다.",
                showFeedback: true,
                hints: ["H₂O에서 아래 첨자 숫자를 확인하세요.", "H의 아래 첨자는 2, O는 1(생략됨)입니다."]
            }
        };

        const mgSamples = {
            'korean-family': {
                title: "🏠 가족 관련 단어 기억하기",
                cards: [
                    { id: "card-1", content: "아버지", type: "text", matchId: "father" },
                    { id: "card-2", content: "Father", type: "text", matchId: "father" },
                    { id: "card-3", content: "어머니", type: "text", matchId: "mother" },
                    { id: "card-4", content: "Mother", type: "text", matchId: "mother" },
                    { id: "card-5", content: "형/누나", type: "text", matchId: "sibling" },
                    { id: "card-6", content: "Brother/Sister", type: "text", matchId: "sibling" },
                    { id: "card-7", content: "할아버지", type: "text", matchId: "grandfather" },
                    { id: "card-8", content: "Grandfather", type: "text", matchId: "grandfather" }
                ],
                gridSize: "4x4",
                timeLimit: 120,
                allowRetries: true,
                maxAttempts: 5,
                showTimer: true,
                successMessage: "🎉 축하합니다! 가족 단어를 모두 매칭했습니다!",
                failureMessage: "😅 시간이 부족했네요. 다시 한 번 도전해보세요!",
                shuffle: true
            },
            'math-symbols': {
                title: "🔢 수학 기호와 의미 매칭",
                cards: [
                    { id: "card-1", content: "∑", type: "text", matchId: "summation" },
                    { id: "card-2", content: "합계 (Sum)", type: "text", matchId: "summation" },
                    { id: "card-3", content: "∫", type: "text", matchId: "integral" },
                    { id: "card-4", content: "적분 (Integral)", type: "text", matchId: "integral" },
                    { id: "card-5", content: "∞", type: "text", matchId: "infinity" },
                    { id: "card-6", content: "무한대 (Infinity)", type: "text", matchId: "infinity" },
                    { id: "card-7", content: "√", type: "text", matchId: "sqrt" },
                    { id: "card-8", content: "제곱근 (Square Root)", type: "text", matchId: "sqrt" }
                ],
                gridSize: "4x4",
                timeLimit: 180,
                allowRetries: true,
                maxAttempts: 3,
                showTimer: true,
                successMessage: "🎯 훌륭합니다! 모든 수학 기호를 올바르게 매칭했습니다!",
                failureMessage: "📚 수학 기호를 더 공부한 후 다시 도전해보세요!",
                shuffle: true
            },
            'animal-emoji': {
                title: "🦁 동물 이모지와 이름 매칭 도전!",
                cards: [
                    { id: "card-1", content: "🐘", type: "emoji", matchId: "elephant" },
                    { id: "card-2", content: "코끼리", type: "text", matchId: "elephant" },
                    { id: "card-3", content: "🦒", type: "emoji", matchId: "giraffe" },
                    { id: "card-4", content: "기린", type: "text", matchId: "giraffe" },
                    { id: "card-5", content: "🦓", type: "emoji", matchId: "zebra" },
                    { id: "card-6", content: "얼룩말", type: "text", matchId: "zebra" },
                    { id: "card-7", content: "🦏", type: "emoji", matchId: "rhino" },
                    { id: "card-8", content: "코뿔소", type: "text", matchId: "rhino" }
                ],
                gridSize: "4x4",
                timeLimit: 240,
                allowRetries: true,
                maxAttempts: 2,
                showTimer: true,
                successMessage: "🏆 놀라워요! 모든 동물을 완벽하게 매칭했습니다!",
                failureMessage: "🐾 동물들이 숨바꼭질을 잘하네요. 다시 도전해보세요!",
                shuffle: true
            }
        };

        // State management
        let currentMCSample = null;
        let currentMGSample = null;

        // Sample selection handlers
        document.getElementById('mc-samples').addEventListener('click', (e) => {
            const card = e.target.closest('.sample-card');
            if (card) {
                document.querySelectorAll('#mc-samples .sample-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentMCSample = card.dataset.sample;
            }
        });

        document.getElementById('mg-samples').addEventListener('click', (e) => {
            const card = e.target.closest('.sample-card');
            if (card) {
                document.querySelectorAll('#mg-samples .sample-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentMGSample = card.dataset.sample;
            }
        });

        // Multiple Choice functions
        async function startMultipleChoice() {
            if (!currentMCSample) {
                alert('먼저 샘플을 선택해주세요.');
                return;
            }

            updateStatus('mc', 'active', '실행 중');
            const container = document.getElementById('mc-container');
            const params = mcSamples[currentMCSample];

            try {
                const template = window.TemplateRegistry?.get('multiple-choice@1.0.0');
                if (!template) {
                    throw new Error('Multiple Choice 템플릿을 찾을 수 없습니다.');
                }

                const eventBus = {
                    handlers: new Map(),
                    emit(event) {
                        console.log('Event:', event);
                        if (event.type === 'COMPLETE') {
                            setTimeout(() => updateStatus('mc', 'complete', '완료됨'), 100);
                        }
                    },
                    on(type, handler) {}
                };

                const context = {
                    activityId: 'test-mc-' + currentMCSample,
                    eventBus: eventBus
                };

                container.innerHTML = '';
                await template.mount(container, params, context);

            } catch (error) {
                console.error('Multiple Choice 시작 오류:', error);
                container.innerHTML = '<div class="text-center text-red-400"><p>오류: ' + error.message + '</p></div>';
                updateStatus('mc', 'ready', '오류 발생');
            }
        }

        async function startMemoryGame() {
            if (!currentMGSample) {
                alert('먼저 샘플을 선택해주세요.');
                return;
            }

            updateStatus('mg', 'active', '실행 중');
            const container = document.getElementById('mg-container');
            const params = mgSamples[currentMGSample];

            try {
                const template = window.TemplateRegistry?.get('memory-game@1.0.0');
                if (!template) {
                    throw new Error('Memory Game 템플릿을 찾을 수 없습니다.');
                }

                const eventBus = {
                    handlers: new Map(),
                    emit(event) {
                        console.log('Event:', event);
                        if (event.type === 'COMPLETE') {
                            setTimeout(() => updateStatus('mg', 'complete', '완료됨'), 100);
                        }
                    },
                    on(type, handler) {}
                };

                const context = {
                    activityId: 'test-mg-' + currentMGSample,
                    eventBus: eventBus
                };

                container.innerHTML = '';
                await template.mount(container, params, context);

            } catch (error) {
                console.error('Memory Game 시작 오류:', error);
                container.innerHTML = '<div class="text-center text-red-400"><p>오류: ' + error.message + '</p></div>';
                updateStatus('mg', 'ready', '오류 발생');
            }
        }

        function resetMultipleChoice() {
            document.getElementById('mc-container').innerHTML = '<div class="text-center text-gray-400"><i class="fas fa-mouse-pointer text-4xl mb-4"></i><p>위에서 샘플을 선택하고 시작 버튼을 클릭하세요.</p></div>';
            updateStatus('mc', 'ready', '준비됨');
        }

        function resetMemoryGame() {
            document.getElementById('mg-container').innerHTML = '<div class="text-center text-gray-400"><i class="fas fa-mouse-pointer text-4xl mb-4"></i><p>위에서 샘플을 선택하고 시작 버튼을 클릭하세요.</p></div>';
            updateStatus('mg', 'ready', '준비됨');
        }

        function updateStatus(type, status, text) {
            const dot = document.getElementById(type + '-status-dot');
            const statusText = document.getElementById(type + '-status');
            
            dot.className = 'status-dot status-' + status;
            statusText.textContent = text;
        }

        // Initialize
        console.log('Template Registry:', window.TemplateRegistry);
        if (window.TemplateRegistry) {
            console.log('Available templates:', Array.from(window.TemplateRegistry.keys()));
        }
    </script>
</body>
</html>`)
})

// Main application route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Educational Lesson Platform</title>
        <meta name="description" content="Plugin-based educational lesson platform with interactive activities">
        
        <!-- CSS -->
        <link rel="stylesheet" href="/static/css/design-system.css">
        <link rel="stylesheet" href="/static/css/components.css">
        <link rel="stylesheet" href="/static/css/builder.css">
        
        <!-- Preload critical resources -->
        <link rel="preload" href="/static/js/app.js" as="script">
        
        <!-- Theme color for mobile browsers -->
        <meta name="theme-color" content="#0b1220">
        
        <!-- Favicon -->
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>">
    </head>
    <body>
        <div id="app">
            <!-- Header -->
            <header class="header">
                <div class="container">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <h1 class="text-2xl font-bold">📚 레슨 플랫폼</h1>
                            <span class="badge badge-primary">v2.0.0</span>
                        </div>
                        <nav class="navigation">
                            <button class="nav-link active" data-tab="player">
                                <span class="nav-icon">🎯</span>
                                <span class="nav-text">플레이어</span>
                            </button>
                            <button class="nav-link" data-tab="builder">
                                <span class="nav-icon">🛠️</span>
                                <span class="nav-text">빌더</span>
                            </button>
                            <button class="nav-link" data-tab="templates">
                                <span class="nav-icon">🧩</span>
                                <span class="nav-text">템플릿</span>
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            <!-- Main Content Area -->
            <main class="main-content">
                <!-- Lesson Player Panel -->
                <section class="content-panel active" data-panel="player">
                    <div class="container">
                        <div class="lesson-player-layout">
                            <!-- Lesson Controls Sidebar -->
                            <aside class="lesson-sidebar">
                                <div class="card">
                                    <div class="card-header">
                                        <h3 class="card-title">레슨 로더</h3>
                                    </div>
                                    
                                    <!-- Lesson Loader -->
                                    <div class="lesson-loader-section">
                                        <div class="sample-lesson-selector">
                                            <label for="sample-lesson-select" class="sample-lesson-label">
                                                📚 샘플 레슨 선택
                                            </label>
                                            <select id="sample-lesson-select" class="sample-lesson-select">
                                                <option value="">-- 레슨을 선택하세요 --</option>
                                                <option value="sample-lesson-multiple-choice.json">4지 선다형 문제 데모</option>
                                                <option value="sample-lesson-memory-game.json">메모리 게임 데모</option>
                                                <option value="sample-lesson-word-guess.json">단어 맞추기 데모</option>
                                                <option value="sample-lesson-mixed-templates.json">혼합 템플릿 데모</option>
                                            </select>
                                            <button id="load-selected-sample-btn" class="btn btn-primary w-full" disabled>
                                                📖 선택한 레슨 로드
                                            </button>
                                        </div>
                                        
                                        <div class="divider">또는</div>
                                        
                                        <div class="file-upload-area">
                                            <input type="file" id="lesson-file-input" accept=".json" class="sr-only">
                                            <div id="lesson-drop-zone" class="drop-zone">
                                                <div class="drop-zone-content">
                                                    <svg class="drop-zone-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                                    </svg>
                                                    <p class="drop-zone-text">JSON 파일을 드래그하거나 클릭하세요</p>
                                                    <button class="btn btn-secondary btn-sm" onclick="document.getElementById('lesson-file-input').click()">
                                                        파일 선택
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Lesson Info -->
                                    <div class="lesson-info-section" style="display: none;" id="lesson-info-section">
                                        <h4>레슨 정보</h4>
                                        <div class="lesson-meta">
                                            <h5 id="lesson-title">레슨 제목</h5>
                                            <p id="lesson-subtitle" class="text-sm text-secondary">활동 정보</p>
                                        </div>
                                        <div id="lesson-progress"></div>
                                        
                                        <!-- Lesson Activities Overview -->
                                        <div class="lesson-activities-overview" id="lesson-activities-overview">
                                            <h5 class="activities-title">📋 활동 목록</h5>
                                            <div class="activities-list" id="activities-list">
                                                <!-- Activities will be populated here -->
                                            </div>
                                        </div>
                                        
                                        <!-- Lesson Actions -->
                                        <div class="lesson-actions">
                                            <button id="download-lesson-json" class="btn btn-ghost btn-sm w-full">
                                                📄 레슨 JSON 다운로드
                                            </button>
                                            <button id="show-lesson-summary" class="btn btn-ghost btn-sm w-full">
                                                📊 레슨 요약 보기
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Current Activity Info -->
                                    <div id="current-activity-info"></div>
                                </div>
                                
                                <!-- Lesson Controls -->
                                <div class="card" id="lesson-controls" style="display: none;">
                                    <div class="card-header">
                                        <h4 class="card-title">레슨 제어</h4>
                                    </div>
                                    <div class="lesson-controls-grid">
                                        <button id="btn-previous" class="btn btn-secondary">
                                            ← 이전
                                        </button>
                                        <button id="btn-next" class="btn btn-primary">
                                            다음 →
                                        </button>
                                        <button id="btn-restart" class="btn btn-ghost">
                                            🔄 재시작
                                        </button>
                                        <button id="btn-finish" class="btn btn-success">
                                            ✓ 완료
                                        </button>
                                    </div>
                                </div>
                            </aside>
                            
                            <!-- Activity Container -->
                            <div class="lesson-main">
                                <div class="activity-container-wrapper">
                                    <div id="activity-container" class="activity-template">
                                        <div class="activity-placeholder">
                                            <div class="placeholder-content">
                                                <div class="placeholder-icon">🎯</div>
                                                <h3 class="placeholder-title">레슨을 시작하세요</h3>
                                                <p class="placeholder-text">
                                                    샘플 레슨을 로드하거나 JSON 파일을 업로드하여 인터랙티브 학습을 시작하세요.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Lesson Builder Panel -->
                <section class="content-panel" data-panel="builder">
                    <div class="container">
                        <div class="builder-layout">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">🛠️ 레슨 빌더</h3>
                                    <p class="card-subtitle">드래그 앤 드롭으로 레슨을 구성하세요</p>
                                </div>
                                <div class="builder-placeholder">
                                    <div class="placeholder-content">
                                        <div class="placeholder-icon">🛠️</div>
                                        <h4 class="placeholder-title">레슨 빌더 로딩 중...</h4>
                                        <p class="placeholder-text">
                                            레슨 빌더를 초기화하고 있습니다.<br>
                                            템플릿 카탈로그에서 '사용하기' 버튼을 클릭하여 시작하세요.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Templates Catalog Panel -->
                <section class="content-panel" data-panel="templates">
                    <div class="container">
                        <div class="templates-layout">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">🧩 템플릿 카탈로그</h3>
                                    <p class="card-subtitle">사용 가능한 액티비티 템플릿을 확인하세요</p>
                                </div>
                                <div id="templates-catalog">
                                    <div class="loading-placeholder">
                                        <div class="loading-spinner"></div>
                                        <p>템플릿을 불러오는 중...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <!-- Footer -->
            <footer class="footer">
                <div class="container">
                    <div class="flex items-center justify-between">
                        <div class="footer-text">
                            <span>© 2024 Educational Lesson Platform</span>
                            <span class="text-muted">Plugin Architecture v2.0</span>
                        </div>
                        <div class="footer-links">
                            <a href="#" class="footer-link">도움말</a>
                            <a href="#" class="footer-link">API 문서</a>
                            <a href="https://github.com/UnimationKorea/core_plugin" class="footer-link">GitHub</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
        
        <!-- Notifications Container -->
        <div id="notifications-container"></div>
        
        <!-- Scripts -->
        <script type="module" src="/static/js/app.js"></script>
        <script type="module" src="/static/js/builder.js"></script>
        
        <!-- Service Worker for offline support -->
        <script>
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/static/js/sw.js')
                .then(registration => console.log('SW registered'))
                .catch(error => console.log('SW registration failed'));
            });
          }
        </script>
    </body>
    </html>
  `)
})

// 애플리케이션 종료 시 정리
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, cleaning up...')
  if (templateRegistry) {
    await templateRegistry.cleanup()
  }
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, cleaning up...')
  if (templateRegistry) {
    await templateRegistry.cleanup()
  }
  process.exit(0)
})

// 에러 핸들링
app.onError((err, c) => {
  console.error('🚨 Application error:', err)
  return c.json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  }, 500)
})

// 404 핸들링
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not found',
    message: `Endpoint ${c.req.url} not found`
  }, 404)
})

console.log('🚀 Enhanced Educational Platform API v2.0 initialized')
console.log('📋 Features: Modular Sandbox, Guardrail System, Dynamic Templates')

export default app