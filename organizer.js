import { supabase } from '../assets/js/supabase-config.js';

const id = new URL(location.href).searchParams.get('id'); // organizer owner_id (profile id uuid)

const orgName = document.getElementById('orgName');
const orgMeta = document.getElementById('orgMeta');
const orgLogo = document.getElementById('orgLogo');
const hostedWrap = document.getElementById('hostedWrap');
const orgStats = document.getElementById('orgStats');

function esc(s) {
    return String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function avatar(name) {
    const n = encodeURIComponent(name || 'ORG');
    return `https://ui-avatars.com/api/?name=${n}&background=000&color=fff`;
}

async function load() {
    if (!id) {
        orgMeta.textContent = 'Invalid organizer id';
        return;
    }

    const { data: org, error: oErr } = await supabase
        .from('organizers')
        .select('owner_id, name, contact_email, experience_level, created_at, is_verified')
        .eq('owner_id', id)
        .maybeSingle();

    if (oErr) console.error(oErr);

    if (!org) {
        orgMeta.textContent = 'Organizer not found.';
        return;
    }

    orgName.innerHTML = `${esc(org.name)} <i class="fas fa-check-circle verified-badge"></i>`;
    orgMeta.textContent = `Verified organizer · Joined ${new Date(org.created_at).toLocaleDateString()}`;
    orgLogo.src = avatar(org.name);

    const { data: tournaments, error: tErr } = await supabase
        .from('tournaments')
        .select('id,title,entry_fee,prize_pool,start_time,status')
        .eq('host_id', id)
        .order('start_time', { ascending: false })
        .limit(50);

    if (tErr) console.error(tErr);

    const rows = tournaments || [];
    hostedWrap.innerHTML = rows.length ? rows.map(t => `
    <div class="card" onclick="location.href='../tournaments/tournament-details.html?id=${t.id}'">
      <div style="font-family: var(--font-heading); font-size: 1.1rem; color:#fff;">${esc(t.title)}</div>
      <div style="margin-top:6px; color: var(--text-muted); font-size: 12px;">
        Start: ${new Date(t.start_time).toLocaleString()}<br/>
        Entry: ₹${Number(t.entry_fee || 0)} · Prize: ₹${Number(t.prize_pool || 0)} · Status: ${esc(t.status)}
      </div>
    </div>
  `).join('') : `<div class="muted">No tournaments hosted yet.</div>`;

    // stats
    const hostedCount = rows.length;
    const totalPrize = rows.reduce((s, x) => s + Number(x.prize_pool || 0), 0);

    orgStats.innerHTML = `
    <div class="muted">Hosted: <strong style="color:#fff;">${hostedCount}</strong></div>
    <div class="muted" style="margin-top:8px;">Total Prize Pools: <strong style="color:#00ff88;">₹${totalPrize}</strong></div>
    <div class="muted" style="margin-top:8px;">Experience: <strong style="color:#fff;">${esc(org.experience_level || 'NEW')}</strong></div>
  `;
}

await load();

let timer = null;
const schedule = () => { clearTimeout(timer); timer = setTimeout(load, 250); };

supabase.channel('rt-organizer-profile-' + id)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'organizers' }, schedule)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, schedule)
    .subscribe();