/**
 * 외부 플러그인 로딩 시스템
 * Enhanced Modular Educational Platform v2.0
 */

class PluginSystem {
    constructor() {
        this.registeredTemplates = new Map();
        this.loadedPlugins = new Map();
        this.eventHandlers = new Map();
    }
    
    /**
     * 외부 플러그인 등록
     * @param {string} templateName - 템플릿 이름
     * @param {string} version - 버전 (예: "1.0.0")
     * @param {Object} plugin - 플러그인 객체
     */
    registerTemplate(templateName, version, plugin) {
        const templateId = `${templateName}@${version}`;
        
        // 플러그인 유효성 검사
        if (!this.validatePlugin(plugin)) {
            throw new Error(`Invalid plugin: ${templateId}`);
        }
        
        this.registeredTemplates.set(templateId, plugin);
        this.loadedPlugins.set(templateName, plugin);
        
        console.log(`✅ 플러그인 등록 완료: ${templateId}`);
        
        // 플러그인 로드 이벤트 발생
        this.emit('template:registered', { templateName, version, plugin });
        
        return true;
    }
    
    /**
     * 외부 스크립트에서 플러그인 로드
     * @param {string} scriptUrl - 플러그인 스크립트 URL
     */
    async loadExternalPlugin(scriptUrl) {
        try {
            console.log(`🔄 외부 플러그인 로딩 중: ${scriptUrl}`);
            
            // 스크립트 동적 로드
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.async = true;
            
            return new Promise((resolve, reject) => {
                script.onload = () => {
                    console.log(`✅ 외부 플러그인 로드 완료: ${scriptUrl}`);
                    resolve(script);
                };
                
                script.onerror = (error) => {
                    console.error(`❌ 외부 플러그인 로드 실패: ${scriptUrl}`, error);
                    reject(error);
                };
                
                document.head.appendChild(script);
            });
            
        } catch (error) {
            console.error('플러그인 로드 오류:', error);
            throw error;
        }
    }
    
    /**
     * 템플릿 가져오기
     * @param {string} templateId - "template@version" 형식
     */
    getTemplate(templateId) {
        return this.registeredTemplates.get(templateId);
    }
    
    /**
     * 템플릿 존재 여부 확인
     * @param {string} templateId - "template@version" 형식
     */
    hasTemplate(templateId) {
        return this.registeredTemplates.has(templateId);
    }
    
    /**
     * 활동 렌더링 (플러그인 통합)
     * @param {Object} activity - 활동 객체
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    async renderActivity(activity, container) {
        const templateId = activity.template;
        const plugin = this.getTemplate(templateId);
        
        if (!plugin) {
            throw new Error(`템플릿을 찾을 수 없습니다: ${templateId}`);
        }
        
        try {
            // 플러그인의 렌더링 함수 호출
            await plugin.render(activity, container);
            
            // 렌더링 완료 이벤트
            this.emit('activity:rendered', { activity, plugin });
            
        } catch (error) {
            console.error('활동 렌더링 오류:', error);
            container.innerHTML = `<div class="error">렌더링 오류: ${error.message}</div>`;
        }
    }
    
    /**
     * 플러그인 유효성 검사
     * @param {Object} plugin - 검사할 플러그인
     */
    validatePlugin(plugin) {
        const required = ['name', 'version', 'render', 'getDefaultParams'];
        
        for (const field of required) {
            if (!(field in plugin)) {
                console.error(`필수 필드 누락: ${field}`);
                return false;
            }
        }
        
        if (typeof plugin.render !== 'function') {
            console.error('render는 함수여야 합니다');
            return false;
        }
        
        if (typeof plugin.getDefaultParams !== 'function') {
            console.error('getDefaultParams는 함수여야 합니다');
            return false;
        }
        
        return true;
    }
    
    /**
     * 등록된 모든 템플릿 목록
     */
    getRegisteredTemplates() {
        return Array.from(this.registeredTemplates.keys());
    }
    
    /**
     * 이벤트 리스너 등록
     * @param {string} event - 이벤트 이름
     * @param {Function} handler - 핸들러 함수
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }
    
    /**
     * 이벤트 발생
     * @param {string} event - 이벤트 이름
     * @param {Object} data - 이벤트 데이터
     */
    emit(event, data) {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`이벤트 핸들러 오류 (${event}):`, error);
            }
        });
    }
    
    /**
     * 플러그인 제거
     * @param {string} templateId - 제거할 템플릿 ID
     */
    unregisterTemplate(templateId) {
        if (this.registeredTemplates.delete(templateId)) {
            console.log(`🗑️ 플러그인 제거됨: ${templateId}`);
            this.emit('template:unregistered', { templateId });
            return true;
        }
        return false;
    }
}

// 전역 플러그인 시스템 인스턴스
window.PluginSystem = window.PluginSystem || new PluginSystem();

// 플러그인 등록 도우미 함수
window.registerEduPlugin = function(templateName, version, plugin) {
    return window.PluginSystem.registerTemplate(templateName, version, plugin);
};

console.log('🔌 플러그인 시스템이 초기화되었습니다!');