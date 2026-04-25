import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    window.location.href = '../user/user-login.html';
    return;
  }

  const myId = session.user.id;

  // OWNER RBAC guard
  const { data: me, error: meErr } = await supabase
    .from('profiles')
    .select('role,email')
    .eq('id', myId)
    .maybeSingle();

  if (meErr) console.error(meErr);

  if (!me || me.role !== 'OWNER') {
    alert('OWNER ACCESS ONLY');
    window.location.href = '../index.html';
    return;
  }

  function esc(s) {
    return String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // -------------------- Stats --------------------
  async function loadAdminStats() {
    try {
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: pendingCount } = await supabase
        .from('wallet_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING');

      const { count: tourneyCount } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true });

      const elUsers = document.getElementById('admin-stat-users');
      if (elUsers) elUsers.innerText = userCount || 0;

      const elPending = document.getElementById('admin-stat-pending');
      if (elPending) elPending.innerText = pendingCount || 0;

      const badge = document.getElementById('pending-count-badge');
      if (badge) badge.innerText = `${pendingCount || 0} Requests`;

      const elTourneys = document.getElementById('admin-stat-tournaments');
      if (elTourneys) elTourneys.innerText = tourneyCount || 0;

      // Profit calc (simple): sum platform fees from tournaments
      const { data: feeSum } = await supabase
        .from('tournaments')
        .select('platform_fee_total');

      const totalProfit = (feeSum || []).reduce((a, x) => a + Number(x.platform_fee_total || 0), 0);
      const elProfit = document.getElementById('admin-stat-profit');
      if (elProfit) elProfit.innerText = `₹${totalProfit.toFixed(0)}`;
    } catch (error) {
      console.error(error);
    }
  }

  // -------------------- Deposits --------------------
  async function loadPendingDeposits() {
    const pendingTableBody = document.getElementById('pending-deposits-body');
    if (!pendingTableBody) return;

    const { data: transactions, error } = await supabase
      .from('wallet_transactions')
      .select(`id, amount, reference_id, created_at, user_id, profiles ( id, ign, email )`)
      .eq('status', 'PENDING')
      .eq('transaction_type', 'DEPOSIT')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      pendingTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:gray;">Error loading requests.</td></tr>';
      return;
    }

    pendingTableBody.innerHTML = '';
    if (!transactions || transactions.length === 0) {
      pendingTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:gray;">No pending requests right now.</td></tr>';
      return;
    }

    for (const txn of transactions) {
      const date = new Date(txn.created_at).toLocaleString();
      pendingTableBody.innerHTML += `
        <tr id="txn-${txn.id}">
          <td>${esc(txn.profiles?.ign || 'Unknown')}<br><span style="font-size:0.8rem;color:gray;">${esc(txn.profiles?.email || 'N/A')}</span></td>
          <td style="color: #00ff88; font-weight: bold;">₹${Number(txn.amount || 0)}</td>
          <td style="letter-spacing:1px; color:#00f2fe;">${esc(txn.reference_id || '')}</td>
          <td>${esc(date)}</td>
          <td>
            <button class="action-btn btn-approve" onclick="window.approveDeposit('${txn.id}', '${txn.user_id}', ${Number(txn.amount || 0)})"><i class="fas fa-check"></i></button>
            <button class="action-btn btn-reject" onclick="window.rejectDeposit('${txn.id}')"><i class="fas fa-times"></i></button>
          </td>
        </tr>
      `;
    }
  }

  window.approveDeposit = async function (txnId, userId, amount) {
    if (!confirm(`Approve ₹${amount}?`)) return;

    try {
      const { error: upErr } = await supabase
        .from('wallet_transactions')
        .update({ status: 'COMPLETED', processed_by: myId, updated_at: new Date().toISOString() })
        .eq('id', txnId);

      if (upErr) throw upErr;

      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (pErr) throw pErr;

      const newBalance = parseFloat(profile.wallet_balance || 0) + parseFloat(amount);

      const { error: balErr } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (balErr) throw balErr;

      document.getElementById(`txn-${txnId}`)?.remove();
      await loadAdminStats();
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Error approving.');
    }
  };

  window.rejectDeposit = async function (txnId) {
    if (!confirm('Reject?')) return;

    try {
      const { error } = await supabase
        .from('wallet_transactions')
        .update({ status: 'FAILED', processed_by: myId, updated_at: new Date().toISOString() })
        .eq('id', txnId);

      if (error) throw error;

      document.getElementById(`txn-${txnId}`)?.remove();
      await loadAdminStats();
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Error rejecting.');
    }
  };

  // -------------------- Prize Logs --------------------
  async function loadAuditLogs() {
    const auditBody = document.getElementById('audit-log-body');
    if (!auditBody) return;

    const { data: logs, error } = await supabase
      .from('wallet_transactions')
      .select(`amount, created_at, winner:user_id(ign, email), admin:processed_by(ign, email)`)
      .eq('transaction_type', 'PRIZE')
      .order('created_at', { ascending: false })
      .limit(15);

    if (error) {
      console.error(error);
      auditBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Error loading logs.</td></tr>';
      return;
    }

    auditBody.innerHTML = '';
    if (!logs || !logs.length) {
      auditBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No prizes awarded yet.</td></tr>';
      return;
    }

    for (const log of logs) {
      const date = new Date(log.created_at).toLocaleString();
      auditBody.innerHTML += `
        <tr>
          <td style="color:#00f2fe;">${esc(log.winner?.ign || 'Unknown')}</td>
          <td style="color:#00ff88; font-weight:bold;">₹${Number(log.amount || 0)}</td>
          <td style="color:#ff4757;">${esc(log.admin?.email || 'System')}</td>
          <td style="font-size:0.85rem; color:gray;">${esc(date)}</td>
        </tr>
      `;
    }
  }

  // -------------------- Organizer Applications (NEW) --------------------
  async function loadOrganizerApplications() {
    const body = document.getElementById('organizer-apps-body');
    const badge = document.getElementById('org-apps-badge');
    if (!body) return;

    const { data: apps, error } = await supabase
      .from('organizer_applications')
      .select('id, org_name, experience_level, status, created_at, user_id, profiles:profiles!organizer_applications_user_id_fkey(ign,email)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);
      body.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#ff4757;">Error loading applications</td></tr>`;
      if (badge) badge.innerText = `Error`;
      return;
    }

    const pendingCount = (apps || []).filter(a => a.status === 'PENDING').length;
    if (badge) badge.innerText = `${pendingCount} Pending`;

    if (!apps || apps.length === 0) {
      body.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No applications yet.</td></tr>`;
      return;
    }

    body.innerHTML = apps.map(a => {
      const date = new Date(a.created_at).toLocaleString();
      const status = a.status || 'PENDING';

      const statusBadge =
        status === 'PENDING' ? `<span class="badge pending">PENDING</span>` :
          status === 'APPROVED' ? `<span class="badge approved">APPROVED</span>` :
            `<span class="badge rejected">REJECTED</span>`;

      const canReview = status === 'PENDING';

      return `
        <tr id="orgapp-${a.id}">
          <td>
            ${esc(a.profiles?.ign || 'User')}<br>
            <span style="font-size:0.8rem;color:gray;">${esc(a.profiles?.email || '')}</span>
          </td>
          <td>${esc(a.org_name || '')}</td>
          <td>${esc(a.experience_level || '')}</td>
          <td>${statusBadge}</td>
          <td style="font-size:0.85rem;color:gray;">${esc(date)}</td>
          <td>
            ${canReview
          ? `
                <button class="action-btn btn-approve" onclick="window.reviewOrganizerApp('${a.id}', 'APPROVE')">
                  <i class="fas fa-check"></i> Approve
                </button>
                <button class="action-btn btn-reject" onclick="window.reviewOrganizerApp('${a.id}', 'REJECT')">
                  <i class="fas fa-times"></i> Reject
                </button>
              `
          : `<span style="color:var(--text-muted); font-size:0.85rem;">Reviewed</span>`
        }
          </td>
        </tr>
      `;
    }).join('');
  }

  window.reviewOrganizerApp = async function (appId, action) {
    const label = action === 'APPROVE' ? 'Approve' : 'Reject';
    if (!confirm(`${label} this organizer application?`)) return;

    try {
      const { data, error } = await supabase.rpc('owner_review_organizer_application', {
        p_app_id: appId,
        p_action: action
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'RPC failed');

      alert(`Done: ${data.message || 'OK'}`);

      await loadOrganizerApplications();
      await loadAdminStats();
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Failed to review application.');
    }
  };

  // initial loads
  await loadAdminStats();
  await loadPendingDeposits();
  await loadOrganizerApplications();
  await loadAuditLogs();

  // realtime refresh
  let t = null;
  const schedule = (fn, delay = 250) => {
    clearTimeout(t);
    t = setTimeout(fn, delay);
  };

  const rtWallet = supabase.channel('rt-owner-wallet')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_transactions' }, () => {
      schedule(async () => {
        await loadAdminStats();
        await loadPendingDeposits();
        await loadAuditLogs();
      });
    })
    .subscribe();

  const rtProfiles = supabase.channel('rt-owner-profiles')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
      schedule(loadAdminStats);
    })
    .subscribe();

  const rtTourneys = supabase.channel('rt-owner-tourneys')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, () => {
      schedule(loadAdminStats);
    })
    .subscribe();

  const rtOrgApps = supabase.channel('rt-owner-orgapps')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'organizer_applications' }, () => {
      schedule(loadOrganizerApplications);
    })
    .subscribe();

  window.addEventListener('beforeunload', async () => {
    try {
      await supabase.removeChannel(rtWallet);
      await supabase.removeChannel(rtProfiles);
      await supabase.removeChannel(rtTourneys);
      await supabase.removeChannel(rtOrgApps);
    } catch (_) { }
  });
});