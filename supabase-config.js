// 1. Import Supabase (using CDN for vanilla HTML/JS)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 2. Put your actual Supabase Project URL and Anon Key here
const supabaseUrl = 'https://fjjmlmxxbdacqmzntkvb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqam1sbXh4YmRhY3Ftem50a3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MzA5MzksImV4cCI6MjA4OTMwNjkzOX0.dLMbrDMbruDyzEbmnFhHIYJqt3OLwwjEz36SAbF93uI'

// 3. Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 4. Helper function to check if a user is logged in
export async function checkSession() {
    const { data, error } = await supabase.auth.getSession()
    return data.session;
}