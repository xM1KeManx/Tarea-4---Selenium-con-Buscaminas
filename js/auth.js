// auth.js - maneja login/register/session usando localStorage
(function(){
  const STORAGE_USERS = 'bm_users_v1';
  const STORAGE_SESSION = 'bm_session_v1';

  function getUsers(){
    return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
  }
  function saveUsers(u){ localStorage.setItem(STORAGE_USERS, JSON.stringify(u)); }

  // ensure default admin exists
  function ensureDefault(){
    const users = getUsers();
    if(!users.find(x => x.user === 'admin')){
      users.push({user:'admin', pass:'1234', created:Date.now()});
      saveUsers(users);
    }
  }
  ensureDefault();

  // page-specific logic
  document.addEventListener('DOMContentLoaded', ()=>{
    const path = location.pathname;
    if(path.endsWith('index.html') || path.endsWith('/html/') || path.endsWith('/')){
      let btnLogin = document.getElementById('btnLogin');
      let msg = document.getElementById('msg');
      btnLogin.addEventListener('click', ()=>{
        const u = document.getElementById('user').value.trim();
        const p = document.getElementById('pass').value.trim();
        const users = getUsers();
        const found = users.find(x=> x.user === u && x.pass === p);
        if(!found){
          msg.textContent = 'Usuario o contraseña incorrectos. Si no tienes cuenta, regístrate.';
          return;
        }
        localStorage.setItem(STORAGE_SESSION, JSON.stringify({user:u, started:Date.now()}));
        // si login OK, ir a juego
        location.href = 'juego.html';
      });

      // auto-direct if session exists
      const sess = JSON.parse(localStorage.getItem(STORAGE_SESSION) || 'null');
      if(sess && sess.user) location.href = 'juego.html';
    }

    if(path.endsWith('register.html')){
      document.getElementById('btnRegister').addEventListener('click', ()=>{
        const u = document.getElementById('r_user').value.trim();
        const p = document.getElementById('r_pass').value.trim();
        const msg = document.getElementById('r_msg');
        if(!u || !p){ msg.textContent = 'Rellena usuario y contraseña'; return; }
        const users = getUsers();
        if(users.find(x=> x.user === u && x.pass === p)){
          msg.textContent = 'Ese usuario ya está registrado con esa contraseña. Inicia sesión.';
          return;
        }
        if(users.find(x=> x.user === u)){
          msg.textContent = 'Ese nombre de usuario ya existe, elige otro.';
          return;
        }
        users.push({user:u, pass:p, created:Date.now()});
        saveUsers(users);
        // al registrarse, iniciar sesión y redirigir al juego
        localStorage.setItem(STORAGE_SESSION, JSON.stringify({user:u, started:Date.now()}));
        location.href = 'juego.html';
      });
    }

    // Common: logout link in pages that have it
    const logout = document.getElementById('logout');
    if(logout){
      logout.addEventListener('click', (e)=>{
        e.preventDefault();
        localStorage.removeItem(STORAGE_SESSION);
        location.href = 'index.html';
      });
    }

    // show current user if in juego.html
    const cur = JSON.parse(localStorage.getItem(STORAGE_SESSION) || 'null');
    if(cur && document.getElementById('currentUser')){
      document.getElementById('currentUser').textContent = cur.user;
    }
  });
})();
