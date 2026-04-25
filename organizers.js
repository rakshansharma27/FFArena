import { supabase } from '../assets/js/supabase-config.js';

const grid = document.getElementById('org-grid');

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

function bannerUrl(name) {
    // simple deterministic banner style
    return `linear-gradient(rgba(0,242,254,0.18), rgba(0,0,0,0.1))`;
}

function card(o) {
    const name = o.name || 'Organizer';
    return `
    <div class="org-card">
      <div class="org-banner" style="background: ${bannerUrl(name)};">
        <img src="${avatar(name)}" class="org-logo" alt="">
      </div>
      <div class="org-info">
        <div class="org-name">${esc(name)} <i class="fas fa-check-circle verified-badge"></i></div>
        <span class="tier"><i class="fas fa-badge-check"></i> VERIFIED</span>
        <div class="muted">Joined: ${new Date(o.created_at).toLocaleDateString()}</div>
        <a href="./organizer.html?id=${o.owner_id}" class="cyber-btn" style="width:100%; justify-content:center; margin-top:12px; padding: 10px; font-size:0.85rem;">View Profile</a>
      </div>
    </div>
  `;
}

async function load() {
    if (!grid) return;

    const { data, error } = await supabase
        .from('organizers')
        .select('owner_id, name, created_at, is_verified')
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        grid.innerHTML = `<div style="color:#ff4757; padding: 10px;">Error loading organizers.</div>`;
        return;
    }

    const rows = data || [];
    grid.innerHTML = rows.length ? rows.map(card).join('') : `<div style="color: var(--text-muted); padding: 10px;">No organizers yet.</div>`;
}

await load();

let timer = null;
const schedule = () => { clearTimeout(timer); timer = setTimeout(load, 250); };

supabase.channel('rt-organizers')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'organizers' }, schedule)
    .subscribe();