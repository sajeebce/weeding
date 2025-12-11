# LLCPad Business Operations Guide

> Internal documentation for service fulfillment, pricing, and operations.
> **Confidential - For Internal Use Only**

---

## Table of Contents

1. [Business Model Overview](#business-model-overview)
2. [Service Fulfillment Guide](#service-fulfillment-guide)
3. [Profit Analysis by Service](#profit-analysis-by-service)
4. [POA Requirements](#poa-requirements)
5. [KYC & Verification Process](#kyc--verification-process)
6. [Partner Services Required](#partner-services-required)
7. [Tools & Resources](#tools--resources)

---

## Business Model Overview

### How It Works

```
Customer Orders Service
        ↓
Payment Processed (Stripe/SSLCommerz)
        ↓
Order Created in Dashboard (Status: Pending KYC)
        ↓
Customer Completes KYC in Dashboard
    - Passport/ID Upload
    - Address Proof
    - POA Signing (if required)
        ↓
Order Status: Processing
        ↓
We Fulfill Service Using:
    - Government Portals
    - Partner Services
    - AI-Assisted Document Preparation
        ↓
Order Status: Completed
        ↓
Documents Delivered to Customer Dashboard
```

### Key Principles

1. **No order fulfillment without payment** - Payment must be confirmed before any work begins
2. **No document filing without KYC** - Customer must verify identity before we file anything
3. **Clear disclaimers** - We are NOT a law firm, we provide business formation services only
4. **Partner relationships** - Some services require US-based partners

---

## Service Fulfillment Guide

### Formation & Legal Services

#### 1. LLC Formation

| Item | Details |
|------|---------|
| **Our Price** | $199 (Basic), $299 (Standard), $399 (Premium) |
| **State Filing Fee** | $100 (WY), $90 (DE), $50 (NM) - varies by state |
| **Our Cost** | State fee only |
| **Profit** | $99 - $349 per order |
| **POA Required** | Yes - for filing on behalf of client |
| **Fulfillment Method** | Online state portal filing |
| **Processing Time** | 3-5 business days (standard), 24 hrs (expedited) |

**How to Fulfill:**
1. Collect client info via order form (LLC name, address, members, etc.)
2. Complete KYC verification
3. Get signed POA from client
4. File Articles of Organization on state website
5. Upload filed documents to client dashboard
6. Order EIN if included in package

**State Filing Portals:**
- Wyoming: https://wyobiz.wyo.gov/
- Delaware: https://corp.delaware.gov/
- New Mexico: https://www.sos.state.nm.us/
- Florida: https://dos.myflorida.com/sunbiz/

---

#### 2. EIN Application

| Item | Details |
|------|---------|
| **Our Price** | $99 |
| **IRS Fee** | $0 (FREE) |
| **Our Cost** | $0 |
| **Profit** | $99 per order |
| **POA Required** | Yes - IRS Form 2848 or SS-4 authorization |
| **Fulfillment Method** | IRS Online (US hours) or Fax |
| **Processing Time** | Same day (online), 4 days (fax) |

**How to Fulfill:**
1. Verify LLC is already formed (need state filing number)
2. Complete Form SS-4 with client information
3. Option A: Apply online at IRS.gov (during US business hours)
4. Option B: Fax Form SS-4 to IRS
5. Receive EIN confirmation (CP 575 letter)
6. Upload to client dashboard

**IRS Resources:**
- Online EIN: https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online
- Fax: 855-641-6935 (within US)

---

#### 3. ITIN Application

| Item | Details |
|------|---------|
| **Our Price** | $199 |
| **IRS Fee** | $0 |
| **Our Cost** | $0 - $50 (if using CAA) |
| **Profit** | $149 - $199 per order |
| **POA Required** | Yes - Form 2848 |
| **Fulfillment Method** | IRS Form W-7 by mail or CAA |
| **Processing Time** | 7-11 weeks |

**How to Fulfill:**
1. Collect client's passport (certified copy or original)
2. Complete Form W-7
3. Option A: Client mails to IRS with original passport (risky)
4. Option B: Use Certifying Acceptance Agent (CAA) - recommended
5. Track application status
6. Deliver ITIN letter to client

**Note:** Consider partnering with a CAA for better service. CAAs can certify passport copies so client doesn't mail original.

---

#### 4. Trademark Registration

| Item | Details |
|------|---------|
| **Our Price** | $599 (Basic), $799 (Standard), $999 (Premium) |
| **USPTO Fee** | $250 - $350 per class |
| **Our Cost** | USPTO fee |
| **Profit** | $249 - $649 per order |
| **POA Required** | No - but Declaration required |
| **Fulfillment Method** | USPTO TEAS online filing |
| **Processing Time** | 8-12 months for registration |

**How to Fulfill:**
1. Conduct trademark search (free on USPTO)
2. Prepare trademark application
3. Client signs Declaration
4. File on USPTO TEAS system
5. Monitor application status
6. Respond to Office Actions if needed (may need attorney)
7. Deliver registration certificate

**USPTO Portal:** https://www.uspto.gov/trademarks/apply

**Important:** We file the application, but complex Office Actions may need attorney referral.

---

#### 5. DBA / Trade Name Filing

| Item | Details |
|------|---------|
| **Our Price** | $99 |
| **State/County Fee** | $10 - $50 |
| **Our Cost** | Filing fee |
| **Profit** | $49 - $89 per order |
| **POA Required** | Sometimes - depends on state |
| **Fulfillment Method** | State/County online portal |
| **Processing Time** | 1-5 business days |

**How to Fulfill:**
1. Determine filing location (state vs county)
2. Search for name availability
3. File DBA/Fictitious Name registration
4. Some states require newspaper publication (additional cost)
5. Upload certificate to client dashboard

---

#### 6. Operating Agreement

| Item | Details |
|------|---------|
| **Our Price** | $149 |
| **Our Cost** | $0 (AI-generated template) |
| **Profit** | $149 per order |
| **POA Required** | No |
| **Fulfillment Method** | AI document generation + customization |
| **Processing Time** | 1-2 business days |

**How to Fulfill:**
1. Collect LLC details (members, ownership %, management type)
2. Generate Operating Agreement using AI template
3. Customize based on client requirements
4. Review for accuracy
5. Deliver PDF to client for signing
6. Client signs and keeps (no filing required)

---

### Compliance & Documents

#### 7. Registered Agent Service

| Item | Details |
|------|---------|
| **Our Price** | $99/year |
| **Partner Cost** | $25 - $40/year (wholesale) |
| **Profit** | $59 - $74 per year (recurring) |
| **POA Required** | No |
| **Fulfillment Method** | Partner service (reseller model) |
| **Processing Time** | Same day activation |

**How to Fulfill:**
1. Sign up as reseller with RA provider
2. When client orders, create account with partner
3. Provide client with registered agent details
4. Partner receives mail/legal docs
5. We forward to client via dashboard

**Recommended Partners:**
- Northwest Registered Agent (https://www.northwestregisteredagent.com/reseller)
- Incfile
- ZenBusiness

---

#### 8. Annual Compliance / Report

| Item | Details |
|------|---------|
| **Our Price** | $149/year |
| **State Fee** | $50 - $300 (varies by state) |
| **Our Cost** | State fee |
| **Profit** | $49 - $99 per year |
| **POA Required** | Sometimes |
| **Fulfillment Method** | State online filing |
| **Processing Time** | Same day - 5 days |

**How to Fulfill:**
1. Track client's annual report due dates
2. Send reminder 30 days before due date
3. Collect any updated information
4. File annual report on state portal
5. Upload confirmation to dashboard

---

#### 9. Amendment Filing

| Item | Details |
|------|---------|
| **Our Price** | $99 |
| **State Fee** | $25 - $100 |
| **Our Cost** | State fee |
| **Profit** | $49 - $74 |
| **POA Required** | Yes |
| **Fulfillment Method** | State online filing |
| **Processing Time** | 3-7 business days |

---

#### 10. Certificate of Good Standing

| Item | Details |
|------|---------|
| **Our Price** | $49 |
| **State Fee** | $10 - $25 |
| **Our Cost** | State fee |
| **Profit** | $24 - $39 |
| **POA Required** | No |
| **Fulfillment Method** | State website order |
| **Processing Time** | Same day - 3 days |

---

#### 11. LLC Dissolution

| Item | Details |
|------|---------|
| **Our Price** | $149 |
| **State Fee** | $0 - $100 |
| **Our Cost** | State fee |
| **Profit** | $49 - $149 |
| **POA Required** | Yes |
| **Fulfillment Method** | State online filing |
| **Processing Time** | 5-10 business days |

---

#### 12. Apostille Service

| Item | Details |
|------|---------|
| **Our Price** | $99 |
| **State Fee** | $5 - $20 |
| **Partner/Shipping** | $30 - $50 |
| **Profit** | $29 - $64 |
| **POA Required** | No |
| **Fulfillment Method** | US-based partner service |
| **Processing Time** | 5-10 business days |

**How to Fulfill:**
1. Client uploads document to be apostilled
2. We send to US partner
3. Partner gets apostille from Secretary of State
4. Document shipped to client internationally

**Note:** Requires US-based fulfillment partner for physical document handling.

---

#### 13. Virtual US Address

| Item | Details |
|------|---------|
| **Our Price** | $149/year |
| **Partner Cost** | $50 - $100/year |
| **Profit** | $49 - $99/year (recurring) |
| **POA Required** | No |
| **Fulfillment Method** | Partner service (reseller) |
| **Processing Time** | 1-2 business days |

**Recommended Partners:**
- iPostal1 (https://ipostal1.com)
- Anytime Mailbox
- Earth Class Mail
- US Global Mail

---

### Amazon Services

#### 14. Amazon Seller Account Setup

| Item | Details |
|------|---------|
| **Our Price** | $349 |
| **Amazon Fee** | $39.99/month (Professional) |
| **Our Cost** | $0 (client pays Amazon directly) |
| **Profit** | $349 |
| **POA Required** | No - but need client credentials |
| **Fulfillment Method** | Amazon Seller Central |
| **Processing Time** | 3-7 business days |

**How to Fulfill:**
1. Collect client business info (LLC docs, EIN, bank details)
2. Guide client through Amazon registration OR
3. Client provides temporary access to complete setup
4. Complete seller profile
5. Verify identity (video call may be required - client does this)
6. Set up payment/deposit settings

**Important:** Client must do video verification themselves if required by Amazon.

---

#### 15. Brand Registry

| Item | Details |
|------|---------|
| **Our Price** | $299 |
| **Amazon Fee** | $0 |
| **Our Cost** | $0 |
| **Profit** | $299 |
| **POA Required** | No |
| **Fulfillment Method** | Amazon Brand Registry portal |
| **Processing Time** | 2-10 business days |

**Requirements:**
- Active registered trademark OR
- Pending trademark application
- Amazon Seller Account

---

#### 16. Category Ungating

| Item | Details |
|------|---------|
| **Our Price** | $149 |
| **Our Cost** | $0 |
| **Profit** | $149 |
| **POA Required** | No |
| **Fulfillment Method** | Amazon Seller Central |
| **Processing Time** | 1-7 business days |

**How to Fulfill:**
1. Identify which category needs ungating
2. Prepare required documents (invoices, authorization letters)
3. Submit ungating request through Seller Central
4. Follow up on approval

---

#### 17. Product Listing Optimization

| Item | Details |
|------|---------|
| **Our Price** | $149 per listing |
| **Our Cost** | $0 (AI-assisted) |
| **Profit** | $149 |
| **POA Required** | No |
| **Fulfillment Method** | AI content + manual optimization |
| **Processing Time** | 2-3 business days |

**Deliverables:**
- Optimized title
- Bullet points (5)
- Product description
- Backend keywords
- Image recommendations

---

#### 18. A+ Content Creation

| Item | Details |
|------|---------|
| **Our Price** | $199 |
| **Our Cost** | $0 - $20 (design tools) |
| **Profit** | $179 - $199 |
| **POA Required** | No |
| **Fulfillment Method** | AI content + Canva design |
| **Processing Time** | 3-5 business days |

**Deliverables:**
- A+ Content modules (5-7)
- Brand story (if requested)
- Comparison charts
- Lifestyle images with text overlay

---

#### 19. PPC Campaign Setup

| Item | Details |
|------|---------|
| **Our Price** | $249 |
| **Our Cost** | $0 |
| **Profit** | $249 |
| **POA Required** | No |
| **Fulfillment Method** | Amazon Advertising Console |
| **Processing Time** | 2-3 business days |

**Deliverables:**
- Keyword research
- Campaign structure setup
- Sponsored Products campaigns
- Sponsored Brands (if Brand Registered)
- Initial bid optimization
- 30-day monitoring guide

---

#### 20. Account Reinstatement

| Item | Details |
|------|---------|
| **Our Price** | $399 |
| **Our Cost** | $0 |
| **Profit** | $399 |
| **POA Required** | No |
| **Fulfillment Method** | Appeal letter + submission |
| **Processing Time** | Varies (24 hrs - several weeks) |

**How to Fulfill:**
1. Analyze suspension reason
2. Identify root cause
3. Draft Plan of Action (POA) using AI
4. Review and customize
5. Submit appeal through Seller Central
6. Follow up and iterate if needed

**Note:** No guarantee of reinstatement. Make this clear to clients.

---

### Tax & Finance

#### 21. Business Banking

| Item | Details |
|------|---------|
| **Our Price** | $199 |
| **Our Cost** | $0 |
| **Profit** | $199 |
| **POA Required** | No |
| **Fulfillment Method** | Partner banks (Mercury, Relay) |
| **Processing Time** | 1-5 business days |

**How to Fulfill:**
1. Collect required documents (LLC docs, EIN, passport)
2. Recommend appropriate bank (Mercury for non-US residents)
3. Guide through application process
4. Help with document upload
5. Troubleshoot if verification issues arise

**Recommended Banks (Non-US Resident Friendly):**
- Mercury (https://mercury.com) - Best for non-US
- Relay (https://relayfi.com)
- Bluevine

---

#### 22. Bookkeeping

| Item | Details |
|------|---------|
| **Our Price** | $149/month |
| **Our Cost** | $20 - $50/month (software + time) |
| **Profit** | $99 - $129/month (recurring) |
| **POA Required** | No |
| **Fulfillment Method** | QuickBooks/Wave + manual entry |
| **Processing Time** | Monthly deliverables |

**Monthly Deliverables:**
- Transaction categorization
- Bank reconciliation
- Monthly financial statements
- Expense tracking

**Tools:**
- QuickBooks Online
- Wave (free)
- Xero

---

#### 23. Tax Filing

| Item | Details |
|------|---------|
| **Our Price** | $349 |
| **Our Cost** | $50 - $100 (software/CPA fee) |
| **Profit** | $249 - $299 |
| **POA Required** | Yes - IRS Form 2848 |
| **Fulfillment Method** | Tax software or CPA partner |
| **Processing Time** | 3-7 business days |

**Important Notes:**
- Single-member LLCs: Schedule C with personal return
- Multi-member LLCs: Form 1065 partnership return
- For complex returns, refer to US CPA partner

**Recommended Software:**
- TurboTax Business
- TaxAct
- H&R Block Business

---

## Profit Analysis by Service

### One-Time Services

| Service | Price | Cost | Profit | Margin |
|---------|-------|------|--------|--------|
| LLC Formation (WY) | $199 | $100 | $99 | 50% |
| EIN Application | $99 | $0 | $99 | 100% |
| ITIN Application | $199 | $50 | $149 | 75% |
| Trademark Registration | $599 | $350 | $249 | 42% |
| DBA Filing | $99 | $30 | $69 | 70% |
| Operating Agreement | $149 | $0 | $149 | 100% |
| Amendment Filing | $99 | $50 | $49 | 50% |
| Certificate of Good Standing | $49 | $15 | $34 | 69% |
| LLC Dissolution | $149 | $50 | $99 | 66% |
| Apostille Service | $99 | $40 | $59 | 60% |
| Amazon Seller Account | $349 | $0 | $349 | 100% |
| Brand Registry | $299 | $0 | $299 | 100% |
| Category Ungating | $149 | $0 | $149 | 100% |
| Listing Optimization | $149 | $0 | $149 | 100% |
| A+ Content | $199 | $20 | $179 | 90% |
| PPC Campaign Setup | $249 | $0 | $249 | 100% |
| Account Reinstatement | $399 | $0 | $399 | 100% |
| Business Banking | $199 | $0 | $199 | 100% |
| Tax Filing | $349 | $100 | $249 | 71% |

### Recurring Services (Annual/Monthly)

| Service | Price | Cost | Profit | Margin |
|---------|-------|------|--------|--------|
| Registered Agent | $99/yr | $30/yr | $69/yr | 70% |
| Annual Compliance | $149/yr | $75/yr | $74/yr | 50% |
| Virtual US Address | $149/yr | $75/yr | $74/yr | 50% |
| Bookkeeping | $149/mo | $40/mo | $109/mo | 73% |

### Highest Profit Services (Focus on These)

1. **EIN Application** - 100% profit, easy to fulfill
2. **Operating Agreement** - 100% profit, AI-generated
3. **Amazon Services** - 100% profit, time-based only
4. **Account Reinstatement** - $399 profit, high value

---

## POA Requirements

### Services Requiring Power of Attorney

| Service | POA Type | Why Needed |
|---------|----------|------------|
| LLC Formation | State-specific POA | Filing on behalf of client |
| EIN Application | IRS Form 2848 or SS-4 signature | IRS requires authorization |
| ITIN Application | IRS Form 2848 | IRS requires authorization |
| Amendment Filing | State-specific POA | Modifying state records |
| LLC Dissolution | State-specific POA | Closing state records |
| Annual Report | Sometimes required | Depends on state |
| Tax Filing | IRS Form 2848 | Filing returns on behalf |

### Services NOT Requiring POA

- Operating Agreement (client document, no filing)
- Trademark Registration (client signs declaration directly)
- Certificate of Good Standing (public record request)
- All Amazon Services (client grants account access)
- Business Banking (client applies directly)
- Bookkeeping (we just manage records)

### POA Collection Process

1. Include POA in order form as required document
2. After payment, prompt client to sign POA in dashboard
3. Use digital signature (DocuSign/HelloSign) or upload signed PDF
4. Store POA securely with order records
5. POA should specify exact services authorized

---

## KYC & Verification Process

### Why KYC is Required

1. **Legal Compliance** - We're filing government documents on behalf of clients
2. **Fraud Prevention** - Verify person ordering is real
3. **Document Accuracy** - Names must match exactly
4. **Our Protection** - Paper trail if issues arise

### KYC Process Flow

```
1. Customer Completes Order & Payment
              ↓
2. Order Status: "Pending KYC"
              ↓
3. Customer Sees KYC Prompt in Dashboard
              ↓
4. Customer Uploads Required Documents:
   - Government ID (Passport/Driver's License)
   - Proof of Address (Utility Bill/Bank Statement)
   - Selfie with ID (for identity verification)
   - POA Signature (if required for service)
              ↓
5. We Review Documents (Manual or AI-assisted)
              ↓
6. If Approved: Order Status → "Processing"
   If Rejected: Request re-upload with reason
              ↓
7. Service Fulfillment Begins
```

### KYC Document Requirements

#### For All Orders:

| Document | Requirements |
|----------|--------------|
| **Government ID** | Valid passport OR national ID with photo. Must show full name, DOB, photo. Not expired. |
| **Proof of Address** | Utility bill, bank statement, or government letter. Dated within 90 days. Shows full address. |

#### Additional for Specific Services:

| Service | Additional Documents |
|---------|---------------------|
| LLC Formation | Signed POA, SSN/ITIN (if US person) |
| EIN Application | LLC Formation documents (Articles of Organization) |
| ITIN Application | Passport (may need certified copy), W-7 support documents |
| Trademark | Specimen of use (logo file, product photos) |
| Tax Filing | Prior year returns, 1099s, income statements |
| Amazon Services | Existing seller account credentials (temporary access) |

### KYC Dashboard Features to Implement

1. **Document Upload Section**
   - Drag & drop file upload
   - Accepted formats: PDF, JPG, PNG
   - Max file size: 10MB
   - Preview before submit

2. **Status Indicators**
   - Pending Upload
   - Under Review
   - Approved
   - Rejected (with reason)

3. **Digital Signature**
   - For POA signing
   - Integration with DocuSign/HelloSign OR
   - Simple "Type your name" + checkbox confirmation

4. **Verification Checklist**
   - Show client what's needed
   - Mark completed items
   - Highlight missing items

### KYC Review Process (Our Side)

1. **Automated Checks** (Future Implementation)
   - File format validation
   - Document expiry check
   - Name matching across documents

2. **Manual Review**
   - Verify document authenticity
   - Check name consistency
   - Confirm address matches
   - Approve or reject with notes

3. **Escalation**
   - Flag suspicious documents
   - Request video call if needed
   - Refuse service if fraud suspected

---

## Partner Services Required

### Essential Partners

| Partner Type | Purpose | Recommended Providers |
|--------------|---------|----------------------|
| **Registered Agent** | US address for legal docs | Northwest RA, Incfile, ZenBusiness |
| **Virtual Mailbox** | Mail forwarding | iPostal1, Earth Class Mail, Anytime Mailbox |
| **Apostille Service** | Document authentication | One Source Process, Apostille.net |
| **CPA Network** | Complex tax situations | Local US CPAs, 1-800Accountant |
| **Attorney Network** | Legal questions, complex trademarks | LegalZoom partners, Avvo |

### Partner Cost Estimates

| Partner Service | Retail Price | Wholesale Cost | Our Margin |
|-----------------|--------------|----------------|------------|
| Registered Agent | $99-149/yr | $25-40/yr | 60-70% |
| Virtual Address | $149-199/yr | $50-100/yr | 50-66% |
| Apostille | $99-149 | $30-50 | 50-70% |

### Setting Up Partner Relationships

1. **Registered Agent Partner**
   - Apply for reseller/affiliate account
   - Get wholesale pricing
   - Set up API integration if available
   - White-label client experience

2. **Virtual Address Partner**
   - Compare pricing and locations
   - Check international shipping rates
   - Verify mail scanning/forwarding features
   - Set up business account

---

## Tools & Resources

### Government Portals

| State | Portal URL |
|-------|------------|
| Wyoming | https://wyobiz.wyo.gov/ |
| Delaware | https://corp.delaware.gov/ |
| New Mexico | https://www.sos.state.nm.us/ |
| Florida | https://dos.myflorida.com/sunbiz/ |
| Texas | https://www.sos.state.tx.us/ |
| Nevada | https://www.nvsos.gov/ |
| California | https://businesssearch.sos.ca.gov/ |

### IRS Resources

| Resource | URL |
|----------|-----|
| EIN Online Application | https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online |
| Form SS-4 (EIN) | https://www.irs.gov/forms-pubs/about-form-ss-4 |
| Form W-7 (ITIN) | https://www.irs.gov/forms-pubs/about-form-w-7 |
| Form 2848 (POA) | https://www.irs.gov/forms-pubs/about-form-2848 |

### Amazon Resources

| Resource | URL |
|----------|-----|
| Seller Central | https://sellercentral.amazon.com/ |
| Brand Registry | https://brandservices.amazon.com/ |
| Advertising Console | https://advertising.amazon.com/ |

### AI Tools for Service Fulfillment

| Tool | Use Case |
|------|----------|
| Claude/ChatGPT | Document drafting, appeal letters, content |
| Canva | A+ Content design, graphics |
| Grammarly | Content proofreading |

### Software Stack

| Purpose | Tool |
|---------|------|
| Document Signing | DocuSign, HelloSign, PandaDoc |
| Bookkeeping | QuickBooks, Wave, Xero |
| Tax Filing | TurboTax Business, TaxAct |
| Project Management | Notion, Trello |
| Communication | Intercom, Crisp, WhatsApp Business |

---

## Appendix: Service Checklist Templates

### LLC Formation Checklist

- [ ] Payment received
- [ ] KYC documents uploaded
- [ ] POA signed
- [ ] LLC name availability checked
- [ ] Articles of Organization prepared
- [ ] State filing submitted
- [ ] Filing confirmation received
- [ ] Operating Agreement generated (if included)
- [ ] EIN applied (if included)
- [ ] Documents uploaded to client dashboard
- [ ] Client notified of completion

### Amazon Seller Account Checklist

- [ ] Payment received
- [ ] KYC documents uploaded
- [ ] Business documents collected (LLC, EIN)
- [ ] Bank account details received
- [ ] Amazon registration started
- [ ] Identity verification completed (by client)
- [ ] Seller profile completed
- [ ] Account approved
- [ ] Client notified with login details

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-11 | Initial documentation |

---

*This document is confidential and for internal use only. Do not share with clients or external parties.*
