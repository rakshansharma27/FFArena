import { supabase } from '../assets/js/supabase-config.js';

const box = document.getElementById('box');
const titleEl = document.getElementById('title');

const id = Number(new URL(location.href).searchParams.get('id') || 0);

function esc(s) {
    return String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

async function load() {
    if (!id) {
        box.innerHTML = '<p style="color: var(--text-muted);">Invalid tournament id</p>';
        return;
    }

    box.innerHTML = '<p style="color: var(--text-muted);">Loading...</p>';

    const [{ data: t }, { data: rows, error: rErr }] = await Promise.all([
        supabase.from('tournaments').select('id, title, status').eq('id', id).maybeSingle(),
        supabase.from('tournament_participants')
            .select('id, kills, points, is_booyah, profiles(ign, email)')
            .eq('tournament_id', id)
            .order('points', { ascending: false })
    ]);

    if (rErr) console.error(rErr);

    if (!t) {
        box.innerHTML = '<p style="color: var(--text-muted);">Tournament not found</p>';
        return;
    }

    titleEl.textContent = `${t.title} — Results`;

    if (!rows || rows.length === 0) {
        box.innerHTML = '<p style="color: var(--text-muted);">No results available yet.</p>';
        return;
    }

    box.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Kills</th>
          <th>Booyah</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((r, i) => `
          <tr>
            <td style="font-family: var(--font-heading); font-size: 18px; color: var(--primary-cyan);">${i + 1}</td>
            <td><strong>${esc(r.profiles?.ign || r.profiles?.email || 'Player')}</strong></td>
            <td>${Number(r.kills || 0)}</td>
            <td>${r.is_booyah ? 'YES' : '—'}</td>
            <td style="font-weight:900; color: var(--primary-cyan);">${Number(r.points || 0)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

await load();

let timer = null;
const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(load, 250);
};

supabase.channel('rt-results-' + id)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_participants', filter: `tournament_id=eq.${id}` }, schedule)
    .subscribe();