// ==UserScript==
// @name         HF-Mirror
// @namespace    https://github.com/AmintaCCCP/
// @version      1.0
// @description  When visiting Huggingface, switch to the mirror site with one click.
// @author       tamina
// @match        https://huggingface.co/*
// @icon         https://www.google.com/s2/favicons?domain=huggingface.co
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addMirrorButton() {
        // Check if we're on a repository page
        const repoPath = window.location.pathname.match(/^\/([^/]+)\/([^/]+)(?:\/|$)/);
        if (repoPath) {
            // Get the username and repository name from the URL
            const username = repoPath[1];
            const repo = repoPath[2];

            // Create the Mirror button
            const MirrorButton = document.createElement('a');
            MirrorButton.classList.add('btn', 'btn-sm', 'btn-outline', 'ml-2');
            MirrorButton.style.position = 'fixed';
            MirrorButton.style.bottom = '20px';
            MirrorButton.style.right = '20px';
            MirrorButton.style.zIndex = '9999';
            MirrorButton.href = `https://https://hf-mirror.com/${username}/${repo}`;
            MirrorButton.target = '_blank';
            MirrorButton.title = 'Open Mirror site on Huggingface';

            // Add the Emoji light bulb icon
            MirrorButton.textContent = '🪩';

            // Append the button to the page
            const repoHeader = document.querySelector('.BorderGrid-cell');
            if (repoHeader) {
                repoHeader.appendChild(MirrorButton);
            } else {
                document.body.appendChild(MirrorButton);
            }
        }
    }

    // Add the Mirror button when the page loads
    window.addEventListener('load', addMirrorButton);
})();
