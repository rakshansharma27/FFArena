import { supabase } from '../assets/js/supabase-config.js';

const msg = document.getElementById('applyMsg');
const form = document.getElementById('applyForm');
const btn = document.getElementById('submitBtn');

function setMsg(t) {
    if (msg) msg.textContent = t;
}

function qs(name) {
    return new URL(location.href).searchParams.get(name) || '';
}

async function boot() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        location.href = '../user/user-login.html';
        return;
    }

    // Prefill email from query param
    const emailFromUrl = qs('email');
    const emailEl = document.getElementById('orgEmail');
    if (emailEl && emailFromUrl) emailEl.value = emailFromUrl;

    // If user already has a PENDING application -> go status
    const { data: app, error } = await supabase
        .from('organizer_applications')
        .select('id,status,created_at,org_name')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) console.error(error);

    if (app?.status === 'PENDING') {
        location.href = './application-status.html';
        return;
    }

    if (app?.status === 'APPROVED') {
        // role may already be ADMIN. If not, status page will show.
        location.href = './application-status.html';
        return;
    }

    setMsg(qs('retry') ? 'Your last application was rejected. You can apply again.' : 'Fill the form to apply.');
}

form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return (location.href = '../user/user-login.html');

    const org_name = document.getElementById('orgName')?.value?.trim();
    const contact_email = document.getElementById('orgEmail')?.value?.trim();
    const experience_level = document.getElementById('experienceLevel')?.value;
    const social_link = document.getElementById('socialLink')?.value?.trim();
    const why = document.getElementById('why')?.value?.trim();

    if (!org_name || !contact_email || !experience_level || !social_link || !why) {
        alert('Please fill all fields.');
        return;
    }

    const old = btn?.innerHTML;
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    }

    try {
        const { error } = await supabase
            .from('organizer_applications')
            .insert([{
                user_id: session.user.id,
                org_name,
                contact_email,
                experience_level,
                social_link,
                why,
                status: 'PENDING'
            }]);

        if (error) throw error;

        alert('Application submitted!');
        location.href = './application-status.html';
    } catch (err) {
        console.error(err);
        alert(err?.message || 'Failed to submit application.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = old || '<i class="fas fa-paper-plane"></i> Send Application';
        }
    }
});

await boot();