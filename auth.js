import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- REGISTRATION LOGIC ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Inside your registerForm event listener in auth.js:
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-pass').value;
            const ign = document.getElementById('reg-name').value;
            const uid = document.getElementById('reg-uid').value;
            const phone = document.getElementById('reg-phone').value; // NEW!

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { ign: ign, ff_uid: uid, phone: phone } // Sends to our new SQL trigger!
                }
            });

            if (error) {
                alert("Error: " + error.message);
            } else {
                alert("Registration Successful! Welcome to the Arena.");
                window.location.href = 'user-dashboard.html';
            }
        });
    }

    // --- LOGIN LOGIC ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-pass').value;

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                alert("Login Failed: " + error.message);
            } else {
                window.location.href = 'user-dashboard.html';
            }
        });
    }
});