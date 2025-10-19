# Environment Variables Template

Create a `.env.local` file in your project root with these variables:

```bash
# PDF Generation Configuration
# No Google API configuration required!
# PDF generation is now handled locally using jsPDF and HTML templates.

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_supabase_service_key

# Domain Configuration
NEXT_PUBLIC_DOMAIN_URL=https://your-domain.com
```

## 🔐 **Security Notes**

- ✅ **Never commit** `.env.local` to version control
- ✅ **Add to .gitignore** to prevent accidental commits
- ✅ **Use different values** for development and production
- ✅ **Keep sensitive data** in environment variables only
