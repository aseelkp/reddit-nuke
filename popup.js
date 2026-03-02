document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes("old.reddit.com/user/")) {
        document.getElementById('ui').style.opacity = '0.3';
        document.getElementById('ui').style.pointerEvents = 'none';
        document.getElementById('warn').style.display = 'block';
        document.getElementById('goOld').onclick = () => {
            chrome.tabs.update(tab.id, { url: "https://old.reddit.com/user/me/overview" });
            window.close();
        };
        return;
    }

    let mode = 'NSFW';
    const bN = document.getElementById('mNSFW');
    const bS = document.getElementById('mSafe');
    const bA = document.getElementById('mAll');
    const btn = document.getElementById('start');

    const reset = () => {
        bN.className = 'opt'; bS.className = 'opt'; bA.className = 'opt';
    };

    bN.onclick = () => { mode = 'NSFW'; reset(); bN.className = 'opt nsfw'; btn.style.background='#ff4500'; btn.innerText='NUKE NSFW ITEMS'; };
    bS.onclick = () => { mode = 'SAFE'; reset(); bS.className = 'opt safe'; btn.style.background='#00d26a'; btn.innerText='NUKE SAFE ITEMS'; };
    bA.onclick = () => { mode = 'ALL'; reset(); bA.className = 'opt all'; btn.style.background='#d32f2f'; btn.innerText='NUKE EVERYTHING'; };

    btn.onclick = async () => {
        const c = document.getElementById('chkC').checked;
        const p = document.getElementById('chkP').checked;
        if(!c && !p) { btn.innerText = "SELECT TARGET"; return; }

        let sub = document.getElementById('subInput').value.trim().toLowerCase();
        if (sub.startsWith('r/')) sub = sub.substring(2);

        await chrome.storage.local.set({ 
            state: 'active', mode: mode, 
            doComments: c, doPosts: p, targetSub: sub, count: 0 
        });
        chrome.tabs.reload(tab.id);
        window.close();
    };

    document.getElementById('stop').onclick = async () => {
        await chrome.storage.local.set({ state: 'stopped' });
        chrome.tabs.reload(tab.id);
        window.close();
    };
});