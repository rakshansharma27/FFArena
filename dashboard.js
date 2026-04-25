import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1) Session Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return window.location.href = '../user/user-login.html';

    const userId = session.user.id;
    const userEmail = session.user.email;

    // 2) Helpers
    function avatarUrl(name) {
        const n = encodeURIComponent(name || 'Player');
        return `https://ui-avatars.com/api/?name=${n}&background=00f2fe&color=000`;
    }

    // 3) Load Profile (Self-healing)
    async function loadProfile() {
        let { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) console.error(error);

        if (!profile) {
            const newProfile = {
                id: userId,
                email: userEmail,
                ign: 'Player',
                wallet_balance: 0,
                matches_played: 0,
                total_kills: 0,
                total_earnings: 0,
                role: 'USER'
            };
            const { error: insErr } = await supabase.from('profiles').insert([newProfile]);
            if (insErr) console.error(insErr);
            profile = newProfile;
        }

        const ignEl = document.getElementById('player-ign');
        const walletEl = document.getElementById('wallet-balance');
        const matchesEl = document.getElementById('stat-matches');
        const killsEl = document.getElementById('stat-kills');
        const kdEl = document.getElementById('stat-kd');
        const earningsEl = document.getElementById('stat-earnings');

        if (ignEl) ignEl.innerHTML = `<span>${profile.ign || 'Player'}</span>`;
        if (walletEl) walletEl.innerText = `₹${Number(profile.wallet_balance || 0).toFixed(2)}`;
        if (matchesEl) matchesEl.innerText = profile.matches_played || 0;
        if (killsEl) killsEl.innerText = profile.total_kills || 0;
        if (earningsEl) earningsEl.innerText = `₹${Number(profile.total_earnings || 0).toFixed(0)}`;

        const mp = Number(profile.matches_played || 0);
        const tk = Number(profile.total_kills || 0);
        const kd = mp > 0 ? (tk / mp).toFixed(2) : '0.00';
        if (kdEl) kdEl.innerText = kd;

        const av = document.getElementById('player-avatar');
        if (av) av.src = avatarUrl(profile.ign);

        return profile;
    }

    const myProfile = await loadProfile();

    // 4) Organizer/Admin panel routing (Option B)
    window.goAdminPanel = async function () {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return window.location.href = '../user/user-login.html';

        // read role
        const { data: p, error: pErr } = await supabase
            .from('profiles')
            .select('id, role, email')
            .eq('id', session.user.id)
            .maybeSingle();

        if (pErr) console.error(pErr);

        const role = p?.role || 'USER';
        if (role === 'ADMIN' || role === 'OWNER') {
            window.location.href = '../admin/ff-admin-dashboard.html';
            return;
        }

        // If not admin: check existing application (latest)
        const { data: app, error: aErr } = await supabase
            .from('organizer_applications')
            .select('id, status, created_at, org_name')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (aErr) {
            console.error(aErr);
            // fallback: allow apply
            const email = encodeURIComponent(p?.email || session.user.email || '');
            window.location.href = `../organizers/apply.html?email=${email}`;
            return;
        }

        if (!app) {
            const email = encodeURIComponent(p?.email || session.user.email || '');
            window.location.href = `../organizers/apply.html?email=${email}`;
            return;
        }

        if (app.status === 'PENDING') {
            window.location.href = `../organizers/application-status.html`;
            return;
        }

        if (app.status === 'REJECTED') {
            const email = encodeURIComponent(p?.email || session.user.email || '');
            window.location.href = `../organizers/apply.html?email=${email}&retry=1`;
            return;
        }

        // APPROVED but role not updated (rare) -> status page
        window.location.href = `../organizers/application-status.html`;
    };

    // 5) Manual Top-Up Logic
    const submitUtrBtn = document.getElementById('submit-utr-btn');
    if (submitUtrBtn) {
        submitUtrBtn.addEventListener('click', async () => {
            const amount = Number(document.getElementById('deposit-amount')?.value || 0);
            const utr = (document.getElementById('utr-number')?.value || '').trim();

            if (!amount || amount < 10) return alert("Minimum deposit is ₹10");
            if (!utr || utr.length < 6) return alert("Enter a valid UTR number");

            const old = submitUtrBtn.innerHTML;
            submitUtrBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            try {
                const { error } = await supabase.from('wallet_transactions').insert([{
                    user_id: userId,
                    amount: parseFloat(amount),
                    transaction_type: 'DEPOSIT',
                    status: 'PENDING',
                    reference_id: utr
                }]);
                if (error) throw error;

                alert("Request Submitted! Owner/Admin will verify soon.");
                document.getElementById('topupModal')?.classList.remove('active');
            } catch (err) {
                console.error(err);
                alert(err?.message || "Error submitting request.");
            } finally {
                submitUtrBtn.innerHTML = old;
            }
        });
    }

    // 6) Wallet Join (RPC)
    window.joinTournament = async function (tournamentId, entryFee) {
        if (!confirm(`Join tournament for ₹${entryFee}? This will be deducted from your wallet.`)) return;

        try {
            const { data, error } = await supabase.rpc('join_tournament_with_wallet', { p_tournament_id: Number(tournamentId) });
            if (error) throw error;
            if (!data?.ok) return alert(data?.error || 'Join failed.');

            if (data.message === 'ALREADY_JOINED') return alert("You already joined this tournament!");
            alert("Successfully joined the tournament!");
            await loadProfile();
            await loadTournaments();
        } catch (err) {
            console.error(err);
            alert(err?.message || "Error joining tournament.");
        }
    };

    // 7) Load available tournaments
    async function loadTournaments() {
        const tBody = document.getElementById('available-tournaments-body');
        if (!tBody) return;

        const { data: tournaments, error } = await supabase
            .from('tournaments')
            .select('id,title,entry_fee,prize_pool,status,start_time')
            .eq('status', 'UPCOMING')
            .order('start_time', { ascending: true });

        if (error) {
            console.error(error);
            tBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ff4757;">Error loading tournaments</td></tr>';
            return;
        }

        if (!tournaments || tournaments.length === 0) {
            tBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No upcoming tournaments</td></tr>';
            return;
        }

        tBody.innerHTML = tournaments.map(t => `
      <tr>
        <td style="padding: 10px; color:#fff;">${t.title}</td>
        <td style="padding: 10px; color:#fff;">₹${Number(t.entry_fee || 0)}</td>
        <td style="padding: 10px; color:#fff;">₹${Number(t.prize_pool || 0)}</td>
        <td style="padding: 10px;">
          <button class="cyber-btn" style="padding: 8px 14px; font-size: 0.85rem;"
            onclick="window.joinTournament('${t.id}', ${Number(t.entry_fee || 0)})">Join</button>
        </td>
      </tr>
    `).join('');
    }

    await loadTournaments();

    // 8) Withdrawal
    window.requestWithdrawal = async function () {
        const amount = Number(prompt("Enter amount to withdraw (Min ₹50):") || 0);
        if (!amount || amount < 50) return;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('wallet_balance, upi_id')
            .eq('id', userId)
            .single();

        if (error) return alert("Error loading profile.");

        if (!profile.upi_id) return alert("Please set your UPI ID in Settings first!");
        if (Number(profile.wallet_balance || 0) < amount) return alert("Insufficient balance!");

        const newBal = Number(profile.wallet_balance || 0) - amount;
        await supabase.from('profiles').update({ wallet_balance: newBal, updated_at: new Date().toISOString() }).eq('id', userId);

        await supabase.from('wallet_transactions').insert([{
            user_id: userId,
            amount: amount,
            transaction_type: 'WITHDRAWAL',
            status: 'PENDING'
        }]);

        alert("Withdrawal requested! Owner/Admin will process it shortly.");
        await loadProfile();
    };

    // 9) Logout
    document.querySelectorAll('.logout-btn, a[href*="index.html"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const txt = (e.target?.innerText || '').toLowerCase();
            if (txt.includes('disconnect') || txt.includes('exit')) {
                e.preventDefault();
                await supabase.auth.signOut();
                window.location.href = '../index.html';
            }
        });
    });

    // 10) Realtime refresh
    let timer = null;
    const schedule = (fn, delay = 250) => { clearTimeout(timer); timer = setTimeout(fn, delay); };

    supabase.channel('rt-user-dashboard')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, () => schedule(loadProfile))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, () => schedule(loadTournaments))
        .subscribe();
});