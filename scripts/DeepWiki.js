// ==UserScript==
// @name         DeepWiki
// @namespace    https://github.com/AmintaCCCP/
// @version      1.0
// @description  Add a button to open the corresponding wiki page on DeepWiki
// @author       tamina
// @match        https://github.com/*
// @icon         https://www.google.com/s2/favicons?domain=github.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addWikiButton() {
        // Check if we're on a repository page
        const repoPath = window.location.pathname.match(/^\/([^/]+)\/([^/]+)(?:\/|$)/);
        if (repoPath) {
            // Get the username and repository name from the URL
            const username = repoPath[1];
            const repo = repoPath[2];

            // Create the wiki button
            const wikiButton = document.createElement('a');
            wikiButton.classList.add('btn', 'btn-sm', 'btn-outline', 'ml-2');
            wikiButton.style.position = 'fixed';
            wikiButton.style.bottom = '20px';
            wikiButton.style.right = '20px';
            wikiButton.style.zIndex = '9999';
            wikiButton.href = `https://deepwiki.com/${username}/${repo}`;
            wikiButton.target = '_blank';
            wikiButton.title = 'Open Wiki on DeepWiki';

            // Add the Emoji light bulb icon
            wikiButton.textContent = '💡';

            // Append the button to the page
            const repoHeader = document.querySelector('.BorderGrid-cell');
            if (repoHeader) {
                repoHeader.appendChild(wikiButton);
            } else {
                document.body.appendChild(wikiButton);
            }
        }
    }

    // Add the wiki button when the page loads
    window.addEventListener('load', addWikiButton);
})();
