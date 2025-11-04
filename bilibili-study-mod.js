// ==UserScript==
// @name         Bilibili 网课增强
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  增强 Bilibili 视频页面体验，支持屏蔽推荐、调整选集高度、自动开启字幕（通过 <title> 标签和 .video-pod 变化检测选集切换）、全屏标题实时同步、自动播放（优化火狐兼容性）、播放倍速控制（突破2倍速上限，记忆匹配作者倍速并自动切换）、增强模式控制，修复切换视频时字幕未启用问题
// @author       Promesyne
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/video/*/course/*
// @icon         https://www.google.com/s2/favicons?domain=bilibili.com
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getResourceText
// @resource     enhanceStyles https://raw.githubusercontent.com/Aquilonar/bilibili-study-mod/refs/heads/main/bilibili-study-mod_styles.css
// ==/UserScript==

(function() {
    'use strict';

    // 缓存全局 DOM 元素
    const htmlElement = document.documentElement;
    const titleElement = document.querySelector('title');
    const cache = {
        video: null,
        playButton: null,
        subtitleButton: null,
        activeEpisode: null,
        titleDiv: null
    };

    // 全局变量
    // 全局变量：存储当前视频作者
    let currentAuthor = '';
    // 全局变量：存储用户设置的屏蔽作者列表，使用 GM_getValue 持久化
    let matchedAuthors = GM_getValue('matchedAuthors', []);
    // 全局变量：存储匹配作者的播放倍速，使用 GM_getValue 持久化
    let authorPlaybackRates = GM_getValue('authorPlaybackRates', {});
    // 全局变量：控制是否屏蔽推荐视频（rec-list 和 recommend-list-v1），默认从存储读取
    let blockRecommend = GM_getValue('blockRecommend', false);
    // 全局变量：控制增强模式（0: 对所有页面使用增强；1: 只对匹配作者使用增强），默认从存储读取
    let enhanceMode = GM_getValue('enhanceMode', 0); // 默认对所有页面使用增强

    // 定义动态样式元素，用于控制推荐列表、选集高度和序号的显示
    let recListStyleElement = null;


    // 加载外部 CSS 样式
    const css = GM_getResourceText('enhanceStyles');
    GM_addStyle(css);

    /**
     * 更新推荐列表、选集高度和序号的可见性
     * 当 blockRecommend 为 true 时，隐藏推荐列表、增大选集高度并为选集添加序号
     * 当 blockRecommend 为 false 时，恢复默认显示
     */
    function updateRecListVisibility() {
        if (blockRecommend) {
            if (!recListStyleElement) {
                recListStyleElement = document.createElement('style');
                recListStyleElement.id = 'recListStyle';
                recListStyleElement.textContent = `
                    /* 隐藏推荐视频列表 */
                    div.rec-list, div.recommend-list-v1 {
                        display: none !important;
                    }
                    /* 增大选集播放框高度 */
                    .video-pod__body {
                        max-height: 800px !important;
                    }
                    /* 为选集项添加序号 */
                    .video-pod {
                        counter-reset: episode-counter; /* 重置计数器 */
                    }
                    .video-pod__item {
                        counter-increment: episode-counter; /* 每个选集项递增计数器 */
                        position: relative; /* 为伪元素定位 */
                        padding-left: 35px !important; /* 留出序号空间 */
                    }
                    .video-pod__item::before {
                        content: counter(episode-counter); /* 显示计数器值 */
                        position: absolute;
                        left: 10px; /* 与标题距离 10px */
                        top: 50%;
                        transform: translateY(-50%);
                        background-color: transparent; /* 序号无背景色 */
                        color: #A9A9A9; /* 所有序号字体颜色为灰色 */
                        width: 20px;
                        height: 20px;
                        border-radius: 50%; /* 圆形序号 */
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        font-weight: bold;
                        z-index: 1;
                    }
                `;
                document.head.appendChild(recListStyleElement);
                console.log('已隐藏 rec-list 和 recommend-list-v1，将 video-pod__body max-height 改为 800px，并为选集添加序号');
            }
        } else {
            if (recListStyleElement) {
                recListStyleElement.remove();
                recListStyleElement = null;
                console.log('已恢复显示 rec-list、recommend-list-v1 和 video-pod__body 的默认 max-height，并移除选集序号');
            }
        }
    }

    /**
     * 获取当前视频标题
     * @returns {string} 标题或空字符串
     */
    function getTitle() {
        return titleElement?.textContent.trim() || '';
    }

    /**
     * 获取当前选集序号
     * @returns {number} 序号
     */
    function getCurrentEpisodeNumber() {
        cache.activeEpisode = document.querySelector('.video-pod__item.is-active');
        return cache.activeEpisode ? Array.from(document.querySelectorAll('.video-pod__item')).indexOf(cache.activeEpisode) + 1 : 1;
    }

    /**
     * 更新播放器标题
     */
    function updatePlayerTitle() {
        cache.titleDiv = cache.titleDiv || document.querySelector('.bpx-player-top-left-title');
        if (cache.titleDiv) {
            const title = getTitle();
            cache.titleDiv.textContent = title || '未知标题';
            console.log(`更新播放器标题为: ${title || '未知标题'}`);
        } else {
            console.log('未找到播放器标题元素: .bpx-player-top-left-title');
        }
    }

    /**
     * 获取当前视频作者
     * @returns {string} 作者名或空字符串
     */
    function getCurrentAuthor() {
        const authorElement = document.querySelector('meta[name="author"]');
        return authorElement?.getAttribute('content')?.trim() || '';
    }

    /**
     * 自动播放视频
     */
    function controlPlayerState() {
        cache.video = cache.video || document.querySelector('video');
        cache.playButton = cache.playButton || document.querySelector('.bpx-player-ctrl-btn.bpx-player-ctrl-play, .bpx-player-control-wrap .play-btn');

        if (!cache.video || !cache.playButton) {
            console.log('未找到视频或播放按钮，等待播放器加载');
            return;
        }

        if (!cache.video.paused) {
            console.log('视频已在播放');
            return;
        }

        cache.video.play().then(() => {
            console.log('自动播放成功');
        }).catch(err => {
            console.log('自动播放失败:', err.message);
            const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
            cache.playButton.dispatchEvent(clickEvent);
            console.log('尝试通过点击播放按钮启动播放');
        });

        cache.video.addEventListener('pause', () => {
            console.log('视频被暂停');
        }, { once: true });
    }

    /**
     * 设置播放倍速
     * @param {number} rate 目标倍速
     */
    function setPlaybackRate(rate) {
        if (!cache.video) {
            console.log('未找到视频元素，无法设置播放倍速');
            return;
        }
        const newRate = Math.max(0.1, Math.min(10.0, rate));
        cache.video.playbackRate = newRate;
        console.log(`设置播放倍速为: ${newRate.toFixed(1)}x`);
        if (matchedAuthors.includes(currentAuthor)) {
            authorPlaybackRates[currentAuthor] = newRate;
            GM_setValue('authorPlaybackRates', authorPlaybackRates);
            console.log(`已为作者 ${currentAuthor} 保存倍速: ${newRate.toFixed(1)}x`);
        }
    }

    /**
     * 应用存储的播放倍速
     */
    function applyPlaybackRate() {
        cache.video = cache.video || document.querySelector('video');
        if (!cache.video) {
            console.log('未找到视频元素，跳过倍速应用');
            return;
        }
        const savedRate = matchedAuthors.includes(currentAuthor) ? (authorPlaybackRates[currentAuthor] || 1.0) : 1.0;
        cache.video.playbackRate = savedRate;
        console.log(`应用作者 ${currentAuthor} 的倍速: ${savedRate.toFixed(1)}x`);
    }

    /**
     * 绑定播放倍速控制（移除 Shift + 0.5 逻辑，仅支持 , 和 . 调整1.0倍速）
     */
    function bindPlaybackRateControls() {
        let lastExecution = 0;
        const debounceDelay = 200; // 防抖时间 200ms

        document.addEventListener('keydown', (event) => {
            cache.video = cache.video || document.querySelector('video');
            if (!cache.video) {
                console.log('未找到视频元素，跳过倍速调整');
                return;
            }

            // 排除其他修饰键干扰
            if (event.ctrlKey || event.altKey || event.metaKey) {
                console.log(`按键 ${event.key} 被忽略：检测到 Ctrl/Alt/Meta 修饰键`);
                return;
            }

            const now = Date.now();
            if (now - lastExecution < debounceDelay) {
                console.log(`按键 ${event.key} 被防抖忽略`);
                return;
            }
            lastExecution = now;

            let currentRate = cache.video.playbackRate || 1.0;
            const delta = 1.0; // 固定增量为 1.0

            console.log(`检测到按键 ${event.key}，当前倍速: ${currentRate.toFixed(1)}x，调整幅度: ${delta}x`);

            if (event.key === ',' || event.code === 'Comma') {
                setPlaybackRate(currentRate - delta);
                event.preventDefault();
            } else if (event.key === '.' || event.code === 'Period') {
                setPlaybackRate(currentRate + delta);
                event.preventDefault();
            } else {
                console.log(`按键 ${event.key} 未匹配倍速调整规则`);
            }
        }, { capture: true }); // 使用 capture 模式，优先捕获事件
    }

    /**
     * 创建用户界面
     */
    function createUI() {
        const button = document.createElement('button');
        button.id = 'enhanceButton';
        button.textContent = '增强';
        document.body.appendChild(button);

        const panel = document.createElement('div');
        panel.id = 'enhancePanel';
        panel.innerHTML = `
            <div id="buttonContainer">
                <button id="toggleRecommendBtn">切换推荐屏蔽 (当前: ${blockRecommend ? '屏蔽' : '显示'})</button>
                <button id="toggleEnhanceModeBtn">增强模式: ${enhanceMode === 0 ? '全局' : '匹配'}</button>
                <button id="toggleAuthorBtn">${matchedAuthors.includes(currentAuthor) ? '删除当前作者' : '添加当前作者到匹配规则'}</button>
            </div>
            <div id="authorList">
                <div id="authorListTitle">匹配作者列表</div>
                <div id="authorListDivider"></div>
                <div class="author-grid"></div>
            </div>
        `;
        document.body.appendChild(panel);

        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.getElementById('toggleRecommendBtn').style.backgroundColor = blockRecommend ? (isDarkMode ? '#1a8cff' : '#00a1d6') : (isDarkMode ? '#666' : '#999');
        document.getElementById('toggleEnhanceModeBtn').style.backgroundColor = enhanceMode === 0 ? (isDarkMode ? '#1a8cff' : '#00a1d6') : (isDarkMode ? '#78c878' : '#90EE90');
        document.getElementById('toggleAuthorBtn').style.backgroundColor = matchedAuthors.includes(currentAuthor) ? (isDarkMode ? '#78c878' : '#90EE90') : (isDarkMode ? '#1a8cff' : '#00a1d6');

        button.addEventListener('click', () => {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            updateAuthorList();
        });

        document.getElementById('toggleRecommendBtn').addEventListener('click', () => {
            blockRecommend = !blockRecommend;
            GM_setValue('blockRecommend', blockRecommend);
            document.getElementById('toggleRecommendBtn').textContent = `切换推荐屏蔽 (当前: ${blockRecommend ? '屏蔽' : '显示'})`;
            document.getElementById('toggleRecommendBtn').style.backgroundColor = blockRecommend ? (isDarkMode ? '#1a8cff' : '#00a1d6') : (isDarkMode ? '#666' : '#999');
            applyEnhancements();
        });

        document.getElementById('toggleEnhanceModeBtn').addEventListener('click', () => {
            enhanceMode = enhanceMode === 0 ? 1 : 0;
            GM_setValue('enhanceMode', enhanceMode);
            document.getElementById('toggleEnhanceModeBtn').textContent = `增强模式: ${enhanceMode === 0 ? '全局' : '匹配'}`;
            document.getElementById('toggleEnhanceModeBtn').style.backgroundColor = enhanceMode === 0 ? (isDarkMode ? '#1a8cff' : '#00a1d6') : (isDarkMode ? '#78c878' : '#90EE90');
            applyEnhancements();
            applyPlaybackRate();
        });

        document.getElementById('toggleAuthorBtn').addEventListener('click', () => {
            if (!currentAuthor) return;
            if (matchedAuthors.includes(currentAuthor)) {
                matchedAuthors = matchedAuthors.filter(author => author !== currentAuthor);
                delete authorPlaybackRates[currentAuthor];
                GM_setValue('matchedAuthors', matchedAuthors);
                GM_setValue('authorPlaybackRates', authorPlaybackRates);
                document.getElementById('toggleAuthorBtn').textContent = '添加当前作者到匹配规则';
                document.getElementById('toggleAuthorBtn').style.backgroundColor = isDarkMode ? '#1a8cff' : '#00a1d6';
                console.log(`已删除作者 ${currentAuthor} 的匹配规则和倍速`);
            } else {
                matchedAuthors.push(currentAuthor);
                authorPlaybackRates[currentAuthor] = cache.video?.playbackRate || 1.0;
                GM_setValue('matchedAuthors', matchedAuthors);
                GM_setValue('authorPlaybackRates', authorPlaybackRates);
                document.getElementById('toggleAuthorBtn').textContent = '删除当前作者';
                document.getElementById('toggleAuthorBtn').style.backgroundColor = isDarkMode ? '#78c878' : '#90EE90';
                console.log(`已添加作者 ${currentAuthor} 到匹配规则，当前倍速: ${authorPlaybackRates[currentAuthor].toFixed(1)}x`);
            }
            updateAuthorList();
            applyEnhancements();
            applyPlaybackRate();
        });
    }

    /**
     * 更新屏蔽作者列表
     */
    function updateAuthorList() {
        const authorGrid = document.querySelector('.author-grid');
        const authorListTitle = document.getElementById('authorListTitle');
        const toggleAuthorBtn = document.getElementById('toggleAuthorBtn');

        authorListTitle.textContent = `匹配作者列表 (${matchedAuthors.length})`;
        authorGrid.innerHTML = matchedAuthors.length ? matchedAuthors.map((author, index) => `
            <div class="author-item" title="${author}">
                <span>${author}</span>
                <button class="delete-btn" data-index="${index}">X</button>
            </div>
        `).join('') : '<div class="author-item" style="grid-column: 1 / -1; text-align: center; color: #999;">暂无匹配作者</div>';

        toggleAuthorBtn.textContent = matchedAuthors.includes(currentAuthor) ? '删除当前作者' : '添加当前作者到匹配规则';
        toggleAuthorBtn.style.backgroundColor = matchedAuthors.includes(currentAuthor) ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? '#78c878' : '#90EE90') : (window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1a8cff' : '#00a1d6');

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-index'));
                const deletedAuthor = matchedAuthors[index];
                matchedAuthors.splice(index, 1);
                delete authorPlaybackRates[deletedAuthor];
                GM_setValue('matchedAuthors', matchedAuthors);
                GM_setValue('authorPlaybackRates', authorPlaybackRates);
                console.log(`已删除作者 ${deletedAuthor} 的匹配规则和倍速`);
                updateAuthorList();
                applyEnhancements();
                applyPlaybackRate();
            }, { once: true });
        });
    }

    /**
     * 自动启用字幕（带重试机制）
     * @param {number} retries 重试次数
     * @param {number} delay 重试间隔（毫秒）
     * @returns {Promise<boolean>} 是否成功启用字幕
     */
    async function enableSubtitles(retries = 3, delay = 500) {
        cache.subtitleButton = cache.subtitleButton || document.querySelector('.bpx-player-ctrl-btn.bpx-player-ctrl-subtitle, .bpx-player-ctrl-btn[aria-label*="字幕"], .bpx-player-control-wrap .subtitle-btn');

        if (!cache.subtitleButton) {
            console.log('未找到字幕按钮，等待播放器加载');
            return false;
        }

        if (cache.subtitleButton.classList.contains('bpx-state-active')) {
            const activeSubtitle = document.querySelector('.bpx-player-ctrl-subtitle-language-item.bpx-state-active');
            if (activeSubtitle && activeSubtitle.getAttribute('data-lan') !== 'close') {
                console.log(`字幕已启用，当前语言: ${activeSubtitle.querySelector('.bpx-player-ctrl-subtitle-language-item-text')?.textContent || '未知'}`);
                return true;
            }
        }

        for (let attempt = 1; attempt <= retries; attempt++) {
            cache.subtitleButton.click();
            console.log(`尝试 ${attempt}/${retries}：已点击字幕按钮，展开字幕菜单`);

            const subtitleItems = document.querySelectorAll('.bpx-player-ctrl-subtitle-major-inner .bpx-player-ctrl-subtitle-language-item');
            if (!subtitleItems.length) {
                console.log(`尝试 ${attempt}/${retries}：字幕语言列表为空，等待 ${delay}ms 后重试`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            const validSubtitle = Array.from(subtitleItems).find(item => {
                const lan = item.getAttribute('data-lan');
                return lan && lan !== 'close' && (lan.includes('zh') || lan.includes('ai-zh'));
            }) || Array.from(subtitleItems).find(item => item.getAttribute('data-lan') !== 'close');

            if (validSubtitle) {
                validSubtitle.click();
                console.log(`尝试 ${attempt}/${retries}：已选择字幕语言: ${validSubtitle.querySelector('.bpx-player-ctrl-subtitle-language-item-text')?.textContent || '未知'}`);
                return true;
            } else {
                console.log(`尝试 ${attempt}/${retries}：未找到有效字幕语言`);
                return false;
            }
        }

        console.log(`字幕启用失败：${retries} 次尝试后仍未加载字幕语言列表`);
        return false;
    }

    /**
     * 监听播放器加载
     */
    function monitorPlayerLoad() {
        const playerContainer = document.querySelector('.bpx-player-container, .bilibili-player');
        if (!playerContainer) {
            console.log('未找到播放器容器，初始化失败');
            return;
        }

        const observer = new MutationObserver(async (mutations, observer) => {
            cache.video = cache.video || document.querySelector('video');
            cache.playButton = cache.playButton || document.querySelector('.bpx-player-ctrl-btn.bpx-player-ctrl-play, .bpx-player-control-wrap .play-btn');
            cache.subtitleButton = cache.subtitleButton || document.querySelector('.bpx-player-ctrl-btn.bpx-player-ctrl-subtitle, .bpx-player-ctrl-btn[aria-label*="字幕"], .bpx-player-control-wrap .subtitle-btn');

            if (cache.video && cache.playButton && cache.subtitleButton) {
                console.log('播放器元素加载完成，执行自动播放、字幕启用和倍速应用');
                setTimeout(controlPlayerState, 1000);
                const subtitleSuccess = await enableSubtitles();
                if (!subtitleSuccess) {
                    console.log('字幕启用失败，可能是视频无字幕或加载超时');
                }
                applyPlaybackRate();
                observer.disconnect(); // 加载完成即停止监听
            }
        });

        observer.observe(playerContainer, { childList: true, subtree: true });
        console.log('已启用播放器加载监听');
    }

    /**
     * 应用增强功能
     */
    function applyEnhancements() {
        if (enhanceMode === 0 || (enhanceMode === 1 && matchedAuthors.includes(currentAuthor))) {
            updateRecListVisibility();
            updatePlayerTitle();
            monitorPlayerLoad(); // 启动播放器加载监听
        } else {
            htmlElement.classList.remove('rec-list-hidden');
        }
    }

    /**
     * 监听标题变化
     */
    function monitorTitleChange() {
        if (!titleElement) {
            console.log('未找到 <title> 元素');
            return;
        }

        let lastTitle = titleElement.textContent || '';
        const observer = new MutationObserver(() => {
            const newTitle = titleElement.textContent || '';
            if (newTitle !== lastTitle && (enhanceMode === 0 || (enhanceMode === 1 && matchedAuthors.includes(currentAuthor)))) {
                console.log(`标题变化: "${lastTitle}" -> "${newTitle}"`);
                updatePlayerTitle();
                monitorPlayerLoad(); // 标题变化后重新监听播放器，确保字幕和倍速应用
            }
            lastTitle = newTitle;
        });

        observer.observe(titleElement, { childList: true, characterData: true, subtree: true });
        console.log('已启用标题变化监听');
    }

    /**
     * 初始化脚本
     */
    function init() {
        currentAuthor = getCurrentAuthor();
        if (!currentAuthor) {
            console.log('无法获取作者信息，初始化失败');
            return;
        }

        console.log('初始化脚本，作者:', currentAuthor);
        createUI();
        applyEnhancements();
        applyPlaybackRate();
        bindPlaybackRateControls();
        monitorTitleChange();
    }

    // 页面加载完成时初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init,1000);
    } else {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    }
})();
