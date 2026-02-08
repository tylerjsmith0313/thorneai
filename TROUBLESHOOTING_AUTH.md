# Authentication Troubleshooting Guide

## Error: "FAILED TO FETCH"

This error typically means the browser cannot reach the Supabase API. Here are the causes and fixes:

### 1. Network/CORS Issues
**Symptoms**: Error appears immediately after trying to login
**Fixes**:
- Check internet connection
- Verify Supabase API is accessible: `https://axdimzwdugpinzruvgdv.supabase.co/`
- Clear browser cache and cookies
- Try in a different browser/incognito mode

### 2. Missing/Invalid Environment Variables
**Symptoms**: Auth works but fetch fails
**Fixes**:
- Verify in browser DevTools Console that Supabase client loaded:
  ```javascript
  // In browser console
  console.log(window.__SUPABASE_URL__)
  console.log(window.__SUPABASE_KEY__)
  ```
- Check `.env.local` has:
  - `VITE_SUPABASE_URL=https://axdimzwdugpinzruvgdv.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=eyJ...` (full key, not truncated)
- Restart Vite dev server after changing `.env.local`

### 3. Supabase Service Down
**Symptoms**: Consistent failures across all users
**Fixes**:
- Check Supabase status: https://status.supabase.com/
- Wait 5-10 minutes and retry

### 4. Invalid Credentials
**Symptoms**: "Invalid login credentials" or similar error
**Fixes**:
- Verify account exists in Supabase Auth panel
- Use correct email/password
- Check if account is disabled
- Try creating a new test account via signup

## Browser Console Debugging

Open DevTools (F12) and check Console tab for detailed errors:

```javascript
// Test Supabase connection
const test = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });
    if (error) console.error('Auth Error:', error.message);
    else console.log('Auth Success:', data);
  } catch (e) {
    console.error('Network Error:', e.message);
  }
};
test();
```

## Common Auth Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid login credentials` | Wrong email/password | Verify credentials or reset password |
| `User not confirmed` | Email verification pending | Check email for verification link |
| `Session expired` | Token outdated | Login again |
| `CORS error` | Browser security policy | Ensure Supabase URL is in CORS allowlist |
| `Network error` | Connection issue | Check internet, try VPN if needed |

## Testing Supabase Connection

1. In browser console, run:
```javascript
await fetch('https://axdimzwdugpinzruvgdv.supabase.co/auth/v1/user', {
  headers: { 
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error('Fetch failed:', e.message))
```

2. Check Supabase dashboard:
- Go to Supabase project
- Navigate to "Auth" → "Users"
- Verify your test user exists
- Check if user is confirmed (has checkmark)

## Performance Issues

**Symptoms**: Login is very slow
**Fixes**:
- Check network tab in DevTools for slow requests
- Verify internet speed
- Try different network (WiFi vs Mobile)
- Disable VPN if using one

## Session Persistence Issues

**Symptoms**: Logged out after page refresh
**Fixes**:
- Clear browser storage: DevTools → Application → Local Storage → Clear All
- Check if cookies are enabled
- Ensure `persistSession: true` in Supabase client config
- Check for browser storage limitations (private mode)

## Still Having Issues?

1. Check DevTools Network tab for failed requests
2. Note the exact error message
3. Check Supabase project logs for API errors
4. Try with a fresh browser profile
5. Contact Supabase support with error details
