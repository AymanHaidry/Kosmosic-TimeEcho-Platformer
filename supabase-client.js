/* =====================================================
   TIME ECHO PLATFORMER — supabase-client.js
   Thin REST wrapper around Supabase.
   Replace SUPABASE_URL and SUPABASE_KEY with your
   project credentials from supabase.com
   ===================================================== */
window.TEP = window.TEP || {};

const SUPABASE_URL = 'https://bjxexkbfzvqjdizxchhk.supabase.co'; // ← replace
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqeGV4a2JmenZxamRpenhjaGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTQ4MjQsImV4cCI6MjA5MjU5MDgyNH0.CdCcu7e14CHMtG4bOzql8XCwuGDcQtTiSQE0IDBd5UU';                   // ← replace

TEP.DB = (() => {
  let accessToken = SUPABASE_ANON;

  function headers(extra = {}) {
    return {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${accessToken}`,
      ...extra,
    };
  }

  async function restFetch(path, opts = {}) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${path}`;
      const res = await fetch(url, { headers: headers(), ...opts });
      if (!res.ok) {
        const errText = await res.text();
        console.warn('[DB]', res.status, errText);
        return null;
      }
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (e) {
      console.warn('[DB] fetch error:', e);
      return null;
    }
  }

  async function authFetch(endpoint, body) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (e) {
      console.warn('[Auth] error:', e);
      return { error: e.message };
    }
  }

  return {
  setToken(tok) { accessToken = tok || SUPABASE_ANON; },

  // Auth
  async getUserByUsername(username) {
  const rows = await this.select(
    'profiles',
    `select=email&username=eq.${encodeURIComponent(username)}`
  );
  return rows?.[0] || null;
};

  console.log("Lookup:", username, rows);

  return rows?.[0] || null;
},

  async signUp(email, password)  { 
    return authFetch('signup', { email, password }); 
  },

  async signIn(email, password)  { 
    return authFetch('token?grant_type=password', { email, password }); 
  },

  async signOut(token) {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { 
          'apikey': SUPABASE_ANON, 
          'Authorization': `Bearer ${token}` 
        },
      });
    } catch(e) {}
  },
    // REST helpers
    async select(table, query = '') {
      return restFetch(`${table}${query ? '?' + query : ''}`);
    },
    async insert(table, row) {
      return restFetch(table, {
        method: 'POST',
        headers: headers({ 'Prefer': 'return=representation' }),
        body: JSON.stringify(row),
      });
    },
    async update(table, query, patch) {
      return restFetch(`${table}?${query}`, {
        method: 'PATCH',
        headers: headers({ 'Prefer': 'return=minimal' }),
        body: JSON.stringify(patch),
      });
    },
    async upsert(table, row) {
      return restFetch(table, {
        method: 'POST',
        headers: headers({ 'Prefer': 'return=representation,resolution=merge-duplicates' }),
        body: JSON.stringify(row),
      });
    },
    async rpc(fn, params = {}) {
      return restFetch(`rpc/${fn}`, {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },
  };
})();
