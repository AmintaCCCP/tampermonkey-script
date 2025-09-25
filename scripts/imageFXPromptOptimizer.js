// ==UserScript==
// @name         ImageFX AI Prompt Optimizer
// @namespace    https://github.com/AmintaCCCP
// @version      1.2
// @description  为ImageFX添加AI优化功能
// @author       AmintaCCCP
// @match        https://labs.google/fx/tools/image-fx*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// ==/UserScript==

(function() {
    'use strict';

    // 默认配置
    const DEFAULT_CONFIG = {
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        modelId: 'gpt-3.5-turbo',
        optimizePrompt: '请优化以下图像生成提示词，使其更加详细、生动和富有创意。保持原意的同时，添加更多视觉细节、艺术风格和氛围描述。直接返回优化后的提示词，不需要额外解释：\n\n'
    };

    // 获取配置
    function getConfig() {
        return {
            baseUrl: GM_getValue('baseUrl', DEFAULT_CONFIG.baseUrl),
            apiKey: GM_getValue('apiKey', DEFAULT_CONFIG.apiKey),
            modelId: GM_getValue('modelId', DEFAULT_CONFIG.modelId),
            optimizePrompt: GM_getValue('optimizePrompt', DEFAULT_CONFIG.optimizePrompt)
        };
    }

    // 保存配置
    function saveConfig(config) {
        GM_setValue('baseUrl', config.baseUrl);
        GM_setValue('apiKey', config.apiKey);
        GM_setValue('modelId', config.modelId);
        GM_setValue('optimizePrompt', config.optimizePrompt);
    }

    // 获取历史记录
    function getHistory() {
        return JSON.parse(GM_getValue('promptHistory', '[]'));
    }

    // 保存到历史记录
    function saveToHistory(original, optimized) {
        const history = getHistory();
        history.unshift({
            id: Date.now(),
            original: original,
            optimized: optimized,
            timestamp: new Date().toLocaleString()
        });
        // 保持最多50条记录
        if (history.length > 50) {
            history.splice(50);
        }
        GM_setValue('promptHistory', JSON.stringify(history));
    }

    // 调用AI优化
    async function optimizeWithAI(text) {
        const config = getConfig();
        
        if (!config.apiKey) {
            throw new Error('请先在设置中配置API Key');
        }

        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.modelId,
                messages: [
                    {
                        role: 'user',
                        content: config.optimizePrompt + text
                    }
                ],
                temperature: 0.8,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // 创建样式
    function createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ai-optimizer-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 8px 12px;
                background: #4285f4;
                color: white;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                margin-right: 8px;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
                min-height: 36px;
                white-space: nowrap;
                box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            }
            .ai-optimizer-btn:hover {
                background: #3367d6;
                transform: translateY(-1px);
                box-shadow: 0 2px 6px rgba(0,0,0,0.16);
            }
            .ai-optimizer-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            .ai-optimizer-btn svg {
                margin-right: 4px;
            }
            .ai-button-container {
                display: inline-flex;
                align-items: center;
                margin-right: 12px;
                gap: 8px;
            }
            .ai-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .ai-modal-content {
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 600px;
                width: 90%;
                max-height: 80%;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            }
            .ai-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 12px;
                border-bottom: 1px solid #eee;
            }
            .ai-modal-title {
                font-size: 18px;
                font-weight: 600;
                margin: 0;
            }
            .ai-modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .ai-textarea {
                width: 100%;
                min-height: 120px;
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 14px;
                resize: vertical;
                margin-bottom: 16px;
                box-sizing: border-box;
            }
            .ai-textarea:focus {
                outline: none;
                border-color: #4285f4;
            }
            .ai-button {
                background: #4285f4;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                margin-right: 8px;
                font-size: 14px;
                transition: background 0.2s;
            }
            .ai-button:hover:not(:disabled) {
                background: #3367d6;
            }
            .ai-button:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            .ai-button.secondary {
                background: #fff;
                color: #4285f4;
                border: 1px solid #4285f4;
            }
            .ai-button.secondary:hover:not(:disabled) {
                background: #f8f9ff;
            }
            .ai-button.copy {
                background: #28a745;
                color: white;
            }
            .ai-button.copy:hover:not(:disabled) {
                background: #218838;
            }
            .ai-result {
                background: #f8f9fa;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 16px;
                margin: 16px 0;
                white-space: pre-wrap;
                line-height: 1.5;
                font-size: 14px;
            }
            .ai-loading {
                display: flex;
                align-items: center;
                color: #666;
                font-size: 14px;
            }
            .ai-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid #e0e0e0;
                border-top: 2px solid #4285f4;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 8px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .ai-tabs {
                display: flex;
                border-bottom: 1px solid #e0e0e0;
                margin-bottom: 20px;
            }
            .ai-tab {
                background: none;
                border: none;
                padding: 12px 16px;
                cursor: pointer;
                font-size: 14px;
                color: #666;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;
            }
            .ai-tab.active {
                color: #4285f4;
                border-bottom-color: #4285f4;
            }
            .ai-tab-content {
                display: none;
            }
            .ai-tab-content.active {
                display: block;
            }
            .ai-config-item {
                margin-bottom: 16px;
            }
            .ai-config-label {
                display: block;
                font-weight: 500;
                margin-bottom: 6px;
                font-size: 14px;
            }
            .ai-config-input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                font-size: 14px;
                box-sizing: border-box;
            }
            .ai-history-item {
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 12px;
            }
            .ai-history-meta {
                font-size: 12px;
                color: #666;
                margin-bottom: 8px;
            }
            .ai-history-text {
                font-size: 13px;
                line-height: 1.4;
                margin-bottom: 8px;
                padding: 8px;
                background: #f8f9fa;
                border-radius: 4px;
                max-height: 60px;
                overflow-y: auto;
            }
            .ai-history-original {
                border-left: 3px solid #ff9800;
            }
            .ai-history-optimized {
                border-left: 3px solid #4caf50;
            }
            .ai-copy-btn {
                background: #f0f0f0;
                border: 1px solid #ddd;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                margin-right: 4px;
            }
            .ai-copy-btn:hover {
                background: #e0e0e0;
            }
            .ai-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 12px 16px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 10001;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                animation: slideInOut 3s ease-in-out;
            }
            @keyframes slideInOut {
                0% { transform: translateX(100%); opacity: 0; }
                15% { transform: translateX(0); opacity: 1; }
                85% { transform: translateX(0); opacity: 1; }
                100% { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // 创建AI优化按钮
    function createOptimizerButton() {
        const btn = document.createElement('button');
        btn.className = 'ai-optimizer-btn';
        btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            AI优化
        `;
        btn.title = 'AI优化提示词';
        return btn;
    }

    // 创建设置按钮
    function createSettingsButton() {
        const btn = document.createElement('button');
        btn.className = 'ai-optimizer-btn';
        btn.style.background = '#6c757d';
        btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="m12 1 1.68 3.36L17 6.64l.32 3.68L21 12l-3.68 1.68L15.36 17l-3.68.32L10 21l-1.68-3.68L5 15.36l-.32-3.68L1 10l3.68-1.68L6.64 5l3.68-.32L12 1z"/>
            </svg>
            设置
        `;
        btn.title = '设置';
        btn.addEventListener('mouseover', () => btn.style.background = '#5a6268');
        btn.addEventListener('mouseout', () => btn.style.background = '#6c757d');
        return btn;
    }

    // 复制到剪贴板并显示提示
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('已复制到剪贴板');
        }).catch(() => {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('已复制到剪贴板');
        });
    }

    // 显示提示消息
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'ai-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 3000);
    }

    // 创建优化弹窗
    function createOptimizerModal() {
        const modal = document.createElement('div');
        modal.className = 'ai-modal';
        modal.innerHTML = `
            <div class="ai-modal-content">
                <div class="ai-modal-header">
                    <h3 class="ai-modal-title">AI提示词优化</h3>
                    <button class="ai-modal-close">×</button>
                </div>
                
                <div class="ai-tabs">
                    <button class="ai-tab active" data-tab="optimize">优化</button>
                    <button class="ai-tab" data-tab="settings">设置</button>
                    <button class="ai-tab" data-tab="history">历史</button>
                </div>

                <div class="ai-tab-content active" id="optimize-tab">
                    <textarea class="ai-textarea" id="input-text" placeholder="请输入要优化的提示词..."></textarea>
                    <div class="ai-loading" id="loading" style="display: none;">
                        <div class="ai-spinner"></div>
                        正在优化中...
                    </div>
                    <div class="ai-result" id="result" style="display: none;"></div>
                    <div>
                        <button class="ai-button" id="optimize-btn">AI优化</button>
                        <button class="ai-button copy" id="copy-original-btn" style="display: none;">复制原文</button>
                        <button class="ai-button copy" id="copy-optimized-btn" style="display: none;">复制优化后</button>
                        <button class="ai-button secondary" id="re-optimize-btn" style="display: none;">重新优化</button>
                    </div>
                </div>

                <div class="ai-tab-content" id="settings-tab">
                    <div class="ai-config-item">
                        <label class="ai-config-label">Base URL:</label>
                        <input type="text" class="ai-config-input" id="config-baseurl" placeholder="https://api.openai.com/v1">
                    </div>
                    <div class="ai-config-item">
                        <label class="ai-config-label">API Key:</label>
                        <input type="password" class="ai-config-input" id="config-apikey" placeholder="sk-...">
                    </div>
                    <div class="ai-config-item">
                        <label class="ai-config-label">模型ID:</label>
                        <input type="text" class="ai-config-input" id="config-modelid" placeholder="gpt-3.5-turbo">
                    </div>
                    <div class="ai-config-item">
                        <label class="ai-config-label">优化提示词:</label>
                        <textarea class="ai-config-input" id="config-prompt" rows="4" placeholder="请输入用于优化的系统提示词..."></textarea>
                    </div>
                    <div>
                        <button class="ai-button" id="save-config-btn">保存设置</button>
                    </div>
                </div>

                <div class="ai-tab-content" id="history-tab">
                    <div id="history-list"></div>
                </div>
            </div>
        `;

        return modal;
    }

    // 渲染历史记录
    function renderHistory() {
        const historyList = document.getElementById('history-list');
        const history = getHistory();
        
        if (history.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #666;">暂无历史记录</p>';
            return;
        }

        historyList.innerHTML = history.map(item => `
            <div class="ai-history-item">
                <div class="ai-history-meta">${item.timestamp}</div>
                <div class="ai-history-text ai-history-original" title="原始提示词">${item.original}</div>
                <div class="ai-history-text ai-history-optimized" title="优化后提示词">${item.optimized}</div>
                <div>
                    <button class="ai-copy-btn" onclick="copyToClipboard(\`${item.original.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`)">复制原文</button>
                    <button class="ai-copy-btn" onclick="copyToClipboard(\`${item.optimized.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`)">复制优化后</button>
                </div>
            </div>
        `).join('');
    }

    // 查找Lucky按钮并插入AI按钮
    function findAndInsertButtons() {
        // 查找包含"I'm feeling lucky"文本的按钮
        const luckyButton = document.querySelector('button .sc-a6441ec3-2');
        
        if (luckyButton && luckyButton.textContent.includes("I'm feeling lucky")) {
            const buttonElement = luckyButton.closest('button');
            const parentContainer = buttonElement.parentElement;
            
            // 检查是否已经添加过按钮
            if (parentContainer.querySelector('.ai-button-container')) {
                return true;
            }
            
            console.log('找到Lucky按钮，准备插入AI按钮');
            
            // 创建按钮容器
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'ai-button-container';
            
            // 创建AI优化按钮和设置按钮
            const aiBtn = createOptimizerButton();
            const settingsBtn = createSettingsButton();
            
            buttonContainer.appendChild(aiBtn);
            buttonContainer.appendChild(settingsBtn);
            
            // 插入到Lucky按钮前面
            parentContainer.insertBefore(buttonContainer, buttonElement);
            
            // 绑定事件
            aiBtn.addEventListener('click', () => showOptimizerModal('optimize'));
            settingsBtn.addEventListener('click', () => showOptimizerModal('settings'));
            
            console.log('AI优化按钮已成功添加');
            return true;
        }
        
        return false;
    }

    // 初始化优化器
    function initOptimizer() {
        console.log('开始初始化ImageFX AI优化器...');
        
        // 创建样式
        createStyles();
        
        // 使用MutationObserver监听DOM变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // 尝试查找并插入按钮
                    if (findAndInsertButtons()) {
                        observer.disconnect(); // 成功插入后断开观察
                    }
                }
            });
        });
        
        // 开始观察DOM变化
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // 立即尝试一次
        setTimeout(() => {
            if (!findAndInsertButtons()) {
                console.log('首次尝试未找到Lucky按钮，继续监听...');
            }
        }, 1000);
        
        // 5秒后如果还没找到，停止观察
        setTimeout(() => {
            observer.disconnect();
            console.log('停止监听DOM变化');
        }, 5000);
    }

    // 显示优化弹窗
    function showOptimizerModal(activeTab = 'optimize') {
        // 创建弹窗
        const modal = createOptimizerModal();
        document.body.appendChild(modal);

        // 加载配置到设置界面
        const config = getConfig();
        document.getElementById('config-baseurl').value = config.baseUrl;
        document.getElementById('config-apikey').value = config.apiKey;
        document.getElementById('config-modelid').value = config.modelId;
        document.getElementById('config-prompt').value = config.optimizePrompt;

        // 渲染历史记录
        renderHistory();

        // 暴露复制函数到全局
        window.copyToClipboard = copyToClipboard;

        // 切换到指定标签
        if (activeTab !== 'optimize') {
            switchTab(activeTab);
        }

        // 绑定事件
        bindModalEvents(modal);
    }

    // 切换标签
    function switchTab(tabName) {
        // 切换标签按钮状态
        document.querySelectorAll('.ai-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // 切换内容
        document.querySelectorAll('.ai-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    // 绑定弹窗事件
    function bindModalEvents(modal) {
        const closeBtn = modal.querySelector('.ai-modal-close');
        const optimizeBtn = document.getElementById('optimize-btn');
        const copyOriginalBtn = document.getElementById('copy-original-btn');
        const copyOptimizedBtn = document.getElementById('copy-optimized-btn');
        const reOptimizeBtn = document.getElementById('re-optimize-btn');
        const saveConfigBtn = document.getElementById('save-config-btn');
        const inputText = document.getElementById('input-text');
        const result = document.getElementById('result');
        const loading = document.getElementById('loading');

        let currentOriginal = '';
        let currentOptimized = '';

        // 关闭弹窗
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        // 标签切换
        document.querySelectorAll('.ai-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                switchTab(tab.dataset.tab);
                if (tab.dataset.tab === 'history') {
                    renderHistory();
                }
            });
        });

        // AI优化
        optimizeBtn.addEventListener('click', async () => {
            const text = inputText.value.trim();
            if (!text) {
                alert('请输入要优化的文本');
                return;
            }

            optimizeBtn.disabled = true;
            loading.style.display = 'flex';
            result.style.display = 'none';

            try {
                const optimized = await optimizeWithAI(text);
                currentOriginal = text;
                currentOptimized = optimized;
                
                result.textContent = optimized;
                result.style.display = 'block';
                
                // 显示复制按钮
                copyOriginalBtn.style.display = 'inline-block';
                copyOptimizedBtn.style.display = 'inline-block';
                reOptimizeBtn.style.display = 'inline-block';
                
                // 保存到历史记录
                saveToHistory(text, optimized);
                
            } catch (error) {
                alert('优化失败: ' + error.message);
            } finally {
                optimizeBtn.disabled = false;
                loading.style.display = 'none';
            }
        });

        // 复制原文
        copyOriginalBtn.addEventListener('click', () => {
            copyToClipboard(currentOriginal);
        });

        // 复制优化后
        copyOptimizedBtn.addEventListener('click', () => {
            copyToClipboard(currentOptimized);
        });

        // 重新优化
        reOptimizeBtn.addEventListener('click', () => {
            inputText.value = currentOptimized;
            result.style.display = 'none';
            copyOriginalBtn.style.display = 'none';
            copyOptimizedBtn.style.display = 'none';
            reOptimizeBtn.style.display = 'none';
        });

        // 保存配置
        saveConfigBtn.addEventListener('click', () => {
            const newConfig = {
                baseUrl: document.getElementById('config-baseurl').value.trim(),
                apiKey: document.getElementById('config-apikey').value.trim(),
                modelId: document.getElementById('config-modelid').value.trim(),
                optimizePrompt: document.getElementById('config-prompt').value.trim()
            };
            
            saveConfig(newConfig);
            showToast('配置已保存');
        });

        // 输入框默认为空，不自动填充任何内容
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOptimizer);
    } else {
        initOptimizer();
    }

})();
