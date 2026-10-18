function isValidMonth(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value || '');
}

function defaultClosedDates(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const dates = [];
  for (let day = 1; day <= lastDay; day += 1) {
    if (new Date(Date.UTC(year, monthNumber - 1, day)).getUTCDay() === 3) {
      dates.push(`${month}-${String(day).padStart(2, '0')}`);
    }
  }
  return dates;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const month = isValidMonth(url.searchParams.get('month')) ? url.searchParams.get('month') : currentMonth;
  const fallback = defaultClosedDates(month);

  try {
    const saved = await context.env.INSTAGRAM_SELECTION.get(`business-calendar:${month}`, 'json');
    const closedDates = Array.isArray(saved?.closedDates) ? saved.closedDates : fallback;
    return Response.json({ month, closedDates }, { headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch {
    return Response.json({ month, closedDates: fallback }, { headers: { 'Cache-Control': 'public, max-age=300' } });
  }
}
