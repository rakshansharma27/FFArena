import { supabase } from '../assets/js/supabase-config.js';

const tbody = document.getElementById('leaderboard-body');

function esc(s) {
    return String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function rankClass(i) {
    if (i === 0) return 'rank-1';
    if (i === 1) return 'rank-2';
    if (i === 2) return 'rank-3';
    return '';
}

function avatarUrl(name) {
    const n = encodeURIComponent(name || 'Player');
    return `https://ui-avatars.com/api/?name=${n}&background=00f2fe&color=000`;
}

// score formula
function calcScore(p) {
    const kills = Number(p.total_kills || 0);
    const matches = Number(p.matches_played || 0);
    const earn = Number(p.total_earnings || 0);
    return Math.round(kills * 2 + matches * 1 + earn / 10);
}

async function load() {
    if (!tbody) return;

    const { data, error } = await supabase
        .from('profiles')
        .select('id, ign, matches_played, total_kills, total_earnings')
        .order('total_kills', { ascending: false })
        .limit(200);

    if (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#ff4757;">Error loading leaderboard</td></tr>`;
        return;
    }

    const rows = (data || [])
        .map(p => ({ ...p, score: calcScore(p) }))
        .sort((a, b) => b.score - a.score || Number(b.total_kills || 0) - Number(a.total_kills || 0))
        .slice(0, 100);

    if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color: var(--text-muted);">No data yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map((p, i) => `
    <tr class="${rankClass(i)}">
      <td><div class="rank">${i === 0 ? `<i class="fas fa-crown" style="font-size: 1rem; display:block; margin-bottom: -5px;"></i>` : ''} ${i + 1}</div></td>
      <td>
        <div class="team-cell">
          <img src="${avatarUrl(p.ign)}" class="team-logo" alt="">
          <span class="team-name">${esc(p.ign || 'Player')}</span>
        </div>
      </td>
      <td>${Number(p.matches_played || 0)}</td>
      <td>${Number(p.total_kills || 0)}</td>
      <td>₹${Number(p.total_earnings || 0)}</td>
      <td style="font-family: var(--font-heading); color: var(--primary-cyan); font-size: 1.2rem;">
        ${p.score.toLocaleString()}
      </td>
    </tr>
  `).join('');
}

await load();

let timer = null;
const schedule = () => { clearTimeout(timer); timer = setTimeout(load, 250); };

supabase.channel('rt-public-leaderboard')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, schedule)
    .subscribe();