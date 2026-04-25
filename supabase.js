// assets/js/supabase.js
const SUPABASE_URL = 'https://fjjmlmxxbdacqmzntkvb.supabase.co';   // ← CHANGE THIS
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqam1sbXh4YmRhY3Ftem50a3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MzA5MzksImV4cCI6MjA4OTMwNjkzOX0.dLMbrDMbruDyzEbmnFhHIYJqt3OLwwjEz36SAbF93uI';       // ← CHANGE THIS

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------- helpers ----------------------------------
async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '../user-login.html'; // adjust relative path as needed
        return null;
    }
    return session;
}

function signOut() {
    supabase.auth.signOut().then(() => window.location.href = '../index.html');
}