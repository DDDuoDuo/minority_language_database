document.addEventListener("click", (e) => {
    if (e.target.id === "switchToRegister") {
        // document.getElementById("switchHint").textContent = "已有账号？";
        document.getElementById("authTitle").textContent = "注册";
    }
    if (e.target.id === "switchToLogin") {
        // document.getElementById("switchHint").textContent = "没有账号？";
        document.getElementById("authTitle").textContent = "登录";
    }
    if (e.target.id === "loginBtn") {
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            sessionStorage.setItem("currentUser", JSON.stringify(user));
            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("username", user.username);
            closeAuthModal();
            if (window.Auth?.init) Auth.init();
        } else {
            document.getElementById("loginError").textContent = "邮箱或密码错误";
        }
    }
    if (e.target.id === "registerBtn") {
        const email = document.getElementById("registerEmail").value.trim();
        const username = document.getElementById("registerUsername").value.trim();
        const password = document.getElementById("registerPassword").value.trim();
        if (!email || !username || !password) {
            document.getElementById("registerError").textContent = "请填写所有字段";
            return;
        }
        if (users.some(u => u.email === email)) {
            document.getElementById("registerError").textContent = "该邮箱已被注册";
            return;
        }
        users.push({ email, username, password });
        sessionStorage.setItem("users", JSON.stringify(users));
        alert("注册成功，请登录");
        document.getElementById("switchToLogin").click();
    }
});

function openAuthModal() {
    const m = document.getElementById('authModal');
    if (m) m.classList.remove('hidden');
}

function closeAuthModal() {
    const m = document.getElementById('authModal');
    if (m) m.classList.add('hidden');
}  

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
      sessionStorage.removeItem(STORAGE_KEYS.currentUser);
      notifyProfileChanged();
    }

    function isLoggedIn() {
      return sessionStorage.getItem(STORAGE_KEYS.isLoggedIn) === 'true';
    }

    function getUsername() {
      return sessionStorage.getItem(STORAGE_KEYS.username) || '';
    }

    function openModal() {
        openAuthModal();
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

    // function bindProfileName(target) {
    //     const el = typeof target === 'string' ? document.querySelector(target) : target;
    //     if (!el) return;
    //     profileTargets.add(el);
    //     const u = getUsername();
    //     el.textContent = isLoggedIn() && u ? u : '登录';
    //     el.addEventListener('click', () => {
    //         if (!isLoggedIn()) {
    //             openModal();
    //         }
    //     });
    // }

    window.Auth = {
        init() {
          this.loadAuthUI();
          this.bindEvents();
        },
      
        loadAuthUI() {
            const container = document.getElementById("authContainer");
            if (!container) return;
            container.innerHTML = `
              <div id="authModal" class="auth-modal hidden">
                <div class="auth-box" role="dialog" aria-modal="true" aria-labelledby="authTitle">
                  <div class="auth-box-header">
                    <h2 id="authTitle">登录</h2>
                    <button type="button" class="auth-close" id="authCloseBtn" aria-label="关闭">×</button>
                  </div>
          
                  <div id="loginForm" class="auth-form">
                    <input type="email" id="loginEmail" class="auth-input" placeholder="邮箱" autocomplete="email">
                    <input type="password" id="loginPassword" class="auth-input" placeholder="密码" autocomplete="current-password">
                    <p id="loginError" class="error-msg"></p>
                    <button id="authSubmit" class="auth-box-button">登录</button>
                    <p class="switch-text">没有账号？<a href="#" id="authSwitchLink">注册</a></p>
                  </div>
          
                  <div id="registerForm" class="auth-form hidden">
                    <input type="email" id="registerEmail" class="auth-input" placeholder="邮箱" autocomplete="email">
                    <input type="text" id="registerUsername" class="auth-input" placeholder="用户名" autocomplete="username">
                    <input type="password" id="registerPassword" class="auth-input" placeholder="密码" autocomplete="new-password">
                    <p id="registerError" class="error-msg"></p>
                    <button id="authSubmitRegister" class="auth-box-button">注册</button>
                    <p class="switch-text">已有账号？<a href="#" id="authSwitchLink">登录</a></p>
                  </div>
                </div>
              </div>
            `;
        },          
        
        bindEvents() {
            document.addEventListener("click", (e) => {
                if (e.target && e.target.id === "authSwitchLink") {
                    e.preventDefault();
                    const isLoginVisible = !document.getElementById("loginForm")?.classList.contains("hidden");
                    if (isLoginVisible) {
                        this.showRegister();
                    } else {
                        this.showLogin();
                    }
                    return;
                }
            
                if (e.target && e.target.id === "authSubmit") {
                    e.preventDefault();
                    this.login();
                    return;
                }

                if (e.target && e.target.id === "authSubmitRegister") {
                    e.preventDefault();
                    this.register();
                    return;
                }
            
                if (e.target && e.target.id === "authCloseBtn") {
                    e.preventDefault();
                    closeAuthModal();
                    return;
                }
            });
          

            document.addEventListener("mousedown", (e) => {
                const modal = document.getElementById("authModal");
                const box = document.querySelector(".auth-box");
                if (!modal || !box) return;
                if (!modal.classList.contains("hidden") && e.target === modal) {
                    closeAuthModal();
                }
            });

            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    const modal = document.getElementById("authModal");
                    if (modal && !modal.classList.contains("hidden")) {
                        closeAuthModal();
                    }
                }
            });
        },          
        
        showLogin() {
            const modal = document.getElementById("authModal");
            const login = document.getElementById("loginForm");
            const reg = document.getElementById("registerForm");
            if (!modal || !login || !reg) return;
          
            document.getElementById("authTitle").textContent = "登录";
            login.classList.remove("hidden");
            reg.classList.add("hidden");

            const err = document.getElementById("loginError");
            if (err) err.textContent = "";
          
            const emailEl = document.getElementById("loginEmail");
            if (emailEl) emailEl.value = "";
            const passEl = document.getElementById("loginPassword");
            if (passEl) passEl.value = "";
          
            openAuthModal();
        },
          
        showRegister() {
            const modal = document.getElementById("authModal");
            const login = document.getElementById("loginForm");
            const reg = document.getElementById("registerForm");
            if (!modal || !login || !reg) return;
          
            document.getElementById("authTitle").textContent = "注册";
            login.classList.add("hidden");
            reg.classList.remove("hidden");
          
            const err = document.getElementById("registerError");
            if (err) err.textContent = "";

            const emailEL = document.getElementById("registerEmail");
            if (emailEL) emailEL.value = "";
            const userEL = document.getElementById("registerUsername");
            if (userEL) userEL.value = "";
            const passEL = document.getElementById("registerPassword");
            if (passEL) passEL.value = "";
          
            openAuthModal();
        },          

        login() {
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value.trim();
            const error = document.getElementById("loginError");
        
            const users = JSON.parse(sessionStorage.getItem("users") || "{}");
            if (!users[email] || users[email].password !== password) {
                error.textContent = "邮箱或密码错误";
                return;
            }
        
            sessionStorage.setItem("currentUser", JSON.stringify(users[email]));
            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("username", users[email].username);
            closeAuthModal();
            this.bindProfileName('#userStatus');
        },
        
        register() {
            const email = document.getElementById("registerEmail").value.trim();
            const username = document.getElementById("registerUsername").value.trim();
            const password = document.getElementById("registerPassword").value.trim();
            const error = document.getElementById("registerError");
        
            if (!email || !username || !password) {
                error.textContent = "请填写所有字段";
                return;
            }
        
            const users = JSON.parse(sessionStorage.getItem("users") || "{}");
            if (users[email]) {
                error.textContent = "该邮箱已注册";
                return;
            }
        
            users[email] = { email, username, password };
            sessionStorage.setItem("users", JSON.stringify(users));
        
            sessionStorage.setItem("currentUser", JSON.stringify(users[email]));
            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("username", username);
            closeAuthModal();
            this.bindProfileName('#userStatus');
        },
        
        logout() {
            sessionStorage.removeItem("currentUser");
        },
        
        isLoggedIn() {
            return !!sessionStorage.getItem("currentUser");
        },
        
        getCurrentUser() {
            return JSON.parse(sessionStorage.getItem("currentUser"));
        },
        
        bindProfileName(selector) {
            const user = this.getCurrentUser();
            const span = document.querySelector(selector);
            if (span) span.textContent = user ? user.username : "登录";
        },
        
        requireLogin(callback) {
            if (this.isLoggedIn()) callback();
            else this.showLogin();
        }
    };      
})();
