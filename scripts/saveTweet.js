// ==UserScript==
// @name         Save Tweets with Picseed
// @namespace    https://github.com/AmintaCCCP/tampermonkey-script
// @version      0.1
// @description  Save Tweets with Picseed
// @author       AmintaCCCP
// @match        https://x.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to create and add save button
    function addSaveButton(tweet) {
        if (tweet.querySelector('.save-button')) return;

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.className = 'save-button';
        saveButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 75px;
            display: none;
            padding: 5px 10px;
            background-color: #1DA1F2;
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
        `;

        saveButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tweetUrl = tweet.querySelector('a[href*="/status/"]').href;
            window.location.href = `picseed://parser?content=${encodeURIComponent(tweetUrl)}`;
        });

        tweet.style.position = 'relative';
        tweet.appendChild(saveButton);

        tweet.addEventListener('mouseenter', () => saveButton.style.display = 'block');
        tweet.addEventListener('mouseleave', () => saveButton.style.display = 'none');
    }

    // Function to observe DOM changes
    function observeDOM() {
        const observer = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const tweets = node.querySelectorAll('article');
                        tweets.forEach(addSaveButton);
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Initial run for existing tweets
    document.querySelectorAll('article').forEach(addSaveButton);

    // Start observing DOM changes
    observeDOM();
})();