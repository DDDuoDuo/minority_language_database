(function () {
    const STORAGE_KEYS = {
      isLoggedIn: 'isLoggedIn',
      username: 'username'
    };

    function setLogin(u) {
      sessionStorage.setItem(STORAGE_KEYS.isLoggedIn, 'true');
      sessionStorage.setItem(STORAGE_KEYS.username, u || '');
      notifyProfileChanged();
    }

    function clearLogin() {
      sessionStorage.removeItem(STORAGE_KEYS.isLoggedIn);
      sessionStorage.removeItem(STORAGE_KEYS.username);
      notifyProfileChanged();
    }

    function isLoggedIn() {
      return sessionStorage.getItem(STORAGE_KEYS.isLoggedIn) === 'true';
    }

    function getUsername() {
      return sessionStorage.getItem(STORAGE_KEYS.username) || '';
    }

    let backdrop = null;
    function ensureModalInjected() {
        if (backdrop) return;
        backdrop = document.createElement('div');
        backdrop.className = 'auth-backdrop';
        backdrop.innerHTML = `
            <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <div class="auth-header">
                <div class="auth-title" id="auth-title">登录</div>
                <button class="auth-close" aria-label="关闭" type="button">×</button>
            </div>
            <div class="auth-body">
                <div class="auth-row">
                <label for="auth-username">用户名</label>
                <input id="auth-username" class="auth-input" type="text" placeholder="请输入用户名">
                </div>
                <div class="auth-row">
                <label for="auth-password">密码</label>
                <input id="auth-password" class="auth-input" type="password" placeholder="请输入密码">
                </div>
                <div class="auth-row" id="auth-error" style="display:none; color:#c00;">请输入用户名或密码</div>
            </div>
            <div class="auth-footer">
                <button class="auth-btn secondary" id="auth-cancel" type="button">取消</button>
                <button class="auth-btn primary" id="auth-submit" type="button">登录</button>
            </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        const closeBtn = backdrop.querySelector('.auth-close');
        const cancelBtn = backdrop.querySelector('#auth-cancel');
        const submitBtn = backdrop.querySelector('#auth-submit');
    
        function close() {
            backdrop.classList.remove('is-open');
        
        }
        closeBtn.addEventListener('click', close);
        cancelBtn.addEventListener('click', close);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) close();
        });
  
        submitBtn.addEventListener('click', () => {
            const u = backdrop.querySelector('#auth-username').value.trim();
            const p = backdrop.querySelector('#auth-password').value.trim();
            const err = backdrop.querySelector('#auth-error');
            if (!u || !p) {
            err.style.display = 'block';
            return;
            }
            err.style.display = 'none';
            setLogin(u);
            close();
            callbacks.forEach(cb => { try { cb(u); } catch {} });
        });
    }
  
    function openModal() {
        ensureModalInjected();
        const err = backdrop.querySelector('#auth-error');
        err.style.display = 'none';
        backdrop.querySelector('#auth-username').value = '';
        backdrop.querySelector('#auth-password').value = '';
        backdrop.classList.add('is-open');
        backdrop.querySelector('#auth-username').focus();
    }
  
    const profileTargets = new Set();
    function notifyProfileChanged() {
        const u = getUsername();
        const logged = isLoggedIn();
        profileTargets.forEach(el => {
            if (!el) return;
            el.textContent = logged && u ? u : '登录';
        });
    }

    function bindProfileName(target) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;
        profileTargets.add(el);
        const u = getUsername();
        el.textContent = isLoggedIn() && u ? u : '登录';
        el.addEventListener('click', () => {
            if (!isLoggedIn()) {
                openModal();
            }
        });
    }

    const callbacks = [];
    window.Auth = {
        init() { ensureModalInjected(); notifyProfileChanged(); },
        showLogin() { openModal(); },
        logout() { clearLogin(); },
        isLoggedIn,
        getUsername,
        onLogin(cb) { if (typeof cb === 'function') callbacks.push(cb); },
        bindProfileName,
        requireLogin(action) {
            if (isLoggedIn()) { action && action(); }
            else {
            openModal();
            this.onLogin(() => action && action());
            }
        }
    };
  })();
