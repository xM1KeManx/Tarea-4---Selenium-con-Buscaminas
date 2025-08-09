// reports.js
(function(){
  const STORAGE_REPS = 'bm_reports_v1';
  const STORAGE_LAST_REP = 'bm_last_report_v1';

  function getReps(){ return JSON.parse(localStorage.getItem(STORAGE_REPS)||'[]'); }
  function saveReps(v){ localStorage.setItem(STORAGE_REPS, JSON.stringify(v)); }

  function getLast(){ return JSON.parse(localStorage.getItem(STORAGE_LAST_REP)||'{}'); }
  function saveLast(o){ localStorage.setItem(STORAGE_LAST_REP, JSON.stringify(o)); }

  document.addEventListener('DOMContentLoaded', ()=>{
    const btn = document.getElementById('sendReport');
    if(!btn) return;
    const title = document.getElementById('rep_title');
    const email = document.getElementById('rep_email');
    const msg = document.getElementById('rep_msg') || document.getElementById('reportMsg');
    const body = document.getElementById('rep_msg');

    btn.addEventListener('click', ()=>{
      const session = JSON.parse(localStorage.getItem('bm_session_v1')||'null');
      if(!session){ msg.textContent = 'Debes iniciar sesión para reportar.'; return; }
      const user = session.user;
      const t = title.value.trim();
      const e = email.value.trim();
      const b = body.value.trim();
      if(!t || !e || !b){ msg.textContent = 'Completa todos los campos.'; return; }

      const lasts = getLast();
      const last = lasts[user] || 0;
      if(Date.now() - last < 30*60*1000){ msg.textContent = 'Solo puedes enviar un reporte cada 30 minutos.'; return; }

      const reps = getReps();
      reps.push({user, title:t, email:e, body:b, when:Date.now()});
      saveReps(reps);
      lasts[user] = Date.now();
      saveLast(lasts);
      msg.textContent = 'Reporte enviado correctamente.';
      title.value = ''; email.value = ''; body.value = '';
      setTimeout(()=> msg.textContent='', 4000);
    });
  });
})();
