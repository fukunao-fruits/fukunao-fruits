import { isAuthorized, unauthorized } from '../_lib/auth.js';

function isValidMonth(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value || '');
}

function isDateInMonth(date, month) {
  return new RegExp(`^${month}-\\d{2}$`).test(date || '');
}

function page() {
  return `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>休業日を管理｜福直フルーツ</title><style>body{margin:0;padding:28px;background:#fcf8f0;color:#27201d;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans",sans-serif}main{max-width:720px;margin:auto}h1{font-size:25px;margin:0 0 8px}.lead{color:#665d57;margin:0 0 24px}.panel{background:#fff;border:1px solid #e9dfd1;padding:24px}.controls{display:flex;gap:12px;align-items:end;flex-wrap:wrap}.controls label{display:grid;gap:5px;font-size:14px}.controls input{font:inherit;padding:9px;border:1px solid #cfc2b0}.controls button,.save{border:0;background:#792b2f;color:#fff;padding:11px 16px;font:inherit;cursor:pointer}.calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:22px}.weekday{text-align:center;font-size:12px;color:#775f4b}.day{min-height:62px;border:1px solid #e9dfd1;background:#fff;color:#27201d;font:inherit;cursor:pointer}.day.closed{background:#792b2f;color:#fff}.day.empty{border:0;background:transparent;cursor:default}.legend{font-size:13px;color:#665d57;margin:18px 0}.notice{min-height:1.5em;margin:16px 0 0;color:#792b2f}.save{margin-top:4px}@media(max-width:600px){body{padding:20px}.panel{padding:18px}.day{min-height:48px}}</style><main><h1>休業日を管理</h1><p class="lead">翌月の休業予定は、前月20日頃を目安に登録してください。日付を押すと休業日として切り替わります。</p><section class="panel"><div class="controls"><label>対象月<input id="month" type="month"></label><button id="load" type="button">表示する</button></div><div class="calendar" id="calendar"></div><p class="legend">えんじ色：休業日　／　白：営業日</p><button class="save" id="save" type="button">この内容を保存する</button><p class="notice" id="notice"></p></section></main><script>const monthInput=document.querySelector('#month'),grid=document.querySelector('#calendar'),notice=document.querySelector('#notice');let selected=[];const pad=n=>String(n).padStart(2,'0');const nextMonth=()=>{const d=new Date();d.setMonth(d.getMonth()+1);return d.getFullYear()+'-'+pad(d.getMonth()+1)};monthInput.value=nextMonth();function draw(){const month=monthInput.value;const [year,number]=month.split('-').map(Number);const first=new Date(year,number-1,1).getDay(),last=new Date(year,number,0).getDate();grid.innerHTML=['日','月','火','水','木','金','土'].map(day=>'<div class="weekday">'+day+'</div>').join('');for(let i=0;i<first;i++)grid.insertAdjacentHTML('beforeend','<button class="day empty" disabled></button>');for(let day=1;day<=last;day++){const date=month+'-'+pad(day),button=document.createElement('button');button.type='button';button.className='day'+(selected.includes(date)?' closed':'');button.textContent=day;button.onclick=()=>{selected=selected.includes(date)?selected.filter(item=>item!==date):[...selected,date];draw()};grid.append(button)}}async function load(){notice.textContent='';const response=await fetch('/api/calendar?month='+monthInput.value);const data=await response.json();selected=data.closedDates||[];draw()}document.querySelector('#load').onclick=load;document.querySelector('#save').onclick=async()=>{const response=await fetch('/admin/calendar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({month:monthInput.value,closedDates:selected})});notice.textContent=response.ok?'保存しました。ホームページに反映されます。':'保存できませんでした。';};load();</script></html>`;
}

export async function onRequest(context) {
  if (!isAuthorized(context.request, context.env)) return unauthorized();
  if (context.request.method === 'GET') {
    return new Response(page(), { headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' } });
  }
  if (context.request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { month, closedDates } = await context.request.json();
    if (!isValidMonth(month) || !Array.isArray(closedDates) || !closedDates.every(date => isDateInMonth(date, month))) {
      return new Response('入力内容が不正です。', { status: 400 });
    }
    const uniqueDates = [...new Set(closedDates)].sort();
    await context.env.INSTAGRAM_SELECTION.put(`business-calendar:${month}`, JSON.stringify({ closedDates: uniqueDates }));
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return new Response('保存できませんでした。', { status: 500 });
  }
}
