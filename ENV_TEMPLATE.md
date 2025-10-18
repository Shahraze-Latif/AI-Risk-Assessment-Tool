# Environment Variables Template

Create a `.env.local` file in your project root with these variables:

```bash
# Google APIs Configuration
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_email
GOOGLE_TEMPLATE_DOC_ID=your_template_document_id_here
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id_here

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
