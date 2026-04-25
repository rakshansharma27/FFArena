import { supabase } from '../assets/js/supabase-config.js';

const featuredWrap = document.getElementById('featured-wrap');
const cardsWrap = document.getElementById('cards-wrap');

const MAX_SLOTS = 48;

function esc(s) {
    return String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function fmtDate(ts) {
    try { return new Date(ts).toLocaleString(); } catch { return ''; }
}

function statusColor(status) {
    if (status === 'ONGOING') return '#00ff88';
    if (status === 'UPCOMING') return '#00f2fe';
    if (status === 'COMPLETED') return '#ff4757';
    return '#A0B1C8';
}

async function fetchSlotCounts() {
    const { data, error } = await supabase
        .from('tournament_participants')
        .select('tournament_id');

    if (error) {
        console.error(error);
        return new Map();
    }

    const map = new Map();
    for (const r of data || []) {
        map.set(r.tournament_id, (map.get(r.tournament_id) || 0) + 1);
    }
    return map;
}

function renderFeatured(t, filled) {
    const color = statusColor(t.status);
    const sponsorLine = t.sponsor_name ? `Sponsored by <strong>${esc(t.sponsor_name)}</strong>` : 'Sponsored tournament';
    const banner = t.sponsor_banner_url
        ? `background-image: linear-gradient(to right, rgba(20, 22, 30, 0.9), transparent), url('${esc(t.sponsor_banner_url)}'); background-size: cover; background-position: center;`
        : '';

    return `
    <div class="card featured" style="${banner}" onclick="location.href='./tournament-details.html?id=${t.id}'">
      <div class="row">
        <div>
          <div class="title">${esc(t.title || 'Tournament')}</div>
          <div class="meta">${sponsorLine}<br/>Starts: ${fmtDate(t.start_time)}</div>
        </div>
        <div class="pill" style="border-color:${color}; color:${color};">${esc(t.status)}</div>
      </div>
      <div class="grid2">
        <div class="kv">Entry: <strong>₹${Number(t.entry_fee || 0)}</strong></div>
        <div class="kv">Prize: <strong class="c">₹${Number(t.prize_pool || 0)}</strong></div>
        <div class="kv">Slots: <strong>${filled}/${MAX_SLOTS}</strong></div>
      </div>
    </div>
  `;
}

function renderCard(t, filled) {
    const color = statusColor(t.status);
    return `
    <div class="card" onclick="location.href='./tournament-details.html?id=${t.id}'">
      <div class="row">
        <div>
          <div class="title">${esc(t.title || 'Tournament')}</div>
          <div class="meta">Starts: ${fmtDate(t.start_time)}</div>
        </div>
        <div class="pill" style="border-color:${color}; color:${color};">${esc(t.status)}</div>
      </div>
      <div class="grid2">
        <div class="kv">Entry: <strong>₹${Number(t.entry_fee || 0)}</strong></div>
        <div class="kv">Prize: <strong class="c">₹${Number(t.prize_pool || 0)}</strong></div>
        <div class="kv">Slots: <strong>${filled}/${MAX_SLOTS}</strong></div>
      </div>
    </div>
  `;
}

async function load() {
    if (!featuredWrap || !cardsWrap) return;

    featuredWrap.innerHTML = `<div class="muted" style="color:var(--text-muted)">Loading...</div>`;
    cardsWrap.innerHTML = `<div class="muted" style="color:var(--text-muted)">Loading...</div>`;

    const [{ data: tourneys, error }, counts] = await Promise.all([
        supabase
            .from('tournaments')
            .select('id,title,entry_fee,prize_pool,start_time,status,is_sponsored,sponsor_name,sponsor_banner_url')
            .order('start_time', { ascending: true }),
        fetchSlotCounts()
    ]);

    if (error) {
        console.error(error);
        featuredWrap.innerHTML = `<div style="color:#ff4757;">Error loading tournaments.</div>`;
        cardsWrap.innerHTML = '';
        return;
    }

    const all = tourneys || [];
    const sponsored = all.filter(t => !!t.is_sponsored);
    const normal = all.filter(t => !t.is_sponsored);

    featuredWrap.innerHTML = sponsored.length
        ? sponsored.map(t => renderFeatured(t, counts.get(t.id) || 0)).join('')
        : `<div style="color:var(--text-muted);">No featured tournaments right now.</div>`;

    cardsWrap.innerHTML = normal.length
        ? normal.map(t => renderCard(t, counts.get(t.id) || 0)).join('')
        : `<div style="color:var(--text-muted);">No tournaments found.</div>`;
}

await load();

// realtime refresh
let timer = null;
const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(load, 250);
};

supabase.channel('rt-public-tournament-list')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, schedule)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_participants' }, schedule)
    .subscribe();