import { supabase } from '../assets/js/supabase-config.js';

const statusText = document.getElementById('statusText');
const statusBadge = document.getElementById('statusBadge');
const actions = document.getElementById('actions');

function set(html) { if (statusBadge) statusBadge.innerHTML = html; }
function setActions(html) { if (actions) actions.innerHTML = html; }

function badge(status) {
    if (status === 'PENDING') return `<div class="badge pending">⏳ PENDING</div>`;
    if (status === 'APPROVED') return `<div class="badge approved">✅ APPROVED</div>`;
    if (status === 'REJECTED') return `<div class="badge rejected">❌ REJECTED</div>`;
    return `<div class="badge">—</div>`;
}

async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        location.href = '../user/user-login.html';
        return;
    }

    // role check first
    const { data: prof } = await supabase
        .from('profiles')
        .select('role,email')
        .eq('id', session.user.id)
        .maybeSingle();

    if (prof?.role === 'ADMIN' || prof?.role === 'OWNER') {
        statusText.textContent = 'You are approved as Admin/Organizer. Redirecting to Admin Panel...';
        set(`<div class="badge approved">✅ ACTIVE ADMIN</div>`);
        setActions(`<a class="cyber-btn" href="../admin/ff-admin-dashboard.html">Open Admin Panel</a>`);
        setTimeout(() => location.href = '../admin/ff-admin-dashboard.html', 800);
        return;
    }

    const { data: app } = await supabase
        .from('organizer_applications')
        .select('id,status,created_at,org_name')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!app) {
        statusText.textContent = 'No application found. Please submit an application first.';
        setActions(`<a class="cyber-btn" href="./apply.html">Apply Now</a>`);
        set('');
        return;
    }

    statusText.textContent = `Org: ${app.org_name || '—'} · Submitted: ${new Date(app.created_at).toLocaleString()}`;
    set(badge(app.status));

    if (app.status === 'PENDING') {
        setActions(`
      <a class="cyber-btn" href="../user/user-dashboard.html">Back to Dashboard</a>
      <a class="cyber-btn" href="./organizers.html" style="border-color:#aa00ff;color:#aa00ff;background:rgba(170,0,255,0.1);">View Organizers</a>
    `);
    } else if (app.status === 'REJECTED') {
        setActions(`
      <a class="cyber-btn" href="./apply.html?retry=1">Apply Again</a>
      <a class="cyber-btn" href="../user/user-dashboard.html" style="border-color:#aa00ff;color:#aa00ff;background:rgba(170,0,255,0.1);">Back</a>
    `);
    } else if (app.status === 'APPROVED') {
        statusText.textContent = 'Approved by Owner. Your role will be upgraded shortly. Try again in a few seconds.';
        setActions(`
      <a class="cyber-btn" href="../user/user-dashboard.html">Back</a>
      <a class="cyber-btn" href="../admin/ff-admin-dashboard.html" style="border-color:#00ff88;color:#00ff88;background:rgba(0,255,136,0.08);">Try Admin Panel</a>
    `);
    }
}

await load();

// realtime: if owner updates application status, user page auto updates
let timer = null;
const schedule = () => { clearTimeout(timer); timer = setTimeout(load, 250); };

supabase.channel('rt-app-status')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'organizer_applications' }, schedule)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, schedule)
    .subscribe();