# AI Compliance Readiness Questionnaire Setup

This document outlines the complete setup for the AI Compliance Readiness Check questionnaire system.

## 🎯 **Overview**

The readiness questionnaire implements a comprehensive 6-category, 12-question assessment with exact scoring specifications:

- **6 Categories**: Governance, Data, Security, Vendors, Human Oversight, Transparency
- **12 Questions**: 2 questions per category with 0-3 scoring scale
- **Area Scores**: Average of 2 questions per category (rounded to 1 decimal)
- **Labels**: 0-1 = Low, 2 = Medium, 3 = High
- **Weighted Overall Score**: Using specified category weights
- **30-Day Plan**: Generated based on scoring rules

## 🔧 **Implementation Details**

### **Frontend Components**

1. **Questionnaire Page** (`/app/questionnaire/readiness/page.tsx`)
   - Payment verification before access
   - 6-category navigation with progress tracking
   - Radio button interface for 0-3 scoring
   - Real-time progress bar and completion status
   - Form validation and submission handling

2. **Question Structure**
   ```typescript
   interface Question {
     id: string;
     text: string;
     options: { value: number; label: string; description: string }[];
   }
   ```

### **Backend API**

1. **Readiness Check API** (`/app/api/readiness-check/route.ts`)
   - Validates Stripe session and payment status
   - Processes answers using scoring utility
   - Saves results to Supabase
   - Returns JSON summary for document generation

2. **Scoring Logic** (`/lib/readinessScoring.ts`)
   - Implements exact scoring specifications
   - Calculates area scores and weighted overall score
   - Generates 30-Day Plan based on rules
   - Provides validation and utility functions

### **Database Schema**

The `readiness_checks` table stores:
- Payment status and session information
- Complete assessment data (answers, scores, plan)
- Processing status for document generation

## 📊 **Scoring Specifications**

### **Category Weights**
- Governance: 25%
- Data: 20%
- Security: 20%
- Vendors: 15%
- Human Oversight: 10%
- Transparency: 10%

### **Question Scoring (0-3 Scale)**
- **0**: Best practice (Yes, No sensitive data, etc.)
- **1**: PII only (Data category)
- **2**: Partial/Some implementation
- **3**: No implementation/High risk

### **30-Day Plan Rules**
- Security ≥ 2 → "Enable MFA and RBAC for admins"
- Vendors ≥ 2 or no DPA → "Execute DPA with AI provider"
- Human Oversight ≥ 2 → "Add real-time human review"
- Data ≥ 2 and PHI = Yes → "Limit PHI in prompts; add redaction"
- Transparency ≥ 2 → "Add AI disclosure text in UI"
- Governance ≥ 2 → "Publish 1-page AI policy"

## 🚀 **Setup Instructions**

### **1. Database Setup**

Run the Supabase migration to create the `readiness_checks` table:

```sql
-- The migration file is already created at:
-- supabase/migrations/20250115000000_create_readiness_checks_table.sql
```

### **2. Environment Variables**

Ensure these are set in your `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_supabase_service_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Domain Configuration
NEXT_PUBLIC_DOMAIN_URL=http://localhost:3000
```

### **3. Install Dependencies**

```bash
npm install
```

### **4. Test the Flow**

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test the complete flow**:
   - Go to `http://localhost:3000`
   - Click "Book Readiness Check"
   - Complete Stripe payment
   - Fill out the readiness questionnaire
   - Verify results are saved to Supabase

## 🔍 **Testing Checklist**

- [ ] Payment verification works correctly
- [ ] All 12 questions are displayed with correct scoring options
- [ ] Progress bar updates as questions are answered
- [ ] Form validation prevents submission with incomplete answers
- [ ] API correctly calculates area scores and weighted overall score
- [ ] 30-Day Plan is generated based on scoring rules
- [ ] Results are saved to Supabase with correct status
- [ ] Success page displays after submission

## 📋 **Data Flow**

1. **Payment Complete** → User redirected to `/questionnaire/readiness?session_id=xxx`
2. **Payment Verification** → API validates session and status='paid'
3. **Questionnaire Display** → User completes 12 questions across 6 categories
4. **Form Submission** → POST to `/api/readiness-check` with answers
5. **Scoring Processing** → Calculate area scores, weighted score, and plan
6. **Database Storage** → Save results with status='processing'
7. **Success Confirmation** → User sees completion message

## 🎨 **UI Features**

- **Category Navigation**: Easy switching between assessment areas
- **Progress Tracking**: Visual progress bar and completion status
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Proper labels and keyboard navigation
- **Real-time Validation**: Immediate feedback on form completion

## 🔄 **Next Steps (Sprint 3)**

The questionnaire system is now ready for:
- Document/PDF generation
- Google Sheets integration
- Email delivery system
- Client dashboard for results

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Payment Verification Failed**
   - Check Stripe webhook is configured
   - Verify session ID in database
   - Ensure payment status is 'paid'

2. **Questions Not Loading**
   - Check browser console for errors
   - Verify all imports are correct
   - Ensure TypeScript compilation is successful

3. **Submission Fails**
   - Check API endpoint is accessible
   - Verify Supabase connection
   - Check all required fields are provided

### **Debug Mode**

Enable debug logging by adding to your environment:
```bash
DEBUG=readiness-check
```

This will provide detailed logging of the scoring process and API calls.
