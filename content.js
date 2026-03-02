(async () => {
    const S = await chrome.storage.local.get(['state', 'mode', 'doComments', 'doPosts', 'targetSub', 'count']);
    if (S.state !== 'active') return;

    let n = S.count || 0;
    const ui = mkUI(); 
    upd(n, "Init...", "wait");
    loop(S);

    async function loop(cfg) {
        upd(n, "Scanning...", "scan");
        await wait(800);

        const items = Array.from(document.querySelectorAll('.thing')).filter(el => {
            if (el.hasAttribute('d-done')) return false;

            if (cfg.targetSub) {
                const itemSub = el.getAttribute('data-subreddit');
                if (!itemSub || itemSub.toLowerCase() !== cfg.targetSub) return false;
            }

            const isC = el.classList.contains('comment');
            const isP = el.classList.contains('link');
            if (isC && !cfg.doComments) return false;
            if (isP && !cfg.doPosts) return false;
            if (!isC && !isP) return false;

            const nsfw = el.classList.contains('over18') || el.querySelector('.nsfw-stamp') || el.querySelector('.acronym')?.innerText === 'NSFW';
            if (cfg.mode === 'NSFW' && !nsfw) return false;
            if (cfg.mode === 'SAFE' && nsfw) return false;
            return true;
        });

        if (items.length > 0) {
            upd(n, "Deleting...", "act");
            await kill(items[0]);
            n++;
            await chrome.storage.local.set({ count: n });
            setTimeout(() => loop(cfg), 1000);
        } else {
            upd(n, "Next Page...", "nav");
            const next = document.querySelector('.next-button a');
            if (next) {
                await wait(1500);
                window.location.href = next.href;
            } else {
                done(n);
            }
        }
    }

    async function kill(el) {
        el.setAttribute('d-done', '1');
        el.style.opacity = '0.1'; el.style.pointerEvents = 'none';
        const d = el.querySelector('form.del-button .togglebutton');
        if (d) {
            d.click();
            await wait(150);
            const y = el.querySelector('form.del-button .option.error a.yes');
            if (y) y.click();
        }
    }

    async function done(c) {
        await chrome.storage.local.set({ state: 'stopped' });
        upd(c, "Done.", "done");
        if(c===0) setTimeout(()=>ui.host.remove(), 3000);
    }

    function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

    function mkUI() {
        const h = document.createElement('div');
        h.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:999999;";
        document.body.appendChild(h);
        const s = h.attachShadow({mode:'open'});
        const css = `.box{background:rgba(10,10,10,0.95);backdrop-filter:blur(8px);color:#fff;font-family:sans-serif;width:200px;border-radius:10px;padding:15px;box-shadow:0 8px 30px rgba(0,0,0,0.5);border:1px solid #333}.row{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.cnt{background:#ff4500;padding:2px 8px;border-radius:8px;font-size:11px;font-weight:700}.stat{display:flex;align-items:center;gap:8px;font-size:12px;color:#ccc;margin-bottom:12px}.dot{width:8px;height:8px;border-radius:50%;background:#555}.scan{background:#00d26a;box-shadow:0 0 5px #00d26a}.act{background:#ff4500;box-shadow:0 0 5px #ff4500}.btn{width:100%;padding:8px;background:#222;color:#aaa;border:none;border-radius:5px;cursor:pointer;font-size:10px}.btn:hover{color:#fff}`;
        s.innerHTML = `<style>${css}</style><div class="box"><div class="row"><span style="font-weight:700;font-size:11px;color:#888">REDDIT NUKER</span><span class="cnt" id="c">0</span></div><div class="stat"><div class="dot" id="d"></div><span id="t">...</span></div><button class="btn" id="x">STOP</button></div>`;
        s.getElementById('x').onclick = () => { chrome.storage.local.set({state:'stopped'}); window.location.reload(); };
        return { shadow: s, host: h };
    }

    function upd(c, t, st) {
        const r = ui.shadow;
        r.getElementById('c').innerText = c;
        r.getElementById('t').innerText = t;
        r.getElementById('d').className = `dot ${st}`;
    }
})();