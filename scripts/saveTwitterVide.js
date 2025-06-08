// ==UserScript==
// @name         X.com Video Downie Downloader
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  在X.com的视频上添加Downie下载按钮
// @author       Your name
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建下载按钮的样式
    const style = document.createElement('style');
    style.textContent = `
        .downie-download-btn {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            z-index: 999999;
            display: none;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .video-with-download-btn:hover .downie-download-btn {
            display: block !important;
        }
    `;
    document.head.appendChild(style);

    // 转换URL从twitter.com到x.com
    function convertTwitterToX(url) {
        return url.replace('twitter.com', 'x.com');
    }

    // 打开Downie下载
    function openInDownie(url) {
        // 转换URL
        url = convertTwitterToX(url);
        let action_url = "downie://XUOpenLink?url=" + encodeURI(url);
        action_url = action_url.replaceAll("&", "%26");
        action_url = action_url.replaceAll("#", "%23");
        window.location.href = action_url;
    }

    // 为视频添加下载按钮
    function addDownloadButton(videoContainer) {
        if (videoContainer.querySelector('.downie-download-btn')) return;

        // 添加标识类
        videoContainer.classList.add('video-with-download-btn');

        // 确保容器是相对定位
        videoContainer.style.position = 'relative';

        const downloadBtn = document.createElement('div');
        downloadBtn.className = 'downie-download-btn';
        downloadBtn.textContent = '下载视频';
        downloadBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // 获取当前推文URL
            const tweetElement = videoContainer.closest('article');
            if (tweetElement) {
                const tweetLink = tweetElement.querySelector('a[href*="/status/"]');
                if (tweetLink) {
                    const tweetUrl = 'https://twitter.com' + tweetLink.getAttribute('href');
                    openInDownie(tweetUrl);
                }
            }
        };

        videoContainer.appendChild(downloadBtn);
    }

    // 查找视频容器并添加下载按钮
    function processNewVideos() {
        // 查找所有视频容器
        const videoContainers = document.querySelectorAll('div[data-testid="videoComponent"]:not(.video-with-download-btn)');
        videoContainers.forEach(addDownloadButton);
    }

    // 创建观察器实例
    const observer = new MutationObserver((mutations) => {
        processNewVideos();
    });

    // 开始观察DOM变化
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 初始处理
    processNewVideos();

    // 定期检查新视频（备用方案）
    setInterval(processNewVideos, 2000);
})();
