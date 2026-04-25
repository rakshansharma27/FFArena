import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return window.location.href = '../user/user-login.html';

    const userId = session.user.id;

    const ignInput = document.getElementById('setting-ign');
    const uidInput = document.getElementById('setting-uid');
    const upiInput = document.getElementById('setting-upi');
    const saveBtn = document.getElementById('save-settings-btn');

    async function loadSettings() {
        const { data: profile } = await supabase.from('profiles').select('ign, ff_uid, upi_id').eq('id', userId).single();
        if (profile) {
            if (ignInput) ignInput.value = profile.ign || '';
            if (uidInput) uidInput.value = profile.ff_uid || '';
            if (upiInput) upiInput.value = profile.upi_id || '';
        }
    }
    await loadSettings();

    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            saveBtn.innerHTML = 'Saving...';

            const { error } = await supabase.from('profiles').update({
                ign: ignInput.value,
                ff_uid: uidInput.value,
                upi_id: upiInput.value
            }).eq('id', userId);

            if (error) alert("Error saving settings!");
            else alert("Settings Updated Successfully!");

            saveBtn.innerHTML = 'Update Profile';
        });
    }
});