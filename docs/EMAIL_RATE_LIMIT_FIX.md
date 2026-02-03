# Fix: Email Rate Limit Exceeded Error

## Problem

When creating a customer account, you may encounter the error:
```
email rate limit exceeded
```

This happens because Supabase has rate limits on email sending (for email confirmations, password resets, etc.). The free tier has stricter limits.

## Quick Fix: Disable Email Confirmation (Recommended for Development)

### Step 1: Go to Supabase Dashboard

1. Open your Supabase project dashboard
2. Navigate to **Authentication** → **Settings** (or **Authentication** → **Providers** → **Email**)

### Step 2: Disable Email Confirmation

1. Find the **"Confirm email"** or **"Enable email confirmations"** setting
2. **Disable** it (toggle it off)
3. Save the changes

**Location in Dashboard:**
- Path: `Authentication` → `Settings` → `Email Auth`
- Look for: `Enable email confirmations` or `Confirm email`
- Set it to: **OFF** (disabled)

### Step 3: Test Signup Again

After disabling email confirmation:
- Users will be able to sign up immediately without email confirmation
- No emails will be sent, so no rate limit issues
- Perfect for development and testing

## Alternative Solutions

### Option 1: Wait for Rate Limit to Reset

- Rate limits typically reset after **1 hour**
- Wait 10-15 minutes and try again
- Use a different email address for testing

### Option 2: Use Different Email Addresses

- Try signing up with a different email
- Each email address has its own rate limit
- Useful for testing multiple accounts

### Option 3: Upgrade Supabase Plan

- Free tier: ~3 emails per hour per recipient
- Pro tier: Higher limits
- Only needed for production with high signup volume

### Option 4: Use Magic Link Instead (Alternative Auth)

- Magic links have different rate limits
- Can be configured in Supabase Dashboard
- Not recommended for this use case

## For Production

If you need email confirmation in production:

1. **Keep email confirmation enabled** in Supabase
2. **Monitor rate limits** and implement retry logic
3. **Use a custom SMTP** provider (Supabase Pro plan) for higher limits
4. **Implement rate limiting** on your frontend to prevent too many signup attempts
5. **Add CAPTCHA** to prevent abuse

## Verification

After disabling email confirmation:

1. Try signing up with a new account
2. You should be able to sign up immediately
3. No email will be sent
4. User will be logged in automatically after signup

## Code Changes Made

The application has been updated to:
- Detect rate limit errors specifically
- Show a helpful error message with instructions
- Guide users to disable email confirmation for development

## Notes

- **Development**: Email confirmation is usually not needed
- **Production**: Consider enabling it for security
- **Testing**: Use different emails or wait between attempts
- **Rate Limits**: Free tier = ~3 emails/hour per recipient

## Related Files

- `lib/auth/auth-utils.ts` - Updated error handling
- `app/(auth)/signup/page.tsx` - Updated error messages

## Still Having Issues?

1. Check Supabase Dashboard → Authentication → Settings
2. Verify email confirmation is disabled
3. Clear browser cache and try again
4. Wait 15 minutes if you've made many attempts
5. Check Supabase project logs for detailed error messages



