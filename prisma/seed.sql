-- Demo Users (password: Demo@123 - bcrypt hashed)
-- Hash generated with bcryptjs, cost 12

INSERT INTO "User" (id, email, name, password, role, country, "createdAt", "updatedAt")
VALUES
  ('demo_admin_001', 'admin@llcpad.com', 'Admin User', '$2b$12$9GpIkyagW6AtVwrTcQuUxunJUacKig.vGaJX7eeVegZCxBUYb1Y1C', 'ADMIN', 'USA', NOW(), NOW()),
  ('demo_customer_001', 'customer@llcpad.com', 'Demo Customer', '$2b$12$9GpIkyagW6AtVwrTcQuUxunJUacKig.vGaJX7eeVegZCxBUYb1Y1C', 'CUSTOMER', 'Bangladesh', NOW(), NOW()),
  ('demo_content_001', 'content@llcpad.com', 'Content Manager', '$2b$12$9GpIkyagW6AtVwrTcQuUxunJUacKig.vGaJX7eeVegZCxBUYb1Y1C', 'CONTENT_MANAGER', 'USA', NOW(), NOW()),
  ('demo_sales_001', 'sales@llcpad.com', 'Sales Agent', '$2b$12$9GpIkyagW6AtVwrTcQuUxunJUacKig.vGaJX7eeVegZCxBUYb1Y1C', 'SALES_AGENT', 'USA', NOW(), NOW()),
  ('demo_support_001', 'support@llcpad.com', 'Support Agent', '$2b$12$9GpIkyagW6AtVwrTcQuUxunJUacKig.vGaJX7eeVegZCxBUYb1Y1C', 'SUPPORT_AGENT', 'USA', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Services
INSERT INTO "Service" (id, name, slug, description, "shortDesc", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('svc_llc_001', 'LLC Formation', 'llc-formation', 'Complete LLC formation service for all 50 US states.', 'Start your US LLC', true, 1, NOW(), NOW()),
  ('svc_ein_001', 'EIN Application', 'ein-application', 'Get your Employer Identification Number from the IRS.', 'Get your Tax ID', true, 2, NOW(), NOW()),
  ('svc_ra_001', 'Registered Agent', 'registered-agent', 'Professional registered agent service in any US state.', 'Comply with state requirements', true, 3, NOW(), NOW()),
  ('svc_amz_001', 'Amazon Seller Account', 'amazon-seller-account', 'Complete Amazon seller account setup assistance.', 'Start selling on Amazon', true, 4, NOW(), NOW()),
  ('svc_bank_001', 'Business Bank Account', 'business-bank-account', 'Assistance with opening US business bank account remotely.', 'Open US bank account', true, 5, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Packages for LLC Formation
INSERT INTO "Package" (id, "serviceId", name, description, "priceUSD", "priceBDT", features, "isPopular", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('pkg_basic_001', 'svc_llc_001', 'Basic', 'Essential LLC formation package', 149, 16500, ARRAY['Name Availability Check', 'Articles of Organization', 'Operating Agreement Template', 'Standard Processing (2-3 weeks)'], false, 1, NOW(), NOW()),
  ('pkg_std_001', 'svc_llc_001', 'Standard', 'Most popular LLC formation package', 299, 33000, ARRAY['Everything in Basic', 'EIN Application', 'Registered Agent (1 Year)', 'Expedited Processing (1 week)', 'Compliance Calendar'], true, 2, NOW(), NOW()),
  ('pkg_prem_001', 'svc_llc_001', 'Premium', 'Complete business setup package', 499, 55000, ARRAY['Everything in Standard', 'Business Bank Account Assistance', 'Amazon Seller Account Setup', 'Rush Processing (3-5 days)', '1 Hour Consultation', 'Priority Support'], false, 3, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- State Fees
INSERT INTO "StateFee" (id, "stateCode", "stateName", "llcFee", "annualFee", "processingTime", "isPopular", "createdAt", "updatedAt")
VALUES
  ('sf_wy', 'WY', 'Wyoming', 100, 60, '1-2 weeks', true, NOW(), NOW()),
  ('sf_de', 'DE', 'Delaware', 90, 300, '1-2 weeks', true, NOW(), NOW()),
  ('sf_nv', 'NV', 'Nevada', 425, 350, '1-3 weeks', true, NOW(), NOW()),
  ('sf_fl', 'FL', 'Florida', 125, 138.75, '1-2 weeks', true, NOW(), NOW()),
  ('sf_tx', 'TX', 'Texas', 300, 0, '2-3 weeks', true, NOW(), NOW()),
  ('sf_nm', 'NM', 'New Mexico', 50, 0, '1-2 weeks', true, NOW(), NOW())
ON CONFLICT ("stateCode") DO NOTHING;

-- FAQs
INSERT INTO "FAQ" (id, question, answer, category, "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('faq_001', 'How long does it take to form an LLC?', 'Processing times vary by state, typically 1-4 weeks. Expedited service can reduce this to 3-5 business days.', 'LLC Formation', true, 1, NOW(), NOW()),
  ('faq_002', 'Do I need to be a US citizen to form an LLC?', 'No, US citizenship is not required. Foreign nationals can legally form and own LLCs in the United States.', 'LLC Formation', true, 2, NOW(), NOW()),
  ('faq_003', 'What is a Registered Agent?', 'A registered agent receives legal documents and government correspondence on behalf of your LLC.', 'Registered Agent', true, 3, NOW(), NOW()),
  ('faq_004', 'Can I open a US bank account remotely?', 'Yes, we help international clients open US business bank accounts remotely through partner banks.', 'Banking', true, 4, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Testimonials
INSERT INTO "Testimonial" (id, name, company, country, content, rating, "isActive", "sortOrder", "createdAt")
VALUES
  ('test_001', 'Rahman Ahmed', 'TechBD Solutions', 'Bangladesh', 'LLCPad made forming my US LLC incredibly easy. Highly recommended!', 5, true, 1, NOW()),
  ('test_002', 'Sarah Chen', 'Global Imports Co', 'China', 'Professional service with excellent communication. Got my Wyoming LLC within 2 weeks.', 5, true, 2, NOW()),
  ('test_003', 'Mohammed Al-Farsi', 'Gulf Trading LLC', 'UAE', 'The premium package was worth every penny. They helped with everything including Amazon seller account.', 5, true, 3, NOW())
ON CONFLICT (id) DO NOTHING;
