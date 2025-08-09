// game.js
(function(){
  const ROWS = 6;
  const COLS = 10;
  const MINES = 10;
  const BOARD_KEY = 'bm_board_v1';

  // sonidos
  const sLeft = document.getElementById('s_click_left');
  const sRight = document.getElementById('s_click_right');
  const sFlag = document.getElementById('s_flag');
  const sExpl = document.getElementById('s_explosion');
  const sVictory = document.getElementById('s_victory');
  const sFail = document.getElementById('s_fail');

  // elementos
  const boardEl = document.getElementById('board');
  const minesCountEl = document.getElementById('minesCount');
  const modal = document.getElementById('modalResult');
  const modalTitle = document.getElementById('modalTitle');
  const modalText = document.getElementById('modalText');
  const modalNew = document.getElementById('modalNew');
  const modalRestart = document.getElementById('modalRestart');

  let grid = []; // {mine:boolean, revealed:boolean, mark: 'none'|'flag'|'question', adj:number}
  let gameOver = false;
  let flagsPlaced = 0;

  function setupBoard(){
    grid = [];
    gameOver = false;
    flagsPlaced = 0;
    for(let r=0;r<ROWS;r++){
      grid[r] = [];
      for(let c=0;c<COLS;c++){
        grid[r][c] = {mine:false, revealed:false, mark:'none', adj:0};
      }
    }
    // place mines
    let placed=0;
    while(placed<MINES){
      const r = Math.floor(Math.random()*ROWS);
      const c = Math.floor(Math.random()*COLS);
      if(!grid[r][c].mine){
        grid[r][c].mine = true;
        placed++;
      }
    }
    // adj counts
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        grid[r][c].adj = countAdj(r,c);
      }
    }
  }

  function countAdj(r,c){
    let cnt=0;
    for(let dr=-1;dr<=1;dr++){
      for(let dc=-1;dc<=1;dc++){
        if(dr===0 && dc===0) continue;
        const rr=r+dr, cc=c+dc;
        if(rr>=0 && rr<ROWS && cc>=0 && cc<COLS && grid[rr][cc].mine) cnt++;
      }
    }
    return cnt;
  }

  function renderBoard(){
    boardEl.style.gridTemplateColumns = `repeat(${COLS}, 48px)`;
    boardEl.innerHTML = '';
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        updateCellVisual(cell, grid[r][c]);
        // left click
        cell.addEventListener('click', (e)=>{
          if(gameOver) return;
          handleLeft(r,c, cell);
        });
        // right click
        cell.addEventListener('contextmenu', (e)=>{
          e.preventDefault();
          if(gameOver) return;
          handleRight(r,c, cell);
        });
        boardEl.appendChild(cell);
      }
    }
    minesCountEl.textContent = MINES - flagsPlaced;
  }

  function updateCellVisual(el, data){
    el.className = 'cell';
    if(data.revealed) el.classList.add('revealed');
    if(data.mark === 'flag') el.classList.add('flag');
    if(data.mark === 'question') el.classList.add('question');
    if(data.revealed && data.mine) el.classList.add('mine');
    if(data.revealed && !data.mine && data.adj>0){
      el.textContent = data.adj;
      el.classList.add('number-'+data.adj);
    } else if(!data.revealed){
      el.textContent = '';
    }
  }

  function handleLeft(r,c, el){
    sLeft && sLeft.play();
    const cell = grid[r][c];
    if(cell.mark === 'flag' || cell.mark === 'question') {
      // do nothing, left click on flag/question no reveal
      return;
    }
    if(cell.mine){
      // explode
      revealAllMines();
      sExpl && sExpl.play();
      gameOver = true;
      showModal(false, 'Has perdido. Pisaste una mina.');
      sFail && sFail.play();
      return;
    }
    revealCell(r,c);
    renderBoard();
    checkWin();
  }

  function revealCell(r,c){
    const cell = grid[r][c];
    if(cell.revealed) return;
    cell.revealed = true;
    if(cell.adj === 0 && !cell.mine){
      // flood fill
      for(let dr=-1;dr<=1;dr++){
        for(let dc=-1;dc<=1;dc++){
          const rr=r+dr, cc=c+dc;
          if(rr>=0 && rr<ROWS && cc>=0 && cc<COLS){
            if(!grid[rr][cc].revealed) revealCell(rr,cc);
          }
        }
      }
    }
  }

  function revealAllMines(){
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        if(grid[r][c].mine) grid[r][c].revealed = true;
      }
    }
    renderBoard();
  }

  function handleRight(r,c, el){
    const cell = grid[r][c];
    // cycle none -> flag -> question -> none
    if(cell.mark === 'none'){
      cell.mark = 'flag';
      flagsPlaced++;
      sRight && sRight.play();
      sFlag && sFlag.play();
    } else if(cell.mark === 'flag'){
      cell.mark = 'question';
      flagsPlaced--;
      sRight && sRight.play();
    } else if(cell.mark === 'question'){
      cell.mark = 'none';
      sRight && sRight.play();
    }
    renderBoard();
    minesCountEl.textContent = MINES - flagsPlaced;
    checkWin();
  }

  function checkWin(){
    // win when all non-mine cells are revealed
    let ok = true;
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const cell = grid[r][c];
        if(!cell.mine && !cell.revealed) { ok=false; break; }
      }
      if(!ok) break;
    }
    if(ok && !gameOver){
      gameOver = true;
      showModal(true, '¡Felicidades! Has ganado.');
      sVictory && sVictory.play();
    }
  }

  function showModal(win, text){
    modalTitle.textContent = win ? 'Ganaste' : 'Perdiste';
    modalText.textContent = text;
    modal.classList.remove('hidden');
  }

  function hideModal(){ modal.classList.add('hidden'); }

  // new game & restart
  function newGame(){
    setupBoard();
    renderBoard();
    hideModal();
  }
  function restartSame(){
    // just start a fresh board (same effect)
    newGame();
  }

  // bind events
  document.addEventListener('DOMContentLoaded', ()=>{
    setupBoard();
    renderBoard();
    document.getElementById('newGame').addEventListener('click', (e)=>{ e.preventDefault(); newGame(); });
    document.getElementById('restart').addEventListener('click', (e)=>{ e.preventDefault(); restartSame(); });
    modalNew.addEventListener('click', ()=>{ newGame(); });
    modalRestart.addEventListener('click', ()=>{ restartSame(); });
    // close modal on background click
    modal.addEventListener('click', (e)=>{ if(e.target === modal) hideModal(); });

    // open comments panel scroll behavior
    const openComments = document.getElementById('openComments');
    if(openComments){
      openComments.addEventListener('click', (e)=>{
        e.preventDefault();
        document.getElementById('commentTxt').focus();
      });
    }
  });
})();
