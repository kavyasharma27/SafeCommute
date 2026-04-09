# 🔐 Admin Access Configuration

This document contains secure admin credentials. **DO NOT COMMIT TO PUBLIC REPO!**

## 📺 Demo Admin (For Interviews/Presentations)

Use this to show recruiters and in demonstrations:

```
Email: admin@safecommute.com
Password: admin123
```

**Access:** `/admin/login` → Demo Mode tab

## 🔒 Real Admin (Secure Access)

For actual administrative control:

```
Passcode: SafeCommute@2026
```

**Phone (masked):** +91 ******936

**Access:** `/admin/login` → Real Admin tab

---

## 🛠️ How to Change Real Admin Passcode

1. Open: `server/src/routes/admin.ts`
2. Find: `const REAL_ADMIN_PASSCODE = 'SafeCommute@2026';`
3. Change to your preferred passcode (min 6 characters)
4. Restart server: `npm run dev`

**Security Tip:** Use a strong passcode with mix of letters, numbers, and symbols.

---

## 🎯 When to Use Which Mode

### Use Demo Mode When:
- Showing project to recruiters
- Giving product presentations
- Taking screenshots for portfolio
- Live coding interviews

### Use Real Admin Mode When:
- Managing actual platform data
- Viewing real user statistics
- Monitoring live SOS alerts
- Production operations

---

## 🔐 Security Features

✅ **No SMS Costs:** Static passcode, no Twilio needed  
✅ **Privacy Protected:** Phone number masked (+91 ******936)  
✅ **Two-Factor Concept:** Demonstrates multi-tier authentication  
✅ **JWT Tokens:** Separate tokens for demo vs real admin  
✅ **Server-Side Validation:** Passcode verified on backend  

---

## 📝 For Interviews

**Question:** "How do you secure admin access?"

**Answer:**
"I implemented a two-tier admin authentication system. The demo mode uses simple credentials for presentations, while real admin access requires a secure passcode that's validated server-side with JWT token generation. The admin phone number is masked for privacy (+91 ******936), and the passcode can be easily rotated without code changes. This approach eliminates SMS costs while maintaining security through secret passcode authentication."

---

## ⚠️ Important Notes

- **DO NOT** share the real admin passcode publicly
- **DO NOT** commit this file to Git (add to .gitignore)
- **CHANGE** the passcode before deploying to production
- Consider using environment variables for passcode storage
- In production, hash passcode with bcrypt for additional security

---

## 🚀 Deployment Checklist

Before deploying:

- [ ] Change `REAL_ADMIN_PASSCODE` to unique value
- [ ] Move passcode to environment variable
- [ ] Add `ADMIN_ACCESS.md` to `.gitignore`
- [ ] Test both demo and real admin modes
- [ ] Verify JWT token expiration (currently 24h)
- [ ] Consider implementing rate limiting on login attempts

---

Last Updated: April 9, 2026
