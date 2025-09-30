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
      id: 'video@1.0.0',
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
      id: 'drag-drop-choices@1.2.0',
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
                                        <button id="load-sample-btn" class="btn btn-primary w-full">
                                            📖 샘플 레슨 로드
                                        </button>
                                        
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
                                        <div class="placeholder-icon">🚧</div>
                                        <h4 class="placeholder-title">개발 중</h4>
                                        <p class="placeholder-text">
                                            레슨 빌더는 현재 개발 중입니다.<br>
                                            곧 직관적인 드래그 앤 드롭 인터페이스를 제공할 예정입니다.
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

export default app