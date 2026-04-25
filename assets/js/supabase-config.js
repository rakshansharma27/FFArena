// assets/js/supabase-config.js
// ES Module version — used by type="module" scripts
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://fjjmlmxxbdacqmzntkvb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqam1sbXh4YmRhY3Ftem50a3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MzA5MzksImV4cCI6MjA4OTMwNjkzOX0.dLMbrDMbruDyzEbmnFhHIYJqt3OLwwjEz36SAbF93uI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function checkSession() {
    const { data, error } = await supabase.auth.getSession();
    return data.session;
}
