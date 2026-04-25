import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return (window.location.href = '../admin/admin-login.html');

  const userId = session.user.id;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, email')
    .eq('id', userId)
    .maybeSingle();

  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'OWNER')) {
    alert('ACCESS DENIED: Insufficient Clearance.');
    window.location.href = '../user/user-dashboard.html';
    return;
  }

  const isOwner = profile.role === 'OWNER';

  // show role badge
  const badge = document.getElementById('admin-role-badge');
  if (badge) badge.textContent = `ROLE: ${profile.role}`;

  // show owner-only sponsor controls panels
  if (isOwner) {
    document.getElementById('owner-sponsor-controls')?.style?.setProperty('display', 'block');
    document.getElementById('owner-sponsor-requests')?.style?.setProperty('display', 'block');
  }

  let selectedTournament = null;
  let selectedPrize = 0;
  let selectedTournamentTitle = '';

  const esc = (s) => String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  function setSelectedTournamentLabel() {
    const el = document.getElementById('selected-tournament-label');
    if (el) el.textContent = selectedTournament ? `${selectedTournamentTitle} (${selectedTournament})` : 'None';

    // Owner sponsor selected
    const sel = document.getElementById('owner-sponsor-selected');
    if (sel) sel.textContent = selectedTournament ? `${selectedTournamentTitle} (#${selectedTournament})` : 'None';
  }

  async function hydrateRoomInputsFromTournament(tournamentId) {
    const roomIdEl = document.getElementById('room-id');
    const roomPwEl = document.getElementById('room-password');
    if (!roomIdEl || !roomPwEl) return;

    const { data } = await supabase
      .from('tournaments')
      .select('room_id, room_password, is_sponsored, sponsor_name, sponsor_banner_url')
      .eq('id', tournamentId)
      .maybeSingle();

    roomIdEl.value = data?.room_id || '';
    roomPwEl.value = data?.room_password || '';

    // hydrate owner sponsor fields if owner + elements exist
    if (isOwner) {
      const ss = document.getElementById('owner-s-sponsored');
      const sn = document.getElementById('owner-s-name');
      const sb = document.getElementById('owner-s-banner');
      if (ss) ss.value = String(!!data?.is_sponsored);
      if (sn) sn.value = data?.sponsor_name || '';
      if (sb) sb.value = data?.sponsor_banner_url || '';
    }
  }

  // =========================
  // LOADERS
  // =========================
  await loadManageTournaments();
  await loadPayouts();
  await loadUtrJoinRequests();
  await loadOrganizerStats();
  await loadSponsorRequestsOwner();
  setSelectedTournamentLabel();

  // =========================
  // HOST TOURNAMENT (RPC)
  // =========================
  const tourneyForm = document.getElementById('host-tourney-form');
  tourneyForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-create-tourney');
    const feePreview = document.getElementById('create-tourney-fee-preview');

    try {
      btn && (btn.disabled = true);
      btn && (btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...');

      const title = document.getElementById('t-title')?.value?.trim();
      const entry_fee = parseFloat(document.getElementById('t-entry')?.value || '0');
      const prize_pool = parseFloat(document.getElementById('t-prize')?.value || '0');
      const start_time = document.getElementById('t-time')?.value;

      const payment_upi_id = document.getElementById('t-upi')?.value?.trim() || null;
      const payment_qr_url = document.getElementById('t-qr')?.value?.trim() || null;

      const { data, error } = await supabase.rpc('create_tournament_as_host', {
        p_title: title,
        p_entry_fee: entry_fee,
        p_prize_pool: prize_pool,
        p_start_time: start_time,
        p_payment_upi_id: payment_upi_id,
        p_payment_qr_url: payment_qr_url
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Failed to create tournament.');

      if (feePreview) feePreview.textContent = `Platform fee/player: ₹${data.platform_fee_per_player}`;
      alert(`Tournament Live! Platform fee/player: ₹${data.platform_fee_per_player}`);

      tourneyForm.reset();
      await loadManageTournaments();
      await loadOrganizerStats();
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Failed to create tournament.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Initialize Operation';
      }
    }
  });

  // =========================
  // MATCH LEDGER
  // =========================
  async function loadManageTournaments() {
    const tbody = document.getElementById('admin-matches-body');
    if (!tbody) return;

    const { data: tourneys, error } = await supabase
      .from('tournaments')
      .select('id, title, prize_pool, status, start_time, room_id, room_password')
      .neq('status', 'COMPLETED')
      .order('start_time', { ascending: true });

    if (error) {
      console.error(error);
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #FF4757;">Error loading tournaments</td></tr>';
      return;
    }

    tbody.innerHTML = (tourneys || []).map(t => {
      const roomText = t.room_id
        ? `ID: <span style="color:#00F0FF; font-family: var(--font-mono);">${esc(t.room_id)}</span><br>
           PW: <span style="color:#00ff88; font-family: var(--font-mono);">${esc(t.room_password || '—')}</span>`
        : `<span style="color:var(--text-muted); font-size:12px;">Not set</span>`;

      return `
        <tr>
          <td style="font-family: 'Bebas Neue'; letter-spacing: 1px;">${esc(t.title)}</td>
          <td style="font-family: 'JetBrains Mono'; color: #00F0FF;">₹${t.prize_pool}</td>
          <td style="font-size: 11px; opacity: 0.85;">${esc(t.status)}</td>
          <td style="font-size: 12px;">${roomText}</td>
          <td>
            <button class="btn-primary" style="font-size: 0.85rem; padding: 8px 12px;"
              onclick="selectTournament('${t.id}', '${esc(t.title)}', ${t.prize_pool})">
              <i class="fas fa-bullseye"></i> Select
            </button>
          </td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="5" style="text-align:center;">No Active Operations</td></tr>';
  }

  // Select tournament
  window.selectTournament = async (id, title, prize) => {
    selectedTournament = Number(id);
    selectedTournamentTitle = title;
    selectedPrize = Number(prize || 0);
    setSelectedTournamentLabel();
    document.getElementById('winner-email-manual')?.focus();
    await hydrateRoomInputsFromTournament(selectedTournament);
  };

  // =========================
  // ROOM MANAGER
  // =========================
  window.clearRoomInputs = () => {
    const roomIdEl = document.getElementById('room-id');
    const roomPwEl = document.getElementById('room-password');
    if (roomIdEl) roomIdEl.value = '';
    if (roomPwEl) roomPwEl.value = '';
  };

  window.saveRoomDetails = async () => {
    if (!selectedTournament) return alert('Select a tournament from the Match Ledger first.');

    const roomId = document.getElementById('room-id')?.value?.trim();
    const roomPassword = document.getElementById('room-password')?.value?.trim();
    if (!roomId || !roomPassword) return alert('Please enter both Room ID and Room Password.');

    const { error } = await supabase
      .from('tournaments')
      .update({ room_id: roomId, room_password: roomPassword, updated_at: new Date().toISOString() })
      .eq('id', selectedTournament);

    if (error) return alert(error.message || 'Failed saving room.');
    alert('Room details saved!');
    await loadManageTournaments();
  };

  window.startSelectedMatch = async () => {
    if (!selectedTournament) return alert('Select a tournament first.');
    if (!confirm('Start this match now? Status will change from UPCOMING to ONGOING.')) return;

    const roomId = document.getElementById('room-id')?.value?.trim();
    const roomPassword = document.getElementById('room-password')?.value?.trim();

    const { data: updated, error } = await supabase
      .from('tournaments')
      .update({ status: 'ONGOING', room_id: roomId || null, room_password: roomPassword || null, updated_at: new Date().toISOString() })
      .eq('id', selectedTournament)
      .eq('status', 'UPCOMING')
      .select('id')
      .maybeSingle();

    if (error) return alert(error.message || 'Failed to start.');
    if (!updated) return alert('Not in UPCOMING state.');
    alert('Match started!');
    await loadManageTournaments();
  };

  // =========================
  // MANUAL PRIZE
  // =========================
  window.resolveManually = async () => {
    if (!selectedTournament) return alert('Select tournament first.');
    const email = document.getElementById('winner-email-manual')?.value?.trim();
    if (!email) return alert("Enter winner's email.");

    const { data: winner } = await supabase
      .from('profiles')
      .select('id, wallet_balance, total_earnings')
      .eq('email', email)
      .maybeSingle();

    if (!winner) return alert('Player not found.');
    if (!confirm(`Manually award ₹${selectedPrize} to ${email}?`)) return;

    const newBal = Number(winner.wallet_balance || 0) + selectedPrize;
    const newEarn = Number(winner.total_earnings || 0) + selectedPrize;

    await supabase.from('profiles')
      .update({ wallet_balance: newBal, total_earnings: newEarn, updated_at: new Date().toISOString() })
      .eq('id', winner.id);

    await supabase.from('wallet_transactions').insert([{
      user_id: winner.id,
      amount: selectedPrize,
      transaction_type: 'PRIZE',
      status: 'COMPLETED',
      processed_by: userId
    }]);

    await supabase.from('tournaments')
      .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
      .eq('id', selectedTournament);

    alert('Prize dispatched + tournament completed.');
    await loadManageTournaments();
    await loadOrganizerStats();
  };

  // =========================
  // WITHDRAWALS
  // =========================
  async function loadPayouts() {
    const tbody = document.getElementById('admin-payouts-body');
    if (!tbody) return;

    const { data: payouts, error } = await supabase
      .from('wallet_transactions')
      .select(`id, amount, created_at, user_id, profiles(id, ign, email, upi_id)`)
      .eq('transaction_type', 'WITHDRAWAL')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error);
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: #FF4757;">Error loading payouts</td></tr>';
      return;
    }

    tbody.innerHTML = (payouts || []).map(p => `
      <tr>
        <td><strong style="color:#00F0FF;">${esc(p.profiles?.ign || 'Unknown')}</strong><br>
          <span style="font-size:10px;color:gray;">${esc(p.profiles?.email || '')}</span></td>
        <td>${p.profiles?.upi_id ? esc(p.profiles.upi_id) : '<span style="color:#FF4757;">NOT SET</span>'}</td>
        <td style="color:#FF4757; font-weight:900;">₹${p.amount}</td>
        <td style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn-primary" style="background:#00ff88;" onclick="processPayout('${p.id}','COMPLETED')">Paid</button>
          <button class="btn-primary btn-danger" onclick="processPayout('${p.id}','FAILED','${p.user_id}',${p.amount})">Reject</button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No Pending Payouts</td></tr>';
  }

  window.processPayout = async (txnId, status, playerId = null, amount = 0) => {
    if (!confirm(`Mark withdrawal as ${status}?`)) return;

    await supabase.from('wallet_transactions')
      .update({ status, processed_by: userId, updated_at: new Date().toISOString() })
      .eq('id', txnId);

    if (status === 'FAILED' && playerId) {
      const { data: p } = await supabase.from('profiles').select('wallet_balance').eq('id', playerId).single();
      const refunded = Number(p.wallet_balance || 0) + Number(amount || 0);
      await supabase.from('profiles').update({ wallet_balance: refunded }).eq('id', playerId);
    }
    await loadPayouts();
  };

  // =========================
  // UTR JOIN REQUESTS
  // =========================
  async function loadUtrJoinRequests() {
    const body = document.getElementById('utr-requests-body');
    if (!body) return;

    // Join to profiles via FK; Supabase may require explicit relationship name in some setups.
    // If this returns error in your project, tell me and I will adjust to two queries.
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('id, utr, amount, tournament_id, created_at, profiles(ign,email)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error);
      body.innerHTML = `<tr><td colspan="5" style="text-align:center;">Error loading UTR requests</td></tr>`;
      return;
    }

    body.innerHTML = (data || []).map(r => `
      <tr>
        <td>${esc(r.profiles?.ign || r.profiles?.email || '')}</td>
        <td class="mono">${esc(r.utr)}</td>
        <td>₹${r.amount}</td>
        <td>#${r.tournament_id}</td>
        <td style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn-primary" onclick="reviewUtr('${r.id}','APPROVE')">Approve</button>
          <button class="btn-primary btn-danger" onclick="reviewUtr('${r.id}','REJECT')">Reject</button>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">No pending UTR requests</td></tr>`;
  }

  window.reviewUtr = async (regId, action) => {
    if (!confirm(`${action} this registration?`)) return;
    const { data, error } = await supabase.rpc('review_registration', { p_registration_id: regId, p_action: action });
    if (error) return alert(error.message || 'Failed.');
    if (!data?.ok) return alert(data?.error || 'Failed.');
    await loadUtrJoinRequests();
    await loadOrganizerStats();
  };

  // =========================
  // ORGANIZER STATS
  // =========================
  async function loadOrganizerStats() {
    const hostedEl = document.getElementById('org-stat-hosted');
    const regsEl = document.getElementById('org-stat-registrations');
    const prizesEl = document.getElementById('org-stat-prizes');
    const feesEl = document.getElementById('org-stat-fees');
    const upiEl = document.getElementById('owner-upi');

    if (upiEl) upiEl.textContent = '9415515687@upi';
    if (!hostedEl && !regsEl && !prizesEl && !feesEl) return;

    const { count: hosted } = await supabase
      .from('tournaments')
      .select('*', { count: 'exact', head: true })
      .eq('host_id', userId);

    const { data: feeRows } = await supabase
      .from('tournaments')
      .select('platform_fee_total, platform_fee_settled')
      .eq('host_id', userId);

    const totalFees = (feeRows || [])
      .filter(x => !x.platform_fee_settled)
      .reduce((s, x) => s + Number(x.platform_fee_total || 0), 0);

    const { data: prizeRows } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('transaction_type', 'PRIZE')
      .eq('processed_by', userId);

    const totalPrizes = (prizeRows || []).reduce((s, x) => s + Number(x.amount || 0), 0);

    if (hostedEl) hostedEl.textContent = hosted || 0;
    if (feesEl) feesEl.textContent = `₹${totalFees}`;
    if (prizesEl) prizesEl.textContent = `₹${totalPrizes}`;

    // registrations count across hosted tournaments
    if (regsEl) {
      const { data: myTourneys } = await supabase.from('tournaments').select('id').eq('host_id', userId);
      const ids = (myTourneys || []).map(x => x.id);
      if (!ids.length) regsEl.textContent = '0';
      else {
        const { count: regs } = await supabase
          .from('tournament_participants')
          .select('*', { count: 'exact', head: true })
          .in('tournament_id', ids);
        regsEl.textContent = regs || 0;
      }
    }
  }

  // =========================
  // SPONSOR APPLY (Admin)
  // =========================
  const sponsorForm = document.getElementById('sponsor-apply-form');
  sponsorForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('sponsor-apply-msg');
    const btn = document.getElementById('btn-sponsor-apply');

    const budget = Number(document.getElementById('s-budget')?.value || 0);
    const days = Number(document.getElementById('s-days')?.value || 0);
    const message = document.getElementById('s-message')?.value?.trim() || null;

    if (!budget || budget < 1) return alert('Enter budget.');
    if (!days || days < 1) return alert('Enter days.');

    try {
      btn && (btn.disabled = true);
      msg && (msg.textContent = 'Submitting...');

      const { error } = await supabase.from('organizer_sponsor_requests').insert([{
        requester_id: userId,
        budget,
        days,
        message,
        status: 'PENDING'
      }]);

      if (error) throw error;

      msg && (msg.textContent = 'Request submitted to Owner.');
      sponsorForm.reset();
    } catch (err) {
      console.error(err);
      msg && (msg.textContent = err?.message || 'Failed.');
      alert(err?.message || 'Failed.');
    } finally {
      btn && (btn.disabled = false);
    }
  });

  // =========================
  // OWNER: Save sponsor settings (Owner only)
  // =========================
  document.getElementById('btn-owner-save-sponsor')?.addEventListener('click', async () => {
    if (!isOwner) return alert('Owner only.');
    if (!selectedTournament) return alert('Select a tournament first in Match Ledger.');

    const msg = document.getElementById('owner-sponsor-msg');
    msg && (msg.textContent = 'Saving...');

    const is_sponsored = document.getElementById('owner-s-sponsored')?.value === 'true';
    const sponsor_name = document.getElementById('owner-s-name')?.value?.trim() || null;
    const sponsor_banner_url = document.getElementById('owner-s-banner')?.value?.trim() || null;

    const { data, error } = await supabase.rpc('owner_set_tournament_sponsor', {
      p_tournament_id: selectedTournament,
      p_is_sponsored: is_sponsored,
      p_sponsor_name: sponsor_name,
      p_sponsor_banner_url: sponsor_banner_url
    });

    if (error) {
      console.error(error);
      msg && (msg.textContent = error.message || 'Failed.');
      return alert(error.message || 'Failed.');
    }
    if (!data?.ok) {
      msg && (msg.textContent = data?.error || 'Failed.');
      return alert(data?.error || 'Failed.');
    }

    msg && (msg.textContent = 'Saved!');
    await loadManageTournaments();
  });

  // =========================
  // OWNER: Sponsor requests list + review
  // =========================
  async function loadSponsorRequestsOwner() {
    const body = document.getElementById('sponsor-requests-body');
    if (!body) return;
    if (!isOwner) return;

    const { data, error } = await supabase
      .from('organizer_sponsor_requests')
      .select('id, budget, days, message, status, created_at, profiles:requester_id(ign,email)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error);
      body.innerHTML = `<tr><td colspan="5" style="text-align:center;">Error loading sponsor requests</td></tr>`;
      return;
    }

    body.innerHTML = (data || []).map(r => `
      <tr>
        <td>${esc(r.profiles?.ign || r.profiles?.email || '')}</td>
        <td>₹${r.budget}</td>
        <td>${r.days}</td>
        <td>${esc(r.message || '')}</td>
        <td style="display:flex; gap:8px;">
          <button class="btn-primary" onclick="reviewSponsorReq('${r.id}','APPROVE')">Approve</button>
          <button class="btn-primary btn-danger" onclick="reviewSponsorReq('${r.id}','REJECT')">Reject</button>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">No pending requests</td></tr>`;
  }

  window.reviewSponsorReq = async (id, action) => {
    if (!isOwner) return alert('Owner only.');
    if (!confirm(`${action} sponsor request?`)) return;

    const { data, error } = await supabase.rpc('owner_review_sponsor_request', {
      p_request_id: id,
      p_action: action
    });

    if (error) return alert(error.message || 'Failed.');
    if (!data?.ok) return alert(data?.error || 'Failed.');

    await loadSponsorRequestsOwner();
  };

  // =========================
  // REALTIME
  // =========================
  let timer = null;
  const schedule = (fn) => {
    clearTimeout(timer);
    timer = setTimeout(fn, 250);
  };

  const ch = supabase.channel('rt-admin-all')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, () => schedule(async () => {
      await loadManageTournaments();
      await loadOrganizerStats();
    }))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_transactions' }, () => schedule(async () => {
      await loadPayouts();
      await loadOrganizerStats();
    }))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_participants' }, () => schedule(loadOrganizerStats))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_registrations' }, () => schedule(loadUtrJoinRequests))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'organizer_sponsor_requests' }, () => schedule(loadSponsorRequestsOwner))
    .subscribe();

  // logout
  document.querySelector('.logout-btn')?.addEventListener('click', async () => {
    try { await supabase.removeChannel(ch); } catch { }
    await supabase.auth.signOut();
    window.location.href = '../index.html';
  });
});