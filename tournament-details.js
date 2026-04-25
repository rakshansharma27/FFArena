import { supabase } from '../assets/js/supabase-config.js';

const MAX_SLOTS = 48;
const box = document.getElementById('detailsBox');
const id = Number(new URL(location.href).searchParams.get('id') || 0);

function esc(s) {
    return String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

async function countParticipants(tournamentId) {
    const { count, error } = await supabase
        .from('tournament_participants')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', tournamentId);

    if (error) {
        console.error(error);
        return 0;
    }
    return count || 0;
}

async function load() {
    if (!id) {
        box.innerHTML = '<div class="muted">Invalid tournament id.</div>';
        return;
    }

    const { data: t, error } = await supabase
        .from('tournaments')
        .select('id,title,entry_fee,prize_pool,start_time,status,room_id,room_password,payment_upi_id,payment_qr_url,host_id')
        .eq('id', id)
        .maybeSingle();

    if (error) console.error(error);
    if (!t) {
        box.innerHTML = '<div class="muted">Tournament not found.</div>';
        return;
    }

    const filled = await countParticipants(id);

    const roomVisible = t.status === 'ONGOING';
    const roomHtml = roomVisible
        ? `<div class="panel">
         <h3 style="color:var(--primary-cyan)"><i class="fas fa-door-open"></i> Room Details (Live)</h3>
         <div class="muted">Room ID: <span class="mono" style="color:#fff; font-weight:900;">${esc(t.room_id || 'NOT SET')}</span></div>
         <div class="muted">Password: <span class="mono" style="color:#fff; font-weight:900;">${esc(t.room_password || 'NOT SET')}</span></div>
       </div>`
        : `<div class="panel">
         <h3 style="color:var(--primary-cyan)"><i class="fas fa-lock"></i> Room Details</h3>
         <div class="muted">Room ID & Password will appear when match status becomes <strong>ONGOING</strong>.</div>
       </div>`;

    const upiHtml = (t.payment_upi_id || t.payment_qr_url)
        ? `<div class="panel">
         <h3 style="color:#00ff88"><i class="fas fa-qrcode"></i> Pay to Organizer (Manual UPI)</h3>
         <div class="muted">UPI ID: <span class="mono" style="color:#fff; font-weight:900;">${esc(t.payment_upi_id || 'NOT SET')}</span></div>
         ${t.payment_qr_url ? `<div class="muted" style="margin-top:8px;">QR: <a href="${esc(t.payment_qr_url)}" target="_blank" style="color:var(--primary-cyan);">Open QR</a></div>` : ''}
         <div class="muted" style="margin-top:10px;">
           After paying, submit the UTR below. Admin will approve.
         </div>
       </div>`
        : `<div class="panel"><h3 style="color:#00ff88"><i class="fas fa-qrcode"></i> Manual UPI</h3><div class="muted">Organizer UPI/QR not set for this tournament.</div></div>`;

    box.innerHTML = `
    <h1 class="title">${esc(t.title)}</h1>
    <div class="meta">
      Start: ${new Date(t.start_time).toLocaleString()}<br/>
      Status: <strong>${esc(t.status)}</strong>
    </div>

    <div class="row">
      <div class="chip"><i class="fas fa-wallet"></i> Entry: ₹${Number(t.entry_fee || 0)}</div>
      <div class="chip"><i class="fas fa-trophy"></i> Prize: ₹${Number(t.prize_pool || 0)}</div>
      <div class="chip"><i class="fas fa-users"></i> Slots: ${filled}/${MAX_SLOTS}</div>
    </div>

    <div class="grid2">
      <div class="panel">
        <h3 style="color:var(--primary-cyan)"><i class="fas fa-wallet"></i> Join with Wallet (Instant)</h3>
        <div class="muted">This deducts entry fee from your wallet and joins instantly.</div>
        <button id="joinWalletBtn" class="cyber-btn wallet-pay" style="margin-top:12px; width:100%; justify-content:center;">
          <i class="fas fa-bolt"></i> Pay with Wallet & Join
        </button>
        <div class="muted" id="walletMsg" style="margin-top:10px;"></div>
      </div>

      <div class="panel">
        <h3 style="color:#aa00ff"><i class="fas fa-receipt"></i> Join with UTR (Manual Approval)</h3>
        <div class="muted">Pay via organizer UPI/QR then submit UTR to request approval.</div>
        <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
          <input id="utrInput" type="text" placeholder="Enter UTR" style="flex:1; min-width:200px;" />
          <button id="joinUtrBtn" class="cyber-btn" style="border-color:#aa00ff; color:#aa00ff; background: rgba(170,0,255,0.1);">
            Submit UTR
          </button>
        </div>
        <div class="muted" id="utrMsg" style="margin-top:10px;"></div>
      </div>

      ${upiHtml}
      ${roomHtml}
    </div>
  `;

    // Wallet join
    document.getElementById('joinWalletBtn')?.addEventListener('click', async () => {
        const msg = document.getElementById('walletMsg');
        msg.textContent = 'Processing...';

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            msg.textContent = 'Please login first.';
            return;
        }

        const { data, error } = await supabase.rpc('join_tournament_with_wallet', { p_tournament_id: id });

        if (error) {
            console.error(error);
            msg.textContent = error.message || 'Join failed.';
            return;
        }
        if (!data?.ok) {
            msg.textContent = data?.error || 'Join failed.';
            return;
        }

        msg.textContent = data.message === 'JOINED'
            ? `Joined successfully! ₹${data.fee} deducted.`
            : 'Already joined.';
    });

    // UTR request join
    document.getElementById('joinUtrBtn')?.addEventListener('click', async () => {
        const msg = document.getElementById('utrMsg');
        msg.textContent = 'Submitting...';

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            msg.textContent = 'Please login first.';
            return;
        }

        const utr = document.getElementById('utrInput')?.value?.trim();
        if (!utr || utr.length < 6) {
            msg.textContent = 'Invalid UTR.';
            return;
        }

        const { data, error } = await supabase.rpc('request_join_with_utr', {
            p_tournament_id: id,
            p_utr: utr
        });

        if (error) {
            console.error(error);
            msg.textContent = error.message || 'Failed.';
            return;
        }
        if (!data?.ok) {
            msg.textContent = data?.error || 'Failed.';
            return;
        }

        msg.textContent = data.message === 'REQUESTED'
            ? `UTR submitted. Amount: ₹${data.amount}. Waiting for approval.`
            : 'Already joined.';
    });
}

await load();

// realtime updates
let timer = null;
const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(load, 250);
};

supabase.channel('rt-tournament-details-' + id)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments', filter: `id=eq.${id}` }, schedule)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_participants', filter: `tournament_id=eq.${id}` }, schedule)
    .subscribe();