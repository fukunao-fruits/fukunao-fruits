import { isAuthorized, unauthorized } from '../_lib/auth.js';

function isValidMonth(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value || '');
}

function isDateInMonth(date, month) {
  return new RegExp(`^${month}-\\d{2}$`).test(date || '');
}

function validHoursByDate(value, month) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entries = Object.entries(value);
  if (!entries.every(([date, hours]) => isDateInMonth(date, month) && typeof hours === 'string' && hours.trim() && hours.trim().length <= 30)) return null;
  return Object.fromEntries(entries.map(([date, hours]) => [date, hours.trim()]));
}

function page() {
  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>営業日・営業時間を管理｜福直フルーツ</title>
<style>
body{margin:0;padding:28px;background:#fcf8f0;color:#27201d;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans",sans-serif}main{max-width:860px;margin:auto}h1{font-size:25px;margin:0 0 8px}.lead{color:#665d57;margin:0 0 24px;line-height:1.7}.panel{background:#fff;border:1px solid #e9dfd1;padding:24px}.controls{display:flex;gap:12px;align-items:end;flex-wrap:wrap}.controls label{display:grid;gap:5px;font-size:14px}.controls input{font:inherit;padding:9px;border:1px solid #cfc2b0}.controls button,.save{border:0;background:#792b2f;color:#fff;padding:11px 16px;font:inherit;cursor:pointer}.calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:22px}.weekday{text-align:center;font-size:12px;color:#775f4b}.day{min-height:92px;border:1px solid #e9dfd1;background:#fff;padding:7px;display:grid;gap:5px;align-content:start}.day-number{font-weight:700;font-size:14px}.day-week{color:#775f4b;font-size:11px}.day select{width:100%;font:inherit;font-size:12px;padding:5px;border:1px solid #cfc2b0;background:#fff}.day.closed{background:#f8eeee}.day.closed .day-number{color:#792b2f}.day.empty{border:0;background:transparent}.guide{font-size:13px;color:#665d57;margin:18px 0;line-height:1.7}.notice{min-height:1.5em;margin:16px 0 0;color:#792b2f}.save{margin-top:4px}@media(max-width:700px){body{padding:16px}.panel{padding:16px}.calendar{gap:3px}.day{min-height:75px;padding:4px}.day select{font-size:10px;padding:3px}.weekday{font-size:11px}}
</style></head><body><main>
<h1>営業日・営業時間を管理</h1>
<p class="lead">翌月の予定は、前月20日頃を目安に登録してください。通常どおりの日は自動で営業時間を表示します。臨時の休業・短縮営業だけ、日付ごとに変更できます。</p>
<section class="panel"><div class="controls"><label>対象月<input id="month" type="month"></label><button id="load" type="button">表示する</button></div><div class="calendar" id="calendar"></div><p class="guide">「通常どおり」：日・月 9:00〜16:00／火・木・金・土 9:00〜18:00／水曜は定休日です。<br>通常と異なる営業時間は「営業時間を入力」を選び、例のように <strong>10:00〜16:00</strong> と入力してください。</p><button class="save" id="save" type="button">この内容を保存する</button><p class="notice" id="notice"></p></section>
</main><script>
const monthInput=document.querySelector('#month'),grid=document.querySelector('#calendar'),notice=document.querySelector('#notice');
let closedDates=[],hoursByDate={};
const pad=n=>String(n).padStart(2,'0');
const weekdays=['日','月','火','水','木','金','土'];
const nextMonth=()=>{const d=new Date();d.setMonth(d.getMonth()+1);return d.getFullYear()+'-'+pad(d.getMonth()+1)};
const baseHours=weekday=>weekday===3?'休業':([0,1].includes(weekday)?'9:00〜16:00':'9:00〜18:00');
monthInput.value=nextMonth();
function selectFor(date,weekday){const select=document.createElement('select'),current=hoursByDate[date];select.innerHTML='<option value="default">通常どおり（'+baseHours(weekday)+'）</option><option value="closed">休業</option><option value="9:00〜16:00">9:00〜16:00</option><option value="9:00〜18:00">9:00〜18:00</option><option value="custom">営業時間を入力…</option>';
if(closedDates.includes(date))select.value='closed';else if(current&&['9:00〜16:00','9:00〜18:00'].includes(current))select.value=current;else if(current){const option=document.createElement('option');option.value='saved-custom';option.textContent=current;select.append(option);select.value='saved-custom'}
select.onchange=()=>{if(select.value==='closed'){if(!closedDates.includes(date))closedDates.push(date);delete hoursByDate[date]}else if(select.value==='default'){delete hoursByDate[date];if(weekday===3){if(!closedDates.includes(date))closedDates.push(date)}else{closedDates=closedDates.filter(item=>item!==date)}}else if(select.value==='custom'){const value=window.prompt('営業時間を入力してください（例：10:00〜16:00）',current||'');if(value&&value.trim()){closedDates=closedDates.filter(item=>item!==date);hoursByDate[date]=value.trim()}draw();return}else{closedDates=closedDates.filter(item=>item!==date);hoursByDate[date]=select.value}draw()};return select}
function draw(){const month=monthInput.value;const [year,number]=month.split('-').map(Number);const first=new Date(year,number-1,1).getDay(),last=new Date(year,number,0).getDate();grid.innerHTML=weekdays.map(day=>'<div class="weekday">'+day+'</div>').join('');for(let i=0;i<first;i++)grid.insertAdjacentHTML('beforeend','<div class="day empty"></div>');for(let day=1;day<=last;day++){const date=month+'-'+pad(day),weekday=new Date(year,number-1,day).getDay(),cell=document.createElement('div');cell.className='day'+(closedDates.includes(date)?' closed':'');cell.innerHTML='<span class="day-number">'+day+'</span><span class="day-week">'+weekdays[weekday]+'</span>';cell.append(selectFor(date,weekday));grid.append(cell)}}
async function load(){notice.textContent='';const response=await fetch('/api/calendar?month='+monthInput.value);if(!response.ok)throw new Error();const data=await response.json();closedDates=data.closedDates||[];hoursByDate=data.hoursByDate||{};draw()}
document.querySelector('#load').onclick=()=>load().catch(()=>notice.textContent='読み込めませんでした。');
document.querySelector('#save').onclick=async()=>{const response=await fetch('/admin/calendar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({month:monthInput.value,closedDates:[...new Set(closedDates)].sort(),hoursByDate})});notice.textContent=response.ok?'保存しました。ホームページにすぐ反映されます。':'保存できませんでした。'};
load().catch(()=>notice.textContent='読み込めませんでした。');
</script></body></html>`;
}

export async function onRequest(context) {
  if (!isAuthorized(context.request, context.env)) return unauthorized();
  if (context.request.method === 'GET') return new Response(page(), { headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' } });
  if (context.request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { month, closedDates, hoursByDate } = await context.request.json();
    if (!isValidMonth(month) || !Array.isArray(closedDates) || !closedDates.every(date => isDateInMonth(date, month))) return new Response('入力内容が不正です。', { status: 400 });
    const validHours = validHoursByDate(hoursByDate || {}, month);
    if (validHours === null) return new Response('入力内容が不正です。', { status: 400 });
    const uniqueDates = [...new Set(closedDates)].filter(date => !validHours[date]).sort();
    await context.env.INSTAGRAM_SELECTION.put(`business-calendar:${month}`, JSON.stringify({ closedDates: uniqueDates, hoursByDate: validHours }));
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return new Response('保存できませんでした。', { status: 500 });
  }
}
