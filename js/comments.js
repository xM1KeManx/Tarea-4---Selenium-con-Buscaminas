// comments.js
(function(){
  const STORAGE_COMMENTS = 'bm_comments_v1';
  const STORAGE_SESSION = 'bm_session_v1';
  const STORAGE_LAST_COMMENT = 'bm_last_comment_v1'; // map user->timestamp, stored as object

  function getComments(){ return JSON.parse(localStorage.getItem(STORAGE_COMMENTS)||'[]'); }
  function saveComments(v){ localStorage.setItem(STORAGE_COMMENTS, JSON.stringify(v)); }

  function getLasts(){ return JSON.parse(localStorage.getItem(STORAGE_LAST_COMMENT)||'{}'); }
  function saveLasts(o){ localStorage.setItem(STORAGE_LAST_COMMENT, JSON.stringify(o)); }

  document.addEventListener('DOMContentLoaded', ()=>{
    const send = document.getElementById('sendComment');
    const list = document.getElementById('commentList');
    const txt = document.getElementById('commentTxt');
    const msg = document.getElementById('commentMsg');

    if(!send) return;

    function render(){
      list.innerHTML = '';
      const cs = getComments();
      cs.slice().reverse().forEach(c=>{
        const d = document.createElement('div');
        d.className = 'comment-item';
        d.innerHTML = `<strong>${escapeHtml(c.user)}</strong> <span style="font-size:12px;color:#666">(${new Date(c.when).toLocaleString()})</span><div>${escapeHtml(c.text)}</div>`;
        list.appendChild(d);
      });
    }

    send.addEventListener('click', ()=>{
      const session = JSON.parse(localStorage.getItem(STORAGE_SESSION)||'null');
      if(!session){ msg.textContent = 'Debes iniciar sesión para comentar.'; return; }
      const user = session.user;
      const text = txt.value.trim();
      if(!text){ msg.textContent = 'Escribe un comentario antes de enviar.'; return; }

      // cooldown check: 30 mins = 1800000 ms
      const lasts = getLasts();
      const last = lasts[user] || 0;
      if(Date.now() - last < 30*60*1000){
        msg.textContent = 'Solo puedes enviar un comentario cada 30 minutos.';
        return;
      }

      const cs = getComments();
      cs.push({user, text, when: Date.now()});
      saveComments(cs);
      lasts[user] = Date.now();
      saveLasts(lasts);
      txt.value = '';
      msg.textContent = 'Comentario enviado.';
      render();
      setTimeout(()=> msg.textContent='', 2500);
    });

    render();
  });

  function escapeHtml(s){ return s.replace(/[&<>"]/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[m])); }
})();
