// assets/js/supabase.js
// Global (window) supabase client — used by inline scripts via <script> tags
const SUPABASE_URL = 'https://fjjmlmxxbdacqmzntkvb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqam1sbXh4YmRhY3Ftem50a3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MzA5MzksImV4cCI6MjA4OTMwNjkzOX0.dLMbrDMbruDyzEbmnFhHIYJqt3OLwwjEz36SAbF93uI';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        // Determine login redirect based on current path depth
        const depth = location.pathname.split('/').filter(Boolean).length;
        const prefix = depth > 1 ? '../' : '';
        window.location.href = prefix + 'user-login.html';
        return null;
    }
    return session;
}

function signOut() {
    supabase.auth.signOut().then(() => {
        const depth = location.pathname.split('/').filter(Boolean).length;
        const prefix = depth > 1 ? '../' : '';
        window.location.href = prefix + 'index.html';
    });
}
