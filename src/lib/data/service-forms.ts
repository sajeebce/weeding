// Service Form Configurations
// This file contains all form field definitions for each service

export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "select"
  | "textarea"
  | "date"
  | "number"
  | "checkbox"
  | "radio"
  | "file"
  | "country"
  | "state"
  | "heading"
  | "paragraph"
  | "divider";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string; description?: string }[];
  helpText?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  conditionalOn?: {
    field: string;
    value: string | string[];
    operator?: "equals" | "not_equals" | "contains" | "not_empty";
  };
  accept?: string; // For file inputs
}

export interface FormStep {
  id: number;
  name: string;
  description?: string;
  fields: FormField[];
}

export interface ServiceFormConfig {
  serviceSlug: string;
  title: string;
  description: string;
  steps: FormStep[];
  faqs: { question: string; answer: string }[];
}

// ============================================
// EIN APPLICATION
// ============================================
export const einApplicationForm: ServiceFormConfig = {
  serviceSlug: "ein-application",
  title: "EIN Application",
  description: "Get your Employer Identification Number (Tax ID) for your US business",
  steps: [
    {
      id: 1,
      name: "LLC Information",
      description: "Provide details about your LLC",
      fields: [
        {
          name: "llcName",
          label: "LLC Legal Name",
          type: "text",
          required: true,
          placeholder: "Your Company LLC",
          helpText: "Enter the exact name as registered with the state",
        },
        {
          name: "formationState",
          label: "State of Formation",
          type: "state",
          required: true,
        },
        {
          name: "formationDate",
          label: "Date of Formation",
          type: "date",
          required: true,
          helpText: "When was your LLC formed?",
        },
        {
          name: "businessAddress",
          label: "Business Street Address",
          type: "text",
          required: true,
          placeholder: "123 Main Street",
        },
        {
          name: "businessCity",
          label: "City",
          type: "text",
          required: true,
        },
        {
          name: "businessState",
          label: "State",
          type: "state",
          required: true,
        },
        {
          name: "businessZip",
          label: "ZIP Code",
          type: "text",
          required: true,
          validation: { pattern: "^[0-9]{5}(-[0-9]{4})?$" },
        },
        {
          name: "differentMailingAddress",
          label: "Mailing address is different from business address",
          type: "checkbox",
          required: false,
        },
        {
          name: "mailingAddress",
          label: "Mailing Street Address",
          type: "text",
          required: false,
          conditionalOn: { field: "differentMailingAddress", value: "true" },
        },
        {
          name: "mailingCity",
          label: "Mailing City",
          type: "text",
          required: false,
          conditionalOn: { field: "differentMailingAddress", value: "true" },
        },
        {
          name: "mailingState",
          label: "Mailing State",
          type: "state",
          required: false,
          conditionalOn: { field: "differentMailingAddress", value: "true" },
        },
        {
          name: "mailingZip",
          label: "Mailing ZIP Code",
          type: "text",
          required: false,
          conditionalOn: { field: "differentMailingAddress", value: "true" },
        },
      ],
    },
    {
      id: 2,
      name: "Business Details",
      description: "Tell us about your business activities",
      fields: [
        {
          name: "businessActivity",
          label: "Principal Business Activity",
          type: "select",
          required: true,
          options: [
            { value: "ecommerce", label: "E-commerce / Online Retail" },
            { value: "consulting", label: "Consulting Services" },
            { value: "software", label: "Software / Technology" },
            { value: "manufacturing", label: "Manufacturing" },
            { value: "wholesale", label: "Wholesale Trade" },
            { value: "retail", label: "Retail Trade" },
            { value: "realestate", label: "Real Estate" },
            { value: "construction", label: "Construction" },
            { value: "healthcare", label: "Healthcare" },
            { value: "finance", label: "Finance / Investment" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "businessActivityDescription",
          label: "Describe Your Business Activity",
          type: "textarea",
          required: true,
          placeholder: "Briefly describe what your business does...",
          validation: { maxLength: 500 },
        },
        {
          name: "businessStartDate",
          label: "Business Start Date",
          type: "date",
          required: true,
          helpText: "When did/will your business start operating?",
        },
        {
          name: "expectedEmployees",
          label: "Expected Number of Employees (next 12 months)",
          type: "select",
          required: true,
          options: [
            { value: "0", label: "0 - No employees" },
            { value: "1-4", label: "1-4 employees" },
            { value: "5-9", label: "5-9 employees" },
            { value: "10-19", label: "10-19 employees" },
            { value: "20+", label: "20 or more employees" },
          ],
        },
        {
          name: "reasonForApplying",
          label: "Reason for Applying",
          type: "select",
          required: true,
          options: [
            { value: "new_business", label: "Started a new business" },
            { value: "banking", label: "Banking purposes" },
            { value: "amazon", label: "Amazon seller account" },
            { value: "compliance", label: "Compliance / legal requirement" },
            { value: "other", label: "Other" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Responsible Party",
      description: "Information about the person responsible for the LLC",
      fields: [
        {
          name: "responsiblePartyName",
          label: "Full Legal Name",
          type: "text",
          required: true,
          placeholder: "John Smith",
          helpText: "This is the person who controls the LLC and its assets",
        },
        {
          name: "responsiblePartyTitle",
          label: "Title/Position",
          type: "select",
          required: true,
          options: [
            { value: "owner", label: "Owner" },
            { value: "member", label: "Member" },
            { value: "manager", label: "Manager" },
            { value: "managing_member", label: "Managing Member" },
          ],
        },
        {
          name: "hasSSNorITIN",
          label: "Do you have a US SSN or ITIN?",
          type: "radio",
          required: true,
          options: [
            { value: "ssn", label: "Yes, I have an SSN" },
            { value: "itin", label: "Yes, I have an ITIN" },
            { value: "none", label: "No, I am a foreign person" },
          ],
        },
        {
          name: "ssnOrItin",
          label: "SSN or ITIN",
          type: "text",
          required: false,
          placeholder: "XXX-XX-XXXX",
          conditionalOn: { field: "hasSSNorITIN", value: ["ssn", "itin"] },
        },
        {
          name: "responsiblePartyAddress",
          label: "Residential Address",
          type: "text",
          required: true,
        },
        {
          name: "responsiblePartyCity",
          label: "City",
          type: "text",
          required: true,
        },
        {
          name: "responsiblePartyCountry",
          label: "Country",
          type: "country",
          required: true,
        },
        {
          name: "responsiblePartyPhone",
          label: "Phone Number",
          type: "phone",
          required: true,
        },
        {
          name: "responsiblePartyEmail",
          label: "Email Address",
          type: "email",
          required: true,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Do I need an SSN to get an EIN?",
      answer: "No! International business owners can obtain an EIN without an SSN or ITIN. We handle the special process required for foreign applicants through IRS Form SS-4.",
    },
    {
      question: "How long does it take to get an EIN?",
      answer: "For US residents with SSN/ITIN, EINs can be obtained immediately online. For international applicants without SSN/ITIN, the IRS typically issues EINs within 4-6 weeks via fax.",
    },
    {
      question: "What if my LLC isn't formed yet?",
      answer: "You need to form your LLC first before applying for an EIN. The LLC must be registered with the state before the IRS will issue an EIN.",
    },
    {
      question: "Can I use my EIN for Amazon Seller account?",
      answer: "Yes, an EIN is required for opening a US business bank account and setting up an Amazon professional seller account.",
    },
    {
      question: "Can I apply for multiple EINs?",
      answer: "Each legal entity can only have one EIN. However, you can apply for EINs for multiple different LLCs or corporations.",
    },
  ],
};

// ============================================
// ITIN APPLICATION
// ============================================
export const itinApplicationForm: ServiceFormConfig = {
  serviceSlug: "itin-application",
  title: "ITIN Application",
  description: "Get your Individual Taxpayer Identification Number for US tax filing",
  steps: [
    {
      id: 1,
      name: "Personal Information",
      description: "Your basic personal details",
      fields: [
        {
          name: "firstName",
          label: "First Name",
          type: "text",
          required: true,
          helpText: "Exactly as shown on your passport",
        },
        {
          name: "middleName",
          label: "Middle Name",
          type: "text",
          required: false,
        },
        {
          name: "lastName",
          label: "Last Name",
          type: "text",
          required: true,
        },
        {
          name: "dateOfBirth",
          label: "Date of Birth",
          type: "date",
          required: true,
        },
        {
          name: "countryOfBirth",
          label: "Country of Birth",
          type: "country",
          required: true,
        },
        {
          name: "countryOfCitizenship",
          label: "Country of Citizenship",
          type: "country",
          required: true,
        },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          required: true,
          options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Address Information",
      description: "Your current address details",
      fields: [
        {
          name: "foreignAddress",
          label: "Foreign Street Address",
          type: "text",
          required: true,
          placeholder: "Your address outside the US",
        },
        {
          name: "foreignCity",
          label: "City",
          type: "text",
          required: true,
        },
        {
          name: "foreignCountry",
          label: "Country",
          type: "country",
          required: true,
        },
        {
          name: "foreignPostalCode",
          label: "Postal Code",
          type: "text",
          required: false,
        },
        {
          name: "hasUSAddress",
          label: "Do you have a US address?",
          type: "checkbox",
          required: false,
        },
        {
          name: "usAddress",
          label: "US Street Address",
          type: "text",
          required: false,
          conditionalOn: { field: "hasUSAddress", value: "true" },
        },
        {
          name: "usCity",
          label: "US City",
          type: "text",
          required: false,
          conditionalOn: { field: "hasUSAddress", value: "true" },
        },
        {
          name: "usState",
          label: "US State",
          type: "state",
          required: false,
          conditionalOn: { field: "hasUSAddress", value: "true" },
        },
        {
          name: "usZip",
          label: "US ZIP Code",
          type: "text",
          required: false,
          conditionalOn: { field: "hasUSAddress", value: "true" },
        },
      ],
    },
    {
      id: 3,
      name: "Passport & Tax Information",
      description: "Identity and tax filing details",
      fields: [
        {
          name: "passportNumber",
          label: "Passport Number",
          type: "text",
          required: true,
        },
        {
          name: "passportIssueDate",
          label: "Passport Issue Date",
          type: "date",
          required: true,
        },
        {
          name: "passportExpirationDate",
          label: "Passport Expiration Date",
          type: "date",
          required: true,
        },
        {
          name: "passportCountry",
          label: "Passport Issuing Country",
          type: "country",
          required: true,
        },
        {
          name: "reasonForApplying",
          label: "Reason for ITIN",
          type: "select",
          required: true,
          options: [
            { value: "tax_return", label: "Filing US tax return" },
            { value: "treaty_benefit", label: "Claiming tax treaty benefits" },
            { value: "withholding", label: "Third-party withholding" },
            { value: "other", label: "Other exception" },
          ],
        },
        {
          name: "taxYear",
          label: "Tax Year",
          type: "select",
          required: true,
          options: [
            { value: "2024", label: "2024" },
            { value: "2023", label: "2023" },
            { value: "2022", label: "2022" },
          ],
        },
        {
          name: "certificationOption",
          label: "Document Certification",
          type: "radio",
          required: true,
          options: [
            {
              value: "caa",
              label: "CAA Service (Recommended)",
              description: "No need to mail original passport",
            },
            {
              value: "standard",
              label: "Standard",
              description: "Mail original passport to IRS",
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: "Document Upload",
      description: "Upload required documents",
      fields: [
        {
          name: "passportCopy",
          label: "Passport Copy",
          type: "file",
          required: true,
          accept: ".pdf,.jpg,.jpeg,.png",
          helpText: "Upload a clear scan of your passport bio page",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What documents do I need for ITIN application?",
      answer: "A valid passport is the primary document as it satisfies both identity and foreign status requirements. Alternatively, you can submit 2 documents from the IRS list (national ID, birth certificate, etc.).",
    },
    {
      question: "Do I need to mail my original passport?",
      answer: "Not if you use our CAA (Certified Acceptance Agent) service. Our CAA can certify your passport copy so you don't have to mail the original to the IRS.",
    },
    {
      question: "How long does ITIN application take?",
      answer: "The IRS typically processes ITIN applications within 7-11 weeks. During peak tax season (January-April), it may take longer.",
    },
    {
      question: "Does ITIN expire?",
      answer: "Yes, ITINs expire if not used on a federal tax return for 3 consecutive years. They also expire based on the middle digits schedule. Expired ITINs must be renewed before filing taxes.",
    },
    {
      question: "Can I use ITIN instead of SSN?",
      answer: "An ITIN is only for federal tax purposes. It cannot be used to work legally in the US or to claim most tax credits like the Earned Income Credit.",
    },
  ],
};

// ============================================
// TRADEMARK REGISTRATION
// ============================================
export const trademarkRegistrationForm: ServiceFormConfig = {
  serviceSlug: "trademark-registration",
  title: "Trademark Registration",
  description: "Protect your brand with USPTO trademark registration",
  steps: [
    {
      id: 1,
      name: "Trademark Details",
      description: "Information about your trademark",
      fields: [
        {
          name: "trademarkType",
          label: "Trademark Type",
          type: "radio",
          required: true,
          options: [
            {
              value: "word_mark",
              label: "Word Mark (Text Only)",
              description: "Protects the words regardless of font or design",
            },
            {
              value: "design_mark",
              label: "Design Mark (Logo)",
              description: "Protects a logo or image with or without text",
            },
          ],
        },
        {
          name: "trademarkText",
          label: "Trademark Text/Name",
          type: "text",
          required: true,
          placeholder: "Your brand name",
          helpText: "Enter exact spelling, capitalization, and punctuation",
        },
        {
          name: "logoUpload",
          label: "Logo Image",
          type: "file",
          required: false,
          accept: ".jpg,.jpeg,.png,.pdf",
          conditionalOn: { field: "trademarkType", value: "design_mark" },
          helpText: "Upload a clear, high-resolution image of your logo",
        },
        {
          name: "colorClaim",
          label: "Does your mark include specific colors?",
          type: "radio",
          required: true,
          options: [
            { value: "no", label: "No - Black & white (broader protection)" },
            { value: "yes", label: "Yes - Claim specific colors" },
          ],
        },
        {
          name: "colors",
          label: "Specify Colors",
          type: "text",
          required: false,
          placeholder: "e.g., Red, Blue, White",
          conditionalOn: { field: "colorClaim", value: "yes" },
        },
      ],
    },
    {
      id: 2,
      name: "Owner Information",
      description: "Who will own this trademark?",
      fields: [
        {
          name: "ownerType",
          label: "Owner Type",
          type: "radio",
          required: true,
          options: [
            { value: "individual", label: "Individual Person" },
            { value: "business", label: "Business Entity (LLC, Corporation)" },
          ],
        },
        {
          name: "ownerName",
          label: "Owner Legal Name",
          type: "text",
          required: true,
          helpText: "For business: exact legal name. For individual: your full name",
        },
        {
          name: "citizenship",
          label: "Citizenship / State of Incorporation",
          type: "text",
          required: true,
          placeholder: "e.g., US Citizen or Delaware LLC",
        },
        {
          name: "ownerAddress",
          label: "Street Address",
          type: "text",
          required: true,
        },
        {
          name: "ownerCity",
          label: "City",
          type: "text",
          required: true,
        },
        {
          name: "ownerCountry",
          label: "Country",
          type: "country",
          required: true,
        },
        {
          name: "ownerPostalCode",
          label: "ZIP/Postal Code",
          type: "text",
          required: true,
        },
        {
          name: "ownerEmail",
          label: "Email",
          type: "email",
          required: true,
          helpText: "USPTO will send correspondence to this email",
        },
        {
          name: "ownerPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
      ],
    },
    {
      id: 3,
      name: "Goods & Services",
      description: "What products/services will use this trademark?",
      fields: [
        {
          name: "trademarkClass",
          label: "Trademark Class",
          type: "select",
          required: true,
          helpText: "Select the primary category for your goods/services",
          options: [
            { value: "9", label: "Class 9 - Electronics, Software, Apps" },
            { value: "25", label: "Class 25 - Clothing, Footwear, Headwear" },
            { value: "35", label: "Class 35 - Advertising, Business Services, Retail" },
            { value: "41", label: "Class 41 - Education, Entertainment, Training" },
            { value: "42", label: "Class 42 - Computer Services, SaaS, Scientific" },
            { value: "3", label: "Class 3 - Cosmetics, Cleaning Products" },
            { value: "5", label: "Class 5 - Pharmaceuticals, Supplements" },
            { value: "14", label: "Class 14 - Jewelry, Watches" },
            { value: "18", label: "Class 18 - Leather Goods, Bags, Luggage" },
            { value: "21", label: "Class 21 - Household Items, Kitchenware" },
            { value: "28", label: "Class 28 - Games, Toys, Sporting Goods" },
            { value: "other", label: "Other - I need help selecting" },
          ],
        },
        {
          name: "goodsServicesDescription",
          label: "Description of Goods/Services",
          type: "textarea",
          required: true,
          placeholder: "Describe the specific products or services...",
          helpText: "Be specific. Example: 'Online retail store services featuring clothing and accessories'",
          validation: { maxLength: 1000 },
        },
      ],
    },
    {
      id: 4,
      name: "Filing Basis",
      description: "Are you already using this trademark?",
      fields: [
        {
          name: "filingBasis",
          label: "Filing Basis",
          type: "radio",
          required: true,
          options: [
            {
              value: "use_in_commerce",
              label: "Use in Commerce (Already Using)",
              description: "I am already using this trademark to sell goods/services",
            },
            {
              value: "intent_to_use",
              label: "Intent to Use (Planning to Use)",
              description: "I plan to use this trademark in the future",
            },
          ],
        },
        {
          name: "dateFirstUsed",
          label: "Date First Used Anywhere",
          type: "date",
          required: false,
          conditionalOn: { field: "filingBasis", value: "use_in_commerce" },
        },
        {
          name: "dateFirstUseCommerce",
          label: "Date First Used in Commerce",
          type: "date",
          required: false,
          conditionalOn: { field: "filingBasis", value: "use_in_commerce" },
          helpText: "When you first sold goods/services with this mark across state lines",
        },
        {
          name: "specimen",
          label: "Specimen of Use",
          type: "file",
          required: false,
          accept: ".jpg,.jpeg,.png,.pdf",
          conditionalOn: { field: "filingBasis", value: "use_in_commerce" },
          helpText: "Upload photo showing your trademark on products, packaging, or website",
        },
        {
          name: "wantTrademarkSearch",
          label: "Would you like a trademark search before filing?",
          type: "checkbox",
          required: false,
          helpText: "Recommended: We'll check for conflicting marks before filing",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How long does trademark registration take?",
      answer: "The USPTO typically takes 8-12 months to process a trademark application. The timeline can vary based on whether the examiner has questions or if anyone opposes your mark.",
    },
    {
      question: "Do I need a trademark for Amazon Brand Registry?",
      answer: "Yes, Amazon Brand Registry requires either a registered trademark or a pending application with a serial number from the USPTO or equivalent office.",
    },
    {
      question: "What's the difference between TM and ® symbol?",
      answer: "You can use TM (trademark) immediately when you start using a mark, even before registration. The ® symbol can only be used after your trademark is officially registered with the USPTO.",
    },
    {
      question: "Can I trademark a name someone else is using?",
      answer: "You cannot register a trademark that is confusingly similar to an existing registered mark in the same class of goods/services. A trademark search helps identify conflicts.",
    },
    {
      question: "What is a trademark specimen?",
      answer: "A specimen shows your trademark actually being used in commerce - for example, a product photo with your brand name, a screenshot of your website, or product packaging.",
    },
  ],
};

// ============================================
// DBA / TRADE NAME
// ============================================
export const dbaFilingForm: ServiceFormConfig = {
  serviceSlug: "dba-filing",
  title: "DBA / Trade Name Registration",
  description: "Register a 'Doing Business As' name for your LLC",
  steps: [
    {
      id: 1,
      name: "Business Information",
      description: "Your existing LLC details",
      fields: [
        {
          name: "llcName",
          label: "Legal Business Name",
          type: "text",
          required: true,
          placeholder: "Your Company LLC",
          helpText: "Your registered LLC name",
        },
        {
          name: "formationState",
          label: "State of Formation",
          type: "state",
          required: true,
        },
        {
          name: "ein",
          label: "EIN (if available)",
          type: "text",
          required: false,
          placeholder: "XX-XXXXXXX",
        },
      ],
    },
    {
      id: 2,
      name: "DBA Details",
      description: "Your desired trade name",
      fields: [
        {
          name: "dbaName",
          label: "Desired DBA Name",
          type: "text",
          required: true,
          placeholder: "My Brand Name",
          helpText: "The alternate name you want to use",
        },
        {
          name: "alternativeDbaName",
          label: "Alternative DBA Name",
          type: "text",
          required: false,
          placeholder: "Backup name if first is unavailable",
        },
        {
          name: "businessPurpose",
          label: "Business Purpose Under DBA",
          type: "textarea",
          required: true,
          placeholder: "Describe what business activities you'll conduct under this name",
          validation: { maxLength: 500 },
        },
        {
          name: "filingState",
          label: "State for DBA Filing",
          type: "state",
          required: true,
        },
      ],
    },
    {
      id: 3,
      name: "Contact Information",
      description: "Primary contact for this filing",
      fields: [
        {
          name: "contactName",
          label: "Contact Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
        {
          name: "contactAddress",
          label: "Address",
          type: "text",
          required: true,
        },
        {
          name: "contactCity",
          label: "City",
          type: "text",
          required: true,
        },
        {
          name: "contactCountry",
          label: "Country",
          type: "country",
          required: true,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What's the difference between DBA and LLC?",
      answer: "An LLC is a legal business entity that provides liability protection. A DBA is simply an alternate name your LLC can operate under - it doesn't create a new legal entity.",
    },
    {
      question: "Can I have multiple DBAs?",
      answer: "Yes, a single LLC can register multiple DBA names to operate different brands or business lines under the same legal entity.",
    },
    {
      question: "Does a DBA protect my name?",
      answer: "DBAs provide limited protection - they mainly prevent others in your county/state from using the same DBA. For stronger protection, consider trademark registration.",
    },
    {
      question: "Do I need a separate EIN for my DBA?",
      answer: "No, your DBA uses the same EIN as your LLC. The DBA is just an alternate name, not a separate legal entity.",
    },
  ],
};

// ============================================
// LLC DISSOLUTION
// ============================================
export const llcDissolutionForm: ServiceFormConfig = {
  serviceSlug: "llc-dissolution",
  title: "LLC Dissolution",
  description: "Properly close your LLC and settle all obligations",
  steps: [
    {
      id: 1,
      name: "LLC Information",
      description: "Details about the LLC being dissolved",
      fields: [
        {
          name: "llcName",
          label: "LLC Legal Name",
          type: "text",
          required: true,
          helpText: "Exact name as registered with the state",
        },
        {
          name: "formationState",
          label: "State of Formation",
          type: "state",
          required: true,
        },
        {
          name: "formationDate",
          label: "Date of Formation",
          type: "date",
          required: true,
        },
        {
          name: "ein",
          label: "EIN",
          type: "text",
          required: true,
          placeholder: "XX-XXXXXXX",
        },
        {
          name: "stateFileNumber",
          label: "State Filing/Entity Number",
          type: "text",
          required: false,
          helpText: "Found on your Articles of Organization",
        },
      ],
    },
    {
      id: 2,
      name: "Dissolution Details",
      description: "Status and reason for dissolution",
      fields: [
        {
          name: "dissolutionReason",
          label: "Reason for Dissolution",
          type: "select",
          required: true,
          options: [
            { value: "ceased_operations", label: "Business ceased operations" },
            { value: "member_decision", label: "Member(s) voted to dissolve" },
            { value: "new_business", label: "Starting a new business entity" },
            { value: "financial", label: "Financial reasons" },
            { value: "personal", label: "Personal reasons" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "effectiveDate",
          label: "Effective Date of Dissolution",
          type: "date",
          required: true,
          helpText: "When should the LLC officially close?",
        },
        {
          name: "allDebtsPaid",
          label: "Have all debts been paid?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, all debts are settled" },
            { value: "no", label: "No, there are outstanding debts" },
            { value: "pending", label: "Currently settling debts" },
          ],
        },
        {
          name: "debtDetails",
          label: "Outstanding Debt Details",
          type: "textarea",
          required: false,
          conditionalOn: { field: "allDebtsPaid", value: ["no", "pending"] },
          placeholder: "Describe the outstanding debts...",
        },
        {
          name: "assetsDistributed",
          label: "Have all assets been distributed?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, all assets distributed to members" },
            { value: "no", label: "No, distribution pending" },
            { value: "none", label: "No assets to distribute" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Tax & Member Status",
      description: "Tax filings and member approval",
      fields: [
        {
          name: "finalTaxReturnFiled",
          label: "Final tax return filed?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, final return filed" },
            { value: "no", label: "No, not yet" },
            { value: "not_required", label: "Not required (no income)" },
          ],
        },
        {
          name: "stateTaxClearance",
          label: "State tax clearance obtained (if required)?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "not_required", label: "Not required in my state" },
            { value: "unknown", label: "I'm not sure" },
          ],
        },
        {
          name: "memberApproval",
          label: "Has dissolution been approved by members?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, members voted to dissolve" },
            { value: "single", label: "Single-member LLC (no vote needed)" },
          ],
        },
        {
          name: "approvalDate",
          label: "Date of Member Vote/Decision",
          type: "date",
          required: true,
        },
      ],
    },
    {
      id: 4,
      name: "Foreign Registrations",
      description: "Other state registrations to cancel",
      fields: [
        {
          name: "hasOtherStateRegistrations",
          label: "Is your LLC registered in other states?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, registered as foreign LLC in other states" },
            { value: "no", label: "No, only registered in formation state" },
          ],
        },
        {
          name: "otherStates",
          label: "List other states where registered",
          type: "textarea",
          required: false,
          conditionalOn: { field: "hasOtherStateRegistrations", value: "yes" },
          placeholder: "e.g., California, Texas, Florida",
        },
        {
          name: "cancelForeignRegistrations",
          label: "Cancel foreign registrations too?",
          type: "checkbox",
          required: false,
          conditionalOn: { field: "hasOtherStateRegistrations", value: "yes" },
          helpText: "Additional fees apply for each state",
        },
      ],
    },
    {
      id: 5,
      name: "Contact Information",
      description: "Authorizing member details",
      fields: [
        {
          name: "authorizerName",
          label: "Name of Authorizing Member/Manager",
          type: "text",
          required: true,
        },
        {
          name: "authorizerTitle",
          label: "Title",
          type: "select",
          required: true,
          options: [
            { value: "member", label: "Member" },
            { value: "manager", label: "Manager" },
            { value: "managing_member", label: "Managing Member" },
          ],
        },
        {
          name: "authorizerEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "authorizerPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Why should I formally dissolve my LLC?",
      answer: "Without formal dissolution, you may continue to owe state fees, annual reports, franchise taxes, and remain liable for business debts even if you're not operating.",
    },
    {
      question: "What happens to unpaid debts?",
      answer: "All debts should ideally be paid or settled before dissolution. Members may be personally liable for outstanding debts if the LLC is dissolved improperly.",
    },
    {
      question: "Do I need to file final tax returns?",
      answer: "Yes, you should file final federal and state tax returns. Mark them as 'Final Return' to close your tax accounts with the IRS and state.",
    },
    {
      question: "How long does dissolution take?",
      answer: "Most states process dissolution within 1-4 weeks. Some states require tax clearance first, which can add time to the process.",
    },
    {
      question: "What about my EIN after dissolution?",
      answer: "Your EIN is permanent and cannot be canceled. However, you should notify the IRS that the business is closed by sending a letter to close the business account.",
    },
  ],
};

// ============================================
// AMAZON SELLER ACCOUNT
// ============================================
export const amazonSellerForm: ServiceFormConfig = {
  serviceSlug: "amazon-seller",
  title: "Amazon Seller Account Setup",
  description: "Professional Amazon seller account setup with full verification support",
  steps: [
    {
      id: 1,
      name: "Business Information",
      description: "Your US business details",
      fields: [
        {
          name: "businessName",
          label: "Business Legal Name",
          type: "text",
          required: true,
          helpText: "Your LLC or corporation name",
        },
        {
          name: "businessType",
          label: "Business Type",
          type: "select",
          required: true,
          options: [
            { value: "llc", label: "LLC" },
            { value: "corporation", label: "Corporation" },
            { value: "partnership", label: "Partnership" },
            { value: "sole_proprietor", label: "Sole Proprietorship" },
          ],
        },
        {
          name: "ein",
          label: "EIN (Tax ID)",
          type: "text",
          required: true,
          placeholder: "XX-XXXXXXX",
        },
        {
          name: "businessAddress",
          label: "Business Address",
          type: "text",
          required: true,
        },
        {
          name: "businessCity",
          label: "City",
          type: "text",
          required: true,
        },
        {
          name: "businessState",
          label: "State",
          type: "state",
          required: true,
        },
        {
          name: "businessZip",
          label: "ZIP Code",
          type: "text",
          required: true,
        },
        {
          name: "businessPhone",
          label: "Business Phone",
          type: "phone",
          required: true,
        },
        {
          name: "businessWebsite",
          label: "Business Website (if any)",
          type: "text",
          required: false,
          placeholder: "https://",
        },
      ],
    },
    {
      id: 2,
      name: "Owner Information",
      description: "Primary account owner details",
      fields: [
        {
          name: "ownerFirstName",
          label: "First Name",
          type: "text",
          required: true,
        },
        {
          name: "ownerLastName",
          label: "Last Name",
          type: "text",
          required: true,
        },
        {
          name: "ownerDob",
          label: "Date of Birth",
          type: "date",
          required: true,
        },
        {
          name: "ownerCitizenship",
          label: "Country of Citizenship",
          type: "country",
          required: true,
        },
        {
          name: "ownerAddress",
          label: "Residential Address",
          type: "text",
          required: true,
        },
        {
          name: "ownerCity",
          label: "City",
          type: "text",
          required: true,
        },
        {
          name: "ownerCountry",
          label: "Country",
          type: "country",
          required: true,
        },
        {
          name: "ownerPhone",
          label: "Phone Number",
          type: "phone",
          required: true,
        },
        {
          name: "ownerEmail",
          label: "Email Address",
          type: "email",
          required: true,
          helpText: "This will be your Amazon Seller Central login email",
        },
      ],
    },
    {
      id: 3,
      name: "Identity Documents",
      description: "Upload required verification documents",
      fields: [
        {
          name: "idType",
          label: "Government ID Type",
          type: "select",
          required: true,
          options: [
            { value: "passport", label: "Passport" },
            { value: "drivers_license", label: "Driver's License" },
            { value: "national_id", label: "National ID Card" },
          ],
        },
        {
          name: "idNumber",
          label: "ID Number",
          type: "text",
          required: true,
        },
        {
          name: "idExpiration",
          label: "ID Expiration Date",
          type: "date",
          required: true,
        },
        {
          name: "idFront",
          label: "ID Front Side",
          type: "file",
          required: true,
          accept: ".jpg,.jpeg,.png,.pdf",
          helpText: "Clear scan or photo showing all information",
        },
        {
          name: "idBack",
          label: "ID Back Side (if applicable)",
          type: "file",
          required: false,
          accept: ".jpg,.jpeg,.png,.pdf",
        },
        {
          name: "proofOfAddress",
          label: "Proof of Address",
          type: "file",
          required: true,
          accept: ".jpg,.jpeg,.png,.pdf",
          helpText: "Utility bill or bank statement dated within 90 days",
        },
      ],
    },
    {
      id: 4,
      name: "Bank Information",
      description: "For receiving Amazon payments",
      fields: [
        {
          name: "bankName",
          label: "Bank Name",
          type: "text",
          required: true,
        },
        {
          name: "accountHolderName",
          label: "Account Holder Name",
          type: "text",
          required: true,
          helpText: "Must match your business name",
        },
        {
          name: "routingNumber",
          label: "Routing Number (ABA)",
          type: "text",
          required: true,
          validation: { pattern: "^[0-9]{9}$" },
        },
        {
          name: "accountNumber",
          label: "Account Number",
          type: "text",
          required: true,
        },
        {
          name: "accountType",
          label: "Account Type",
          type: "select",
          required: true,
          options: [
            { value: "checking", label: "Checking" },
            { value: "savings", label: "Savings" },
          ],
        },
      ],
    },
    {
      id: 5,
      name: "Selling Preferences",
      description: "What will you sell on Amazon?",
      fields: [
        {
          name: "productCategory",
          label: "Primary Product Category",
          type: "select",
          required: true,
          options: [
            { value: "electronics", label: "Electronics" },
            { value: "home_garden", label: "Home & Garden" },
            { value: "clothing", label: "Clothing & Accessories" },
            { value: "beauty", label: "Beauty & Personal Care" },
            { value: "sports", label: "Sports & Outdoors" },
            { value: "toys", label: "Toys & Games" },
            { value: "books", label: "Books & Media" },
            { value: "health", label: "Health & Household" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "hasBrand",
          label: "Do you have your own brand?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, I have my own brand" },
            { value: "no", label: "No, I'll resell other brands" },
            { value: "both", label: "Both - own brand and reselling" },
          ],
        },
        {
          name: "brandName",
          label: "Brand Name",
          type: "text",
          required: false,
          conditionalOn: { field: "hasBrand", value: ["yes", "both"] },
        },
        {
          name: "fulfillmentMethod",
          label: "Preferred Fulfillment Method",
          type: "select",
          required: true,
          options: [
            { value: "fba", label: "FBA (Fulfillment by Amazon)" },
            { value: "fbm", label: "FBM (Merchant Fulfilled)" },
            { value: "both", label: "Both FBA and FBM" },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What documents do I need for Amazon seller verification?",
      answer: "You'll need: government-issued ID (passport, driver's license), proof of address (utility bill or bank statement within 90 days), business documents (EIN, Articles of Organization), and US bank account information.",
    },
    {
      question: "How long does account verification take?",
      answer: "Amazon typically verifies accounts within 1-3 business days. However, it can take up to a few weeks if additional documentation is required.",
    },
    {
      question: "What if my verification is rejected?",
      answer: "We assist with the appeal process. Common rejection reasons include blurry documents, mismatched information, or missing details - we help ensure everything is correct before submission.",
    },
    {
      question: "Do I need a US bank account?",
      answer: "A US bank account is recommended for the smoothest experience. However, Amazon also accepts international bank accounts through services like Payoneer and Wise (TransferWise).",
    },
    {
      question: "What's included in the setup service?",
      answer: "We handle account registration, document preparation, tax interview (W-8BEN/W-9), Seller Central setup, and provide guidance on getting your first products listed.",
    },
  ],
};

// ============================================
// REGISTERED AGENT
// ============================================
export const registeredAgentForm: ServiceFormConfig = {
  serviceSlug: "registered-agent",
  title: "Registered Agent Service",
  description: "Comply with state requirements with reliable registered agent service",
  steps: [
    {
      id: 1,
      name: "LLC Information",
      description: "Your LLC details",
      fields: [
        {
          name: "llcName",
          label: "LLC Legal Name",
          type: "text",
          required: true,
        },
        {
          name: "formationState",
          label: "State of Formation",
          type: "state",
          required: true,
        },
        {
          name: "formationDate",
          label: "Date of Formation",
          type: "date",
          required: true,
        },
        {
          name: "hasCurrentAgent",
          label: "Do you have a current registered agent?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, I'm changing agents" },
            { value: "no", label: "No, this is a new LLC" },
          ],
        },
        {
          name: "currentAgentName",
          label: "Current Registered Agent Name",
          type: "text",
          required: false,
          conditionalOn: { field: "hasCurrentAgent", value: "yes" },
        },
      ],
    },
    {
      id: 2,
      name: "Service Details",
      description: "Service preferences",
      fields: [
        {
          name: "serviceStartDate",
          label: "Service Start Date",
          type: "date",
          required: true,
        },
        {
          name: "additionalStates",
          label: "Need registered agent in additional states?",
          type: "checkbox",
          required: false,
        },
        {
          name: "additionalStatesList",
          label: "Select additional states",
          type: "textarea",
          required: false,
          conditionalOn: { field: "additionalStates", value: "true" },
          placeholder: "List states separated by commas",
        },
      ],
    },
    {
      id: 3,
      name: "Contact Information",
      description: "How we'll reach you",
      fields: [
        {
          name: "contactName",
          label: "Primary Contact Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
          helpText: "We'll send document notifications here",
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
        {
          name: "alternateEmail",
          label: "Alternate Email",
          type: "email",
          required: false,
        },
        {
          name: "forwardMail",
          label: "Forward physical mail?",
          type: "radio",
          required: true,
          options: [
            { value: "scan", label: "Scan and email (included)" },
            { value: "forward", label: "Forward physical copies (+shipping)" },
          ],
        },
        {
          name: "forwardAddress",
          label: "Mail Forwarding Address",
          type: "text",
          required: false,
          conditionalOn: { field: "forwardMail", value: "forward" },
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Why do I need a registered agent?",
      answer: "Every LLC is required by law to have a registered agent in every state where it's registered. The agent receives legal notices, tax documents, and official state correspondence on behalf of your business.",
    },
    {
      question: "Can I be my own registered agent?",
      answer: "Yes, but you must have a physical address (not PO Box) in the state and be available during normal business hours. Most business owners prefer a professional service for privacy and convenience.",
    },
    {
      question: "What documents will my registered agent receive?",
      answer: "Service of process (lawsuit notices), state correspondence, annual report reminders, tax notices, and any official government mail addressed to your LLC.",
    },
    {
      question: "What happens if I don't have a registered agent?",
      answer: "Your LLC can lose good standing with the state, face penalties, and potentially be administratively dissolved. You could also miss important legal notices.",
    },
  ],
};

// ============================================
// AMAZON BRAND REGISTRY
// ============================================
export const brandRegistryForm: ServiceFormConfig = {
  serviceSlug: "brand-registry",
  title: "Amazon Brand Registry",
  description: "Protect your brand on Amazon with Brand Registry enrollment",
  steps: [
    {
      id: 1,
      name: "Trademark Information",
      description: "Your registered trademark details",
      fields: [
        {
          name: "trademarkText",
          label: "Trademark Name/Text",
          type: "text",
          required: true,
          helpText: "Exactly as it appears on your trademark registration",
        },
        {
          name: "trademarkType",
          label: "Trademark Type",
          type: "radio",
          required: true,
          options: [
            { value: "word_mark", label: "Word Mark (text only)" },
            { value: "design_mark", label: "Design Mark (logo with words)" },
          ],
        },
        {
          name: "trademarkOffice",
          label: "Trademark Office",
          type: "select",
          required: true,
          options: [
            { value: "USPTO", label: "USPTO (United States)" },
            { value: "EUIPO", label: "EUIPO (European Union)" },
            { value: "UKIPO", label: "UKIPO (United Kingdom)" },
            { value: "CIPO", label: "CIPO (Canada)" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "registrationNumber",
          label: "Registration/Serial Number",
          type: "text",
          required: true,
          helpText: "Your trademark registration or application number",
        },
        {
          name: "registrationStatus",
          label: "Registration Status",
          type: "radio",
          required: true,
          options: [
            { value: "registered", label: "Registered (issued)" },
            { value: "pending", label: "Pending (application filed)" },
          ],
        },
        {
          name: "trademarkCertificate",
          label: "Trademark Certificate",
          type: "file",
          required: true,
          accept: ".pdf,.jpg,.jpeg,.png",
          helpText: "Upload your trademark registration certificate",
        },
      ],
    },
    {
      id: 2,
      name: "Brand Information",
      description: "Details about your brand",
      fields: [
        {
          name: "brandName",
          label: "Brand Name",
          type: "text",
          required: true,
          helpText: "Must match your trademark exactly",
        },
        {
          name: "logoImage",
          label: "Brand Logo",
          type: "file",
          required: false,
          accept: ".jpg,.jpeg,.png",
          conditionalOn: { field: "trademarkType", value: "design_mark" },
        },
        {
          name: "productCategories",
          label: "Product Categories",
          type: "textarea",
          required: true,
          placeholder: "e.g., Electronics, Home & Kitchen, Sports",
          helpText: "Categories where your products are listed",
        },
        {
          name: "manufacturingCountries",
          label: "Manufacturing Countries",
          type: "textarea",
          required: true,
          placeholder: "e.g., China, USA, Vietnam",
        },
        {
          name: "sellingCountries",
          label: "Countries Where Sold",
          type: "textarea",
          required: true,
          placeholder: "e.g., USA, Canada, UK",
        },
      ],
    },
    {
      id: 3,
      name: "Product Images",
      description: "Images showing your brand on products",
      fields: [
        {
          name: "productImage1",
          label: "Product Image with Brand Visible",
          type: "file",
          required: true,
          accept: ".jpg,.jpeg,.png",
          helpText: "Clear photo showing your brand name on the product",
        },
        {
          name: "productImage2",
          label: "Packaging Image with Brand",
          type: "file",
          required: true,
          accept: ".jpg,.jpeg,.png",
          helpText: "Photo of product packaging showing brand",
        },
      ],
    },
    {
      id: 4,
      name: "Amazon Account",
      description: "Your Amazon seller details",
      fields: [
        {
          name: "amazonSellerId",
          label: "Amazon Seller ID",
          type: "text",
          required: true,
          helpText: "Found in Seller Central under Account Info",
        },
        {
          name: "amazonStoreUrl",
          label: "Amazon Store URL (if applicable)",
          type: "text",
          required: false,
        },
        {
          name: "contactName",
          label: "Contact Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Contact Email",
          type: "email",
          required: true,
          helpText: "Should match your trademark correspondence email",
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Do I need a registered trademark for Brand Registry?",
      answer: "Yes, you need either a registered trademark or a pending application with a serial number from USPTO or equivalent international trademark offices.",
    },
    {
      question: "How long does Brand Registry enrollment take?",
      answer: "Typically about 10 business days once all documents are submitted. Amazon will send a verification code to your trademark correspondent email.",
    },
    {
      question: "What if I don't have a trademark yet?",
      answer: "You can use Amazon IP Accelerator to get trademark filing and potentially faster Brand Registry access, or we can help you file for a trademark first.",
    },
    {
      question: "What are the benefits of Brand Registry?",
      answer: "Access to A+ Content, Sponsored Brands ads, brand protection tools, Amazon Stores, and ability to report counterfeiters and listing hijackers.",
    },
  ],
};

// ============================================
// CATEGORY UNGATING
// ============================================
export const categoryUngatingForm: ServiceFormConfig = {
  serviceSlug: "category-ungating",
  title: "Amazon Category Ungating",
  description: "Get approved to sell in restricted Amazon categories",
  steps: [
    {
      id: 1,
      name: "Amazon Account",
      description: "Your seller account information",
      fields: [
        {
          name: "amazonSellerId",
          label: "Amazon Seller ID",
          type: "text",
          required: true,
        },
        {
          name: "sellerPlan",
          label: "Seller Plan",
          type: "radio",
          required: true,
          options: [
            { value: "professional", label: "Professional ($39.99/mo)" },
            { value: "individual", label: "Individual (per-item fees)" },
          ],
        },
        {
          name: "accountAge",
          label: "Account Age",
          type: "select",
          required: true,
          options: [
            { value: "new", label: "Less than 3 months" },
            { value: "3-6", label: "3-6 months" },
            { value: "6-12", label: "6-12 months" },
            { value: "12+", label: "Over 1 year" },
          ],
        },
        {
          name: "currentSalesVolume",
          label: "Monthly Sales Volume",
          type: "select",
          required: true,
          options: [
            { value: "0", label: "No sales yet" },
            { value: "1-1000", label: "$1 - $1,000" },
            { value: "1000-5000", label: "$1,000 - $5,000" },
            { value: "5000-10000", label: "$5,000 - $10,000" },
            { value: "10000+", label: "$10,000+" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Category Request",
      description: "Categories you want to unlock",
      fields: [
        {
          name: "categories",
          label: "Categories to Ungate",
          type: "select",
          required: true,
          options: [
            { value: "grocery", label: "Grocery & Gourmet Food" },
            { value: "health", label: "Health & Personal Care" },
            { value: "beauty", label: "Beauty" },
            { value: "baby", label: "Baby" },
            { value: "toys", label: "Toys & Games (Seasonal)" },
            { value: "automotive", label: "Automotive" },
            { value: "watches", label: "Watches" },
            { value: "jewelry", label: "Fine Jewelry" },
            { value: "sports_collectibles", label: "Sports Collectibles" },
            { value: "music", label: "Music" },
            { value: "other", label: "Other - Specify Below" },
          ],
        },
        {
          name: "additionalCategories",
          label: "Additional Categories",
          type: "textarea",
          required: false,
          placeholder: "List any other categories or specific brands",
        },
        {
          name: "specificAsins",
          label: "Specific ASINs (if brand ungating)",
          type: "textarea",
          required: false,
          placeholder: "List ASINs separated by commas",
        },
      ],
    },
    {
      id: 3,
      name: "Invoice Information",
      description: "Your wholesale supplier details",
      fields: [
        {
          name: "hasInvoices",
          label: "Do you have wholesale invoices?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, I have invoices ready" },
            { value: "need_help", label: "No, I need help sourcing products" },
          ],
        },
        {
          name: "supplierName",
          label: "Supplier/Distributor Name",
          type: "text",
          required: false,
          conditionalOn: { field: "hasInvoices", value: "yes" },
        },
        {
          name: "supplierContact",
          label: "Supplier Contact Info",
          type: "text",
          required: false,
          conditionalOn: { field: "hasInvoices", value: "yes" },
        },
        {
          name: "invoiceUpload",
          label: "Upload Invoice (PDF)",
          type: "file",
          required: false,
          accept: ".pdf",
          conditionalOn: { field: "hasInvoices", value: "yes" },
          helpText: "Must show 10+ units, dated within 180 days",
        },
        {
          name: "invoiceDate",
          label: "Invoice Date",
          type: "date",
          required: false,
          conditionalOn: { field: "hasInvoices", value: "yes" },
        },
        {
          name: "unitsOnInvoice",
          label: "Number of Units on Invoice",
          type: "number",
          required: false,
          conditionalOn: { field: "hasInvoices", value: "yes" },
        },
      ],
    },
    {
      id: 4,
      name: "Product Compliance",
      description: "Required compliance documents",
      fields: [
        {
          name: "hasComplianceDocs",
          label: "Do you have compliance documents?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "not_sure", label: "Not sure what's needed" },
          ],
        },
        {
          name: "complianceDocType",
          label: "Compliance Document Type",
          type: "select",
          required: false,
          conditionalOn: { field: "hasComplianceDocs", value: "yes" },
          options: [
            { value: "fda", label: "FDA Registration" },
            { value: "gmp", label: "GMP Certificate" },
            { value: "coa", label: "Certificate of Analysis (COA)" },
            { value: "cpsc", label: "CPSC Test Report" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "complianceDocUpload",
          label: "Upload Compliance Document",
          type: "file",
          required: false,
          accept: ".pdf,.jpg,.jpeg,.png",
          conditionalOn: { field: "hasComplianceDocs", value: "yes" },
        },
        {
          name: "productPhotos",
          label: "Product Photos",
          type: "file",
          required: false,
          accept: ".jpg,.jpeg,.png",
          helpText: "Clear photos showing product and packaging with barcode",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What categories are restricted on Amazon?",
      answer: "Common gated categories include Grocery, Health & Personal Care, Beauty, Baby, Toys (seasonal), Automotive, Watches, and Fine Jewelry. Some brands within open categories also require approval.",
    },
    {
      question: "What invoices are accepted?",
      answer: "Amazon requires invoices from authorized distributors or manufacturers (not retail stores). Invoices must show at least 10 units, be dated within 90-180 days, and be in PDF format.",
    },
    {
      question: "How long does ungating take?",
      answer: "Simple categories can be approved in 24-48 hours. More restricted categories may take 1-2 weeks. We resubmit if initially rejected.",
    },
    {
      question: "What if my application is rejected?",
      answer: "We analyze the rejection reason and resubmit with improved documentation. Amazon uses different reviewers, so multiple attempts often succeed.",
    },
  ],
};

// ============================================
// ANNUAL COMPLIANCE
// ============================================
export const annualComplianceForm: ServiceFormConfig = {
  serviceSlug: "compliance",
  title: "Annual Compliance Service",
  description: "Stay compliant with annual reports and state filings",
  steps: [
    {
      id: 1,
      name: "LLC Information",
      description: "Your business details",
      fields: [
        {
          name: "llcName",
          label: "LLC Legal Name",
          type: "text",
          required: true,
        },
        {
          name: "formationState",
          label: "State of Formation",
          type: "state",
          required: true,
        },
        {
          name: "formationDate",
          label: "Date of Formation",
          type: "date",
          required: true,
        },
        {
          name: "ein",
          label: "EIN",
          type: "text",
          required: true,
        },
        {
          name: "stateFileNumber",
          label: "State Entity Number",
          type: "text",
          required: false,
        },
      ],
    },
    {
      id: 2,
      name: "Current Information",
      description: "Verify and update your details",
      fields: [
        {
          name: "principalAddress",
          label: "Principal Business Address",
          type: "text",
          required: true,
        },
        {
          name: "principalCity",
          label: "City",
          type: "text",
          required: true,
        },
        {
          name: "principalState",
          label: "State",
          type: "state",
          required: true,
        },
        {
          name: "principalZip",
          label: "ZIP Code",
          type: "text",
          required: true,
        },
        {
          name: "registeredAgentName",
          label: "Current Registered Agent",
          type: "text",
          required: true,
        },
        {
          name: "infoChanged",
          label: "Has any information changed since last filing?",
          type: "radio",
          required: true,
          options: [
            { value: "no", label: "No changes" },
            { value: "yes", label: "Yes, information has changed" },
          ],
        },
        {
          name: "changedInfo",
          label: "What has changed?",
          type: "textarea",
          required: false,
          conditionalOn: { field: "infoChanged", value: "yes" },
          placeholder: "Describe the changes (address, members, etc.)",
        },
      ],
    },
    {
      id: 3,
      name: "Member Information",
      description: "Current members/managers",
      fields: [
        {
          name: "managementType",
          label: "Management Type",
          type: "radio",
          required: true,
          options: [
            { value: "member", label: "Member-Managed" },
            { value: "manager", label: "Manager-Managed" },
          ],
        },
        {
          name: "memberNames",
          label: "Member/Manager Names",
          type: "textarea",
          required: true,
          placeholder: "List all members or managers, one per line",
        },
      ],
    },
    {
      id: 4,
      name: "Contact Information",
      description: "Primary contact for filings",
      fields: [
        {
          name: "contactName",
          label: "Contact Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "When is my annual report due?",
      answer: "Due dates vary by state. Some states use your formation anniversary date, others have a fixed date (like May 1 or January 1). We track this for you and file on time.",
    },
    {
      question: "What if I miss the deadline?",
      answer: "Late fees apply and your LLC can lose good standing status. Continued non-compliance can lead to administrative dissolution. We help prevent this with reminders.",
    },
    {
      question: "Do all states require annual reports?",
      answer: "Most do, but some states like Arizona, New Mexico, and Ohio don't require annual reports for LLCs. Some states require biennial (every 2 years) reports.",
    },
    {
      question: "What information is reported?",
      answer: "Typically your LLC's principal address, registered agent, and names of members/managers. Some states require additional information like revenue ranges.",
    },
  ],
};

// ============================================
// BOOKKEEPING SERVICE
// ============================================
export const bookkeepingForm: ServiceFormConfig = {
  serviceSlug: "bookkeeping",
  title: "Bookkeeping Service",
  description: "Professional monthly bookkeeping for your business",
  steps: [
    {
      id: 1,
      name: "Business Information",
      description: "Your business details",
      fields: [
        {
          name: "businessName",
          label: "Business Name",
          type: "text",
          required: true,
        },
        {
          name: "businessType",
          label: "Business Type",
          type: "select",
          required: true,
          options: [
            { value: "llc", label: "LLC" },
            { value: "corporation", label: "Corporation" },
            { value: "s-corp", label: "S-Corporation" },
            { value: "sole_prop", label: "Sole Proprietorship" },
          ],
        },
        {
          name: "industry",
          label: "Industry",
          type: "select",
          required: true,
          options: [
            { value: "ecommerce", label: "E-commerce / Amazon" },
            { value: "consulting", label: "Consulting / Services" },
            { value: "saas", label: "Software / SaaS" },
            { value: "retail", label: "Retail" },
            { value: "manufacturing", label: "Manufacturing" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "formationState",
          label: "State of Formation",
          type: "state",
          required: true,
        },
        {
          name: "ein",
          label: "EIN",
          type: "text",
          required: true,
        },
        {
          name: "fiscalYearEnd",
          label: "Fiscal Year End",
          type: "select",
          required: true,
          options: [
            { value: "december", label: "December 31 (Calendar Year)" },
            { value: "march", label: "March 31" },
            { value: "june", label: "June 30" },
            { value: "september", label: "September 30" },
            { value: "other", label: "Other" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Current Setup",
      description: "Your existing accounting setup",
      fields: [
        {
          name: "accountingSoftware",
          label: "Current Accounting Software",
          type: "select",
          required: true,
          options: [
            { value: "quickbooks", label: "QuickBooks Online" },
            { value: "xero", label: "Xero" },
            { value: "wave", label: "Wave" },
            { value: "freshbooks", label: "FreshBooks" },
            { value: "none", label: "None / Spreadsheets" },
          ],
        },
        {
          name: "bankAccounts",
          label: "Number of Bank Accounts",
          type: "select",
          required: true,
          options: [
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3-5", label: "3-5" },
            { value: "5+", label: "More than 5" },
          ],
        },
        {
          name: "creditCards",
          label: "Number of Credit Cards",
          type: "select",
          required: true,
          options: [
            { value: "0", label: "0" },
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3+", label: "3 or more" },
          ],
        },
        {
          name: "paymentProcessors",
          label: "Payment Processors Used",
          type: "textarea",
          required: false,
          placeholder: "e.g., Stripe, PayPal, Amazon Pay, etc.",
        },
        {
          name: "monthlyTransactions",
          label: "Estimated Monthly Transactions",
          type: "select",
          required: true,
          options: [
            { value: "0-50", label: "0-50 transactions" },
            { value: "51-100", label: "51-100 transactions" },
            { value: "101-200", label: "101-200 transactions" },
            { value: "200+", label: "200+ transactions" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Services Needed",
      description: "Select the services you need",
      fields: [
        {
          name: "services",
          label: "Services Needed",
          type: "textarea",
          required: true,
          helpText: "Check all that apply: Monthly bookkeeping, Bank reconciliation, Financial statements, Expense categorization, Invoice management, Payroll support",
        },
        {
          name: "catchUpBookkeeping",
          label: "Need catch-up bookkeeping?",
          type: "radio",
          required: true,
          options: [
            { value: "no", label: "No, books are current" },
            { value: "yes", label: "Yes, need to catch up" },
          ],
        },
        {
          name: "catchUpMonths",
          label: "How many months behind?",
          type: "select",
          required: false,
          conditionalOn: { field: "catchUpBookkeeping", value: "yes" },
          options: [
            { value: "1-3", label: "1-3 months" },
            { value: "4-6", label: "4-6 months" },
            { value: "7-12", label: "7-12 months" },
            { value: "12+", label: "More than 12 months" },
          ],
        },
      ],
    },
    {
      id: 4,
      name: "Contact Information",
      description: "Your contact details",
      fields: [
        {
          name: "contactName",
          label: "Primary Contact",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
        {
          name: "preferredCommunication",
          label: "Preferred Communication",
          type: "select",
          required: true,
          options: [
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
            { value: "video", label: "Video Call" },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What accounting software do you support?",
      answer: "We primarily work with QuickBooks Online, Xero, and Wave. We can recommend the best option for your business size and needs.",
    },
    {
      question: "When will I receive my monthly reports?",
      answer: "Financial statements are delivered by the 15th of the following month. You'll receive Profit & Loss and Balance Sheet reports.",
    },
    {
      question: "Can you help with tax preparation?",
      answer: "We prepare your books to be tax-ready. Your CPA or our tax filing service can then use our organized records for tax returns.",
    },
    {
      question: "What if I have back bookkeeping to catch up on?",
      answer: "We offer catch-up bookkeeping services at an additional one-time fee based on the number of months and complexity.",
    },
  ],
};

// ============================================
// TAX FILING SERVICE
// ============================================
export const taxFilingForm: ServiceFormConfig = {
  serviceSlug: "tax-filing",
  title: "Tax Filing Service",
  description: "US business tax preparation and filing for your LLC",
  steps: [
    {
      id: 1,
      name: "Business Information",
      description: "Your business tax details",
      fields: [
        {
          name: "businessName",
          label: "Business Legal Name",
          type: "text",
          required: true,
        },
        {
          name: "businessType",
          label: "Business Type",
          type: "select",
          required: true,
          options: [
            { value: "single_llc", label: "Single-Member LLC" },
            { value: "multi_llc", label: "Multi-Member LLC (Partnership)" },
            { value: "s_corp", label: "S-Corporation" },
            { value: "c_corp", label: "C-Corporation" },
          ],
        },
        {
          name: "formationState",
          label: "State of Formation",
          type: "state",
          required: true,
        },
        {
          name: "ein",
          label: "EIN",
          type: "text",
          required: true,
        },
        {
          name: "taxYear",
          label: "Tax Year",
          type: "select",
          required: true,
          options: [
            { value: "2024", label: "2024" },
            { value: "2023", label: "2023" },
            { value: "2022", label: "2022" },
          ],
        },
        {
          name: "numberOfMembers",
          label: "Number of Members/Owners",
          type: "number",
          required: true,
          validation: { min: 1 },
        },
      ],
    },
    {
      id: 2,
      name: "Financial Information",
      description: "Your business income and expenses",
      fields: [
        {
          name: "hasFinancialStatements",
          label: "Do you have prepared financial statements?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, books are up to date" },
            { value: "no", label: "No, need bookkeeping first" },
          ],
        },
        {
          name: "totalRevenue",
          label: "Total Revenue (approximate)",
          type: "select",
          required: true,
          options: [
            { value: "0", label: "$0 (No revenue)" },
            { value: "1-10000", label: "$1 - $10,000" },
            { value: "10001-50000", label: "$10,001 - $50,000" },
            { value: "50001-100000", label: "$50,001 - $100,000" },
            { value: "100001-500000", label: "$100,001 - $500,000" },
            { value: "500001+", label: "$500,001+" },
          ],
        },
        {
          name: "totalExpenses",
          label: "Total Expenses (approximate)",
          type: "select",
          required: true,
          options: [
            { value: "0", label: "$0" },
            { value: "1-10000", label: "$1 - $10,000" },
            { value: "10001-50000", label: "$10,001 - $50,000" },
            { value: "50001-100000", label: "$50,001 - $100,000" },
            { value: "100001+", label: "$100,001+" },
          ],
        },
        {
          name: "hadEmployees",
          label: "Did you have employees (W-2)?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          name: "issued1099s",
          label: "Did you issue 1099s to contractors?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Owner Information",
      description: "Information about each owner",
      fields: [
        {
          name: "owner1Name",
          label: "Owner 1 - Full Name",
          type: "text",
          required: true,
        },
        {
          name: "owner1SSNorITIN",
          label: "Owner 1 - SSN or ITIN",
          type: "text",
          required: true,
          helpText: "Required for K-1 preparation",
        },
        {
          name: "owner1Ownership",
          label: "Owner 1 - Ownership %",
          type: "number",
          required: true,
          validation: { min: 1, max: 100 },
        },
        {
          name: "owner1Address",
          label: "Owner 1 - Address",
          type: "text",
          required: true,
        },
        {
          name: "hasMultipleOwners",
          label: "Are there additional owners?",
          type: "checkbox",
          required: false,
        },
        {
          name: "additionalOwners",
          label: "Additional Owner Details",
          type: "textarea",
          required: false,
          conditionalOn: { field: "hasMultipleOwners", value: "true" },
          placeholder: "Name, SSN/ITIN, Ownership %, Address for each additional owner",
        },
      ],
    },
    {
      id: 4,
      name: "State Filings",
      description: "States where you operate",
      fields: [
        {
          name: "operatingStates",
          label: "States where business operates",
          type: "textarea",
          required: true,
          placeholder: "List all states where you have business activity",
        },
        {
          name: "salesTaxStates",
          label: "States where you collect sales tax",
          type: "textarea",
          required: false,
          placeholder: "List states if applicable",
        },
        {
          name: "foreignBankAccounts",
          label: "Do you have foreign bank accounts?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
          helpText: "May require FBAR filing if over $10,000",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "When is the tax filing deadline?",
      answer: "Partnership returns (Form 1065) are due March 15. S-Corp returns (Form 1120-S) are due March 15. Single-member LLC (Schedule C) follows personal return deadline of April 15. We can file extensions if needed.",
    },
    {
      question: "What if I need an extension?",
      answer: "We can file Form 7004 for an automatic 6-month extension. Note that this extends the return deadline, not the tax payment deadline.",
    },
    {
      question: "Do you file state returns?",
      answer: "Yes, state returns are included in our Standard and Complete packages. Additional states beyond the first are available for an additional fee.",
    },
    {
      question: "Do I need to file US taxes as a foreign LLC owner?",
      answer: "It depends on your situation. Single-member LLCs owned by non-residents with no US income may not have a filing requirement, but informational returns may still be needed. We'll assess your specific situation.",
    },
  ],
};

// ============================================
// VIRTUAL US ADDRESS
// ============================================
export const virtualAddressForm: ServiceFormConfig = {
  serviceSlug: "virtual-address",
  title: "Virtual US Address",
  description: "Get a real US business address for mail and business presence",
  steps: [
    {
      id: 1,
      name: "Business Information",
      description: "Your business details",
      fields: [
        {
          name: "businessName",
          label: "Business Name",
          type: "text",
          required: true,
        },
        {
          name: "businessType",
          label: "Business Type",
          type: "select",
          required: true,
          options: [
            { value: "llc", label: "LLC" },
            { value: "corporation", label: "Corporation" },
            { value: "individual", label: "Individual / Pre-formation" },
          ],
        },
        {
          name: "ein",
          label: "EIN (if available)",
          type: "text",
          required: false,
        },
      ],
    },
    {
      id: 2,
      name: "Service Preferences",
      description: "Choose your address and services",
      fields: [
        {
          name: "preferredLocation",
          label: "Preferred Address Location",
          type: "select",
          required: true,
          options: [
            { value: "wyoming", label: "Wyoming" },
            { value: "delaware", label: "Delaware" },
            { value: "florida", label: "Florida" },
            { value: "texas", label: "Texas" },
            { value: "california", label: "California" },
            { value: "new_york", label: "New York" },
            { value: "no_preference", label: "No preference" },
          ],
        },
        {
          name: "useForFilings",
          label: "Use for business filings?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, use as business address" },
            { value: "no", label: "No, just for mail" },
          ],
        },
        {
          name: "plan",
          label: "Service Plan",
          type: "radio",
          required: true,
          options: [
            {
              value: "basic",
              label: "Basic - Mail Scanning Only",
              description: "30 scans/month included",
            },
            {
              value: "premium",
              label: "Premium - Mail + Packages",
              description: "Unlimited scans + package forwarding",
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Mail Handling",
      description: "How should we handle your mail?",
      fields: [
        {
          name: "mailHandling",
          label: "Default Mail Handling",
          type: "radio",
          required: true,
          options: [
            { value: "scan_all", label: "Scan all mail" },
            { value: "scan_decide", label: "Scan envelope, I'll decide" },
            { value: "hold", label: "Hold for pickup/forwarding" },
          ],
        },
        {
          name: "forwardingAddress",
          label: "Mail Forwarding Address",
          type: "text",
          required: false,
          helpText: "Where to forward physical mail (if needed)",
        },
        {
          name: "forwardingCity",
          label: "City",
          type: "text",
          required: false,
        },
        {
          name: "forwardingCountry",
          label: "Country",
          type: "country",
          required: false,
        },
        {
          name: "forwardingPostalCode",
          label: "Postal Code",
          type: "text",
          required: false,
        },
      ],
    },
    {
      id: 4,
      name: "Contact Information",
      description: "Your contact details",
      fields: [
        {
          name: "contactName",
          label: "Contact Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
          helpText: "We'll send mail notifications here",
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Can I use this address as my LLC's business address?",
      answer: "Yes, our addresses can be used for business filings in most cases. However, it cannot be used as a registered agent address - that requires a separate service.",
    },
    {
      question: "How does mail scanning work?",
      answer: "When mail arrives, we scan the envelope and notify you via email. You can then request the contents to be scanned, forwarded, or shredded through your online dashboard.",
    },
    {
      question: "Can I receive packages?",
      answer: "Yes, with our Premium plan you can receive packages. We'll notify you when they arrive and can forward them to your international address.",
    },
    {
      question: "Is there a setup fee?",
      answer: "No setup fee. Your first month is included in the package price, and service renews monthly or annually.",
    },
  ],
};

// ============================================
// OPERATING AGREEMENT
// ============================================
export const operatingAgreementForm: ServiceFormConfig = {
  serviceSlug: "operating-agreement",
  title: "Operating Agreement",
  description: "Get a customized Operating Agreement for your LLC",
  steps: [
    {
      id: 1,
      name: "LLC Information",
      description: "Basic information about your LLC",
      fields: [
        {
          name: "llcName",
          label: "LLC Legal Name",
          type: "text",
          required: true,
          helpText: "Exact name as registered with the state",
        },
        {
          name: "formationState",
          label: "State of Formation",
          type: "state",
          required: true,
        },
        {
          name: "formationDate",
          label: "Date of Formation",
          type: "date",
          required: true,
        },
        {
          name: "principalAddress",
          label: "Principal Place of Business",
          type: "text",
          required: true,
        },
        {
          name: "principalCity",
          label: "City",
          type: "text",
          required: true,
        },
        {
          name: "principalState",
          label: "State",
          type: "state",
          required: true,
        },
        {
          name: "principalZip",
          label: "ZIP Code",
          type: "text",
          required: true,
        },
        {
          name: "businessPurpose",
          label: "Business Purpose",
          type: "textarea",
          required: true,
          placeholder: "Describe your LLC's business activities",
        },
      ],
    },
    {
      id: 2,
      name: "Management Structure",
      description: "How will your LLC be managed?",
      fields: [
        {
          name: "managementType",
          label: "Management Type",
          type: "radio",
          required: true,
          options: [
            {
              value: "member",
              label: "Member-Managed",
              description: "All members participate in daily operations",
            },
            {
              value: "manager",
              label: "Manager-Managed",
              description: "Designated managers run daily operations",
            },
          ],
        },
        {
          name: "votingRights",
          label: "Voting Rights",
          type: "radio",
          required: true,
          options: [
            { value: "ownership", label: "Based on ownership percentage" },
            { value: "equal", label: "Equal voting (one member, one vote)" },
            { value: "custom", label: "Custom voting structure" },
          ],
        },
        {
          name: "customVotingDetails",
          label: "Custom Voting Details",
          type: "textarea",
          required: false,
          conditionalOn: { field: "votingRights", value: "custom" },
          placeholder: "Describe the custom voting structure",
        },
      ],
    },
    {
      id: 3,
      name: "Member Information",
      description: "Details about LLC members",
      fields: [
        {
          name: "numberOfMembers",
          label: "Number of Members",
          type: "select",
          required: true,
          options: [
            { value: "1", label: "1 (Single-Member LLC)" },
            { value: "2", label: "2 Members" },
            { value: "3", label: "3 Members" },
            { value: "4", label: "4 Members" },
            { value: "5+", label: "5 or more Members" },
          ],
        },
        {
          name: "member1Name",
          label: "Member 1 - Full Name",
          type: "text",
          required: true,
        },
        {
          name: "member1Ownership",
          label: "Member 1 - Ownership %",
          type: "number",
          required: true,
          validation: { min: 1, max: 100 },
        },
        {
          name: "member1Address",
          label: "Member 1 - Address",
          type: "text",
          required: true,
        },
        {
          name: "additionalMembers",
          label: "Additional Members Details",
          type: "textarea",
          required: false,
          conditionalOn: { field: "numberOfMembers", value: ["2", "3", "4", "5+"] },
          placeholder: "Name, ownership %, and address for each additional member (one per line)",
        },
      ],
    },
    {
      id: 4,
      name: "Financial Terms",
      description: "Profit distribution and capital",
      fields: [
        {
          name: "profitDistribution",
          label: "Profit/Loss Distribution",
          type: "radio",
          required: true,
          options: [
            { value: "ownership", label: "Based on ownership percentage" },
            { value: "equal", label: "Equally among members" },
            { value: "custom", label: "Custom allocation" },
          ],
        },
        {
          name: "distributionFrequency",
          label: "Distribution Frequency",
          type: "select",
          required: true,
          options: [
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
            { value: "annual", label: "Annually" },
            { value: "discretion", label: "At manager/member discretion" },
          ],
        },
        {
          name: "initialCapital",
          label: "Initial Capital Contributions",
          type: "textarea",
          required: false,
          placeholder: "List each member's initial contribution (e.g., John Doe: $10,000)",
        },
        {
          name: "additionalContributions",
          label: "Additional Contributions Required?",
          type: "radio",
          required: true,
          options: [
            { value: "none", label: "No additional contributions required" },
            { value: "unanimous", label: "Only if unanimously approved" },
            { value: "majority", label: "If approved by majority vote" },
          ],
        },
      ],
    },
    {
      id: 5,
      name: "Transfer & Dissolution",
      description: "Rules for membership changes",
      fields: [
        {
          name: "transferRestrictions",
          label: "Membership Transfer Restrictions",
          type: "radio",
          required: true,
          options: [
            { value: "consent", label: "Requires unanimous member consent" },
            { value: "majority", label: "Requires majority consent" },
            { value: "rofr", label: "Right of first refusal to existing members" },
            { value: "free", label: "Freely transferable" },
          ],
        },
        {
          name: "dissolutionEvents",
          label: "Events Triggering Dissolution",
          type: "textarea",
          required: false,
          placeholder: "e.g., Unanimous vote, bankruptcy, death of member",
        },
        {
          name: "buyoutProvisions",
          label: "Include Buy-Sell Provisions?",
          type: "checkbox",
          required: false,
          helpText: "Provisions for buying out a departing member",
        },
      ],
    },
    {
      id: 6,
      name: "Contact Information",
      description: "Your contact details",
      fields: [
        {
          name: "contactName",
          label: "Primary Contact Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Is an Operating Agreement legally required?",
      answer: "It depends on the state. Some states like California, New York, and Delaware require LLCs to have an Operating Agreement. Even when not required, most banks need to see one to open a business account.",
    },
    {
      question: "Can I use the same Operating Agreement for a single-member and multi-member LLC?",
      answer: "No, single-member and multi-member LLCs need different Operating Agreements. We customize the document based on your specific structure.",
    },
    {
      question: "Can I modify my Operating Agreement later?",
      answer: "Yes, Operating Agreements can be amended. Most agreements include provisions for how amendments should be approved (usually by majority or unanimous vote).",
    },
    {
      question: "Does my Operating Agreement need to be notarized?",
      answer: "No, Operating Agreements typically don't need to be notarized. Members simply need to sign the document. However, some banks may request additional verification.",
    },
  ],
};

// ============================================
// AMENDMENT FILING
// ============================================
export const amendmentFilingForm: ServiceFormConfig = {
  serviceSlug: "amendment-filing",
  title: "Amendment Filing",
  description: "Update your LLC information with the state",
  steps: [
    {
      id: 1,
      name: "LLC Information",
      description: "Current LLC details",
      fields: [
        {
          name: "llcName",
          label: "Current LLC Legal Name",
          type: "text",
          required: true,
        },
        {
          name: "formationState",
          label: "State of Formation",
          type: "state",
          required: true,
        },
        {
          name: "stateFileNumber",
          label: "State Entity/File Number",
          type: "text",
          required: true,
          helpText: "Found on your Articles of Organization",
        },
        {
          name: "formationDate",
          label: "Date of Formation",
          type: "date",
          required: true,
        },
        {
          name: "ein",
          label: "EIN",
          type: "text",
          required: false,
        },
      ],
    },
    {
      id: 2,
      name: "Amendment Type",
      description: "What needs to be changed?",
      fields: [
        {
          name: "amendmentType",
          label: "Type of Amendment",
          type: "select",
          required: true,
          options: [
            { value: "name_change", label: "Business Name Change" },
            { value: "address_change", label: "Principal Address Change" },
            { value: "agent_change", label: "Registered Agent Change" },
            { value: "member_change", label: "Member/Manager Change" },
            { value: "purpose_change", label: "Business Purpose Change" },
            { value: "multiple", label: "Multiple Changes" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Name Change",
      description: "New business name details",
      fields: [
        {
          name: "newLlcName",
          label: "New LLC Name",
          type: "text",
          required: true,
          conditionalOn: { field: "amendmentType", value: ["name_change", "multiple"] },
        },
        {
          name: "alternativeName",
          label: "Alternative Name (if first is unavailable)",
          type: "text",
          required: false,
          conditionalOn: { field: "amendmentType", value: ["name_change", "multiple"] },
        },
      ],
    },
    {
      id: 4,
      name: "Address Change",
      description: "New address details",
      fields: [
        {
          name: "newAddress",
          label: "New Street Address",
          type: "text",
          required: true,
          conditionalOn: { field: "amendmentType", value: ["address_change", "multiple"] },
        },
        {
          name: "newCity",
          label: "City",
          type: "text",
          required: true,
          conditionalOn: { field: "amendmentType", value: ["address_change", "multiple"] },
        },
        {
          name: "newState",
          label: "State",
          type: "state",
          required: true,
          conditionalOn: { field: "amendmentType", value: ["address_change", "multiple"] },
        },
        {
          name: "newZip",
          label: "ZIP Code",
          type: "text",
          required: true,
          conditionalOn: { field: "amendmentType", value: ["address_change", "multiple"] },
        },
      ],
    },
    {
      id: 5,
      name: "Registered Agent Change",
      description: "New registered agent details",
      fields: [
        {
          name: "newAgentName",
          label: "New Registered Agent Name",
          type: "text",
          required: true,
          conditionalOn: { field: "amendmentType", value: ["agent_change", "multiple"] },
        },
        {
          name: "agentAddress",
          label: "Agent Address",
          type: "text",
          required: true,
          conditionalOn: { field: "amendmentType", value: ["agent_change", "multiple"] },
        },
        {
          name: "agentCity",
          label: "City",
          type: "text",
          required: true,
          conditionalOn: { field: "amendmentType", value: ["agent_change", "multiple"] },
        },
        {
          name: "agentState",
          label: "State",
          type: "state",
          required: true,
          conditionalOn: { field: "amendmentType", value: ["agent_change", "multiple"] },
        },
        {
          name: "agentZip",
          label: "ZIP Code",
          type: "text",
          required: true,
          conditionalOn: { field: "amendmentType", value: ["agent_change", "multiple"] },
        },
      ],
    },
    {
      id: 6,
      name: "Member/Manager Change",
      description: "Changes to members or managers",
      fields: [
        {
          name: "memberChangeType",
          label: "Type of Change",
          type: "select",
          required: true,
          conditionalOn: { field: "amendmentType", value: ["member_change", "multiple"] },
          options: [
            { value: "add", label: "Adding a member/manager" },
            { value: "remove", label: "Removing a member/manager" },
            { value: "replace", label: "Replacing a member/manager" },
          ],
        },
        {
          name: "memberDetails",
          label: "Member/Manager Details",
          type: "textarea",
          required: true,
          conditionalOn: { field: "amendmentType", value: ["member_change", "multiple"] },
          placeholder: "Provide names and addresses for changes",
        },
      ],
    },
    {
      id: 7,
      name: "Other Changes",
      description: "Any other amendment details",
      fields: [
        {
          name: "otherChanges",
          label: "Describe Other Changes",
          type: "textarea",
          required: false,
          placeholder: "Describe any other changes needed",
        },
        {
          name: "effectiveDate",
          label: "Effective Date of Amendment",
          type: "date",
          required: true,
          helpText: "When should the changes take effect?",
        },
      ],
    },
    {
      id: 8,
      name: "Contact Information",
      description: "Your contact details",
      fields: [
        {
          name: "contactName",
          label: "Contact Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "When do I need to file an amendment?",
      answer: "You need to file an amendment whenever there's a change to the information in your original Articles of Organization, such as business name, principal address, registered agent, or management structure.",
    },
    {
      question: "How long does an amendment take to process?",
      answer: "Processing times vary by state, typically 3-10 business days. Expedited processing is available in most states for an additional fee.",
    },
    {
      question: "Do I need to update my Operating Agreement too?",
      answer: "Yes, if your Operating Agreement contains the information being changed, you should update it as well to maintain consistency between your documents.",
    },
    {
      question: "Will my EIN change if I change my LLC name?",
      answer: "No, your EIN stays the same. However, you'll need to notify the IRS of the name change using IRS Form 8822-B.",
    },
  ],
};

// ============================================
// CERTIFICATE OF GOOD STANDING
// ============================================
export const certificateGoodStandingForm: ServiceFormConfig = {
  serviceSlug: "certificate-good-standing",
  title: "Certificate of Good Standing",
  description: "Get official proof that your LLC is in compliance",
  steps: [
    {
      id: 1,
      name: "LLC Information",
      description: "Your business details",
      fields: [
        {
          name: "llcName",
          label: "LLC Legal Name",
          type: "text",
          required: true,
          helpText: "Exact name as registered with the state",
        },
        {
          name: "formationState",
          label: "State of Formation",
          type: "state",
          required: true,
        },
        {
          name: "stateFileNumber",
          label: "State Entity Number",
          type: "text",
          required: false,
          helpText: "Found on your Articles of Organization",
        },
        {
          name: "formationDate",
          label: "Date of Formation",
          type: "date",
          required: false,
        },
      ],
    },
    {
      id: 2,
      name: "Certificate Options",
      description: "Choose your certificate type",
      fields: [
        {
          name: "certificateType",
          label: "Certificate Type",
          type: "radio",
          required: true,
          options: [
            { value: "standard", label: "Standard Certificate" },
            { value: "certified", label: "Certified Copy" },
          ],
        },
        {
          name: "needApostille",
          label: "Do you need an Apostille?",
          type: "radio",
          required: true,
          options: [
            { value: "no", label: "No, just the certificate" },
            { value: "yes", label: "Yes, add Apostille service" },
          ],
        },
        {
          name: "apostilleCountry",
          label: "Country where certificate will be used",
          type: "country",
          required: false,
          conditionalOn: { field: "needApostille", value: "yes" },
        },
        {
          name: "purpose",
          label: "Purpose of Certificate",
          type: "select",
          required: true,
          options: [
            { value: "banking", label: "Bank Account Opening" },
            { value: "foreign_registration", label: "Foreign State Registration" },
            { value: "contract", label: "Contract/Agreement" },
            { value: "loan", label: "Business Loan Application" },
            { value: "international", label: "International Use" },
            { value: "other", label: "Other" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Delivery Options",
      description: "How should we deliver your certificate?",
      fields: [
        {
          name: "deliveryMethod",
          label: "Delivery Method",
          type: "radio",
          required: true,
          options: [
            { value: "digital", label: "Digital Copy (Email)" },
            { value: "mail_us", label: "Physical Mail - US Address" },
            { value: "mail_international", label: "Physical Mail - International" },
          ],
        },
        {
          name: "shippingAddress",
          label: "Shipping Address",
          type: "text",
          required: false,
          conditionalOn: { field: "deliveryMethod", value: ["mail_us", "mail_international"] },
        },
        {
          name: "shippingCity",
          label: "City",
          type: "text",
          required: false,
          conditionalOn: { field: "deliveryMethod", value: ["mail_us", "mail_international"] },
        },
        {
          name: "shippingCountry",
          label: "Country",
          type: "country",
          required: false,
          conditionalOn: { field: "deliveryMethod", value: ["mail_us", "mail_international"] },
        },
        {
          name: "shippingPostalCode",
          label: "Postal Code",
          type: "text",
          required: false,
          conditionalOn: { field: "deliveryMethod", value: ["mail_us", "mail_international"] },
        },
      ],
    },
    {
      id: 4,
      name: "Contact Information",
      description: "Your contact details",
      fields: [
        {
          name: "contactName",
          label: "Contact Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is a Certificate of Good Standing?",
      answer: "A Certificate of Good Standing (also called Certificate of Existence or Status Certificate) is an official state document confirming your LLC is properly registered, has paid all fees, and is authorized to conduct business.",
    },
    {
      question: "How long is the certificate valid?",
      answer: "Most banks and institutions accept certificates dated within the last 30-90 days. For critical transactions, request a fresh certificate close to when you need it.",
    },
    {
      question: "What if my LLC is not in good standing?",
      answer: "If your LLC has fallen out of good standing due to missed filings or fees, we can help you reinstate it first before obtaining the certificate.",
    },
    {
      question: "Do I need an Apostille?",
      answer: "An Apostille is needed if you're using the certificate in a country that's part of the Hague Apostille Convention. For non-Hague countries, embassy legalization may be required instead.",
    },
  ],
};

// ============================================
// MULTI-STATE REGISTRATION
// ============================================
export const multiStateRegistrationForm: ServiceFormConfig = {
  serviceSlug: "multi-state-registration",
  title: "Multi-State Registration",
  description: "Register your LLC to do business in additional states",
  steps: [
    {
      id: 1,
      name: "Existing LLC Information",
      description: "Your current LLC details",
      fields: [
        {
          name: "llcName",
          label: "LLC Legal Name",
          type: "text",
          required: true,
        },
        {
          name: "homeState",
          label: "Home State (State of Formation)",
          type: "state",
          required: true,
        },
        {
          name: "formationDate",
          label: "Date of Formation",
          type: "date",
          required: true,
        },
        {
          name: "ein",
          label: "EIN",
          type: "text",
          required: true,
        },
        {
          name: "principalAddress",
          label: "Principal Business Address",
          type: "text",
          required: true,
        },
        {
          name: "principalCity",
          label: "City",
          type: "text",
          required: true,
        },
        {
          name: "principalState",
          label: "State",
          type: "state",
          required: true,
        },
        {
          name: "principalZip",
          label: "ZIP Code",
          type: "text",
          required: true,
        },
      ],
    },
    {
      id: 2,
      name: "New State Registration",
      description: "Where do you want to register?",
      fields: [
        {
          name: "newState",
          label: "State for Foreign Registration",
          type: "state",
          required: true,
        },
        {
          name: "additionalStates",
          label: "Additional States (if any)",
          type: "textarea",
          required: false,
          placeholder: "List any other states where you need to register",
        },
        {
          name: "registrationReason",
          label: "Reason for Registration",
          type: "select",
          required: true,
          options: [
            { value: "physical_presence", label: "Physical presence (office, warehouse)" },
            { value: "employees", label: "Hiring employees in the state" },
            { value: "sales", label: "Significant sales in the state" },
            { value: "contracts", label: "State requires it for contracts" },
            { value: "licenses", label: "Need state-specific licenses" },
            { value: "other", label: "Other" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Registered Agent",
      description: "You need a registered agent in each new state",
      fields: [
        {
          name: "needRegisteredAgent",
          label: "Do you need registered agent service?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, include registered agent service" },
            { value: "no", label: "No, I have my own registered agent" },
          ],
        },
        {
          name: "ownAgentName",
          label: "Registered Agent Name",
          type: "text",
          required: false,
          conditionalOn: { field: "needRegisteredAgent", value: "no" },
        },
        {
          name: "ownAgentAddress",
          label: "Registered Agent Address",
          type: "text",
          required: false,
          conditionalOn: { field: "needRegisteredAgent", value: "no" },
        },
      ],
    },
    {
      id: 4,
      name: "Contact Information",
      description: "Your contact details",
      fields: [
        {
          name: "contactName",
          label: "Contact Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "When do I need foreign qualification?",
      answer: "Generally, you need to register in another state if you have a physical presence, employees, bank accounts, or conduct significant business activity there. Online sales alone usually don't trigger this requirement.",
    },
    {
      question: "What is a Certificate of Authority?",
      answer: "A Certificate of Authority (also called Certificate of Foreign Registration) is what you receive when you register your LLC as a foreign entity in a new state.",
    },
    {
      question: "Do I need a registered agent in each state?",
      answer: "Yes, you must have a registered agent with a physical address in every state where your LLC is registered, including your home state and any foreign registration states.",
    },
    {
      question: "What happens if I do business without registering?",
      answer: "Operating without proper registration can result in penalties, inability to enforce contracts in state courts, and back taxes. It's important to register before conducting business.",
    },
  ],
};

// ============================================
// APOSTILLE SERVICE
// ============================================
export const apostilleServiceForm: ServiceFormConfig = {
  serviceSlug: "apostille-service",
  title: "Apostille Service",
  description: "Get your US documents certified for international use",
  steps: [
    {
      id: 1,
      name: "Document Information",
      description: "What document needs an Apostille?",
      fields: [
        {
          name: "documentType",
          label: "Document Type",
          type: "select",
          required: true,
          options: [
            { value: "articles_of_organization", label: "Articles of Organization" },
            { value: "certificate_good_standing", label: "Certificate of Good Standing" },
            { value: "operating_agreement", label: "Operating Agreement" },
            { value: "ein_letter", label: "EIN Confirmation Letter" },
            { value: "certificate_formation", label: "Certificate of Formation" },
            { value: "resolution", label: "Corporate Resolution" },
            { value: "other", label: "Other Document" },
          ],
        },
        {
          name: "otherDocumentDescription",
          label: "Document Description",
          type: "text",
          required: false,
          conditionalOn: { field: "documentType", value: "other" },
        },
        {
          name: "documentState",
          label: "State that Issued the Document",
          type: "state",
          required: true,
        },
        {
          name: "numberOfCopies",
          label: "Number of Apostilled Copies Needed",
          type: "select",
          required: true,
          options: [
            { value: "1", label: "1 Copy" },
            { value: "2", label: "2 Copies" },
            { value: "3", label: "3 Copies" },
            { value: "4+", label: "4 or More Copies" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Document Upload",
      description: "Upload a copy of the document",
      fields: [
        {
          name: "haveDocument",
          label: "Do you have the document?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, I have the original" },
            { value: "need_copy", label: "No, I need you to obtain a certified copy" },
          ],
        },
        {
          name: "documentUpload",
          label: "Upload Document",
          type: "file",
          required: false,
          accept: ".pdf,.jpg,.jpeg,.png",
          conditionalOn: { field: "haveDocument", value: "yes" },
          helpText: "Upload a scan of the document for review",
        },
        {
          name: "llcName",
          label: "LLC Name",
          type: "text",
          required: false,
          conditionalOn: { field: "haveDocument", value: "need_copy" },
        },
        {
          name: "stateFileNumber",
          label: "State File Number",
          type: "text",
          required: false,
          conditionalOn: { field: "haveDocument", value: "need_copy" },
        },
      ],
    },
    {
      id: 3,
      name: "Destination Country",
      description: "Where will the document be used?",
      fields: [
        {
          name: "destinationCountry",
          label: "Destination Country",
          type: "country",
          required: true,
        },
        {
          name: "purpose",
          label: "Purpose of Apostille",
          type: "select",
          required: true,
          options: [
            { value: "bank", label: "Opening Bank Account" },
            { value: "business_registration", label: "Business Registration" },
            { value: "legal_proceeding", label: "Legal Proceeding" },
            { value: "government", label: "Government Application" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "urgency",
          label: "Urgency Level",
          type: "radio",
          required: true,
          options: [
            { value: "standard", label: "Standard (7-10 business days)" },
            { value: "expedited", label: "Expedited (3-5 business days)" },
            { value: "rush", label: "Rush (1-2 business days)" },
          ],
        },
      ],
    },
    {
      id: 4,
      name: "Shipping Information",
      description: "Where should we send the apostilled documents?",
      fields: [
        {
          name: "recipientName",
          label: "Recipient Name",
          type: "text",
          required: true,
        },
        {
          name: "shippingAddress",
          label: "Street Address",
          type: "text",
          required: true,
        },
        {
          name: "shippingCity",
          label: "City",
          type: "text",
          required: true,
        },
        {
          name: "shippingCountry",
          label: "Country",
          type: "country",
          required: true,
        },
        {
          name: "shippingPostalCode",
          label: "Postal Code",
          type: "text",
          required: true,
        },
        {
          name: "shippingPhone",
          label: "Recipient Phone",
          type: "phone",
          required: true,
          helpText: "Required for international courier delivery",
        },
      ],
    },
    {
      id: 5,
      name: "Contact Information",
      description: "Your contact details",
      fields: [
        {
          name: "contactName",
          label: "Your Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is an Apostille?",
      answer: "An Apostille is a form of authentication issued by a country's Secretary of State for documents that will be used in another country that's part of the Hague Apostille Convention.",
    },
    {
      question: "Which countries accept Apostilles?",
      answer: "Over 120 countries accept Apostilles, including most of Europe, Australia, Japan, and many others. Countries NOT in the Hague Convention require embassy legalization instead.",
    },
    {
      question: "Do I need an original document?",
      answer: "For state-issued documents like Articles of Organization, we can obtain certified copies. For private documents like Operating Agreements, you may need to send the original for notarization first.",
    },
    {
      question: "How long does the Apostille process take?",
      answer: "Standard processing takes 7-10 business days. Expedited (3-5 days) and rush (1-2 days) options are available in most states for an additional fee.",
    },
  ],
};

// ============================================
// RESELLER CERTIFICATE
// ============================================
export const resellerCertificateForm: ServiceFormConfig = {
  serviceSlug: "reseller-certificate",
  title: "Reseller Certificate",
  description: "Get your sales tax exemption certificate for wholesale purchases",
  steps: [
    {
      id: 1,
      name: "Business Information",
      description: "Your business details",
      fields: [
        {
          name: "businessName",
          label: "Business Legal Name",
          type: "text",
          required: true,
        },
        {
          name: "businessType",
          label: "Business Type",
          type: "select",
          required: true,
          options: [
            { value: "llc", label: "LLC" },
            { value: "corporation", label: "Corporation" },
            { value: "sole_prop", label: "Sole Proprietorship" },
          ],
        },
        {
          name: "formationState",
          label: "State of Formation",
          type: "state",
          required: true,
        },
        {
          name: "ein",
          label: "EIN",
          type: "text",
          required: true,
        },
        {
          name: "businessAddress",
          label: "Business Address",
          type: "text",
          required: true,
        },
        {
          name: "businessCity",
          label: "City",
          type: "text",
          required: true,
        },
        {
          name: "businessState",
          label: "State",
          type: "state",
          required: true,
        },
        {
          name: "businessZip",
          label: "ZIP Code",
          type: "text",
          required: true,
        },
      ],
    },
    {
      id: 2,
      name: "Certificate Details",
      description: "Where do you need the certificate?",
      fields: [
        {
          name: "certificateState",
          label: "State for Reseller Certificate",
          type: "state",
          required: true,
        },
        {
          name: "additionalStates",
          label: "Additional States",
          type: "textarea",
          required: false,
          placeholder: "List any additional states where you need certificates",
        },
        {
          name: "productTypes",
          label: "Types of Products You'll Resell",
          type: "textarea",
          required: true,
          placeholder: "e.g., Electronics, Clothing, Home goods",
        },
        {
          name: "salesChannel",
          label: "Primary Sales Channel",
          type: "select",
          required: true,
          options: [
            { value: "amazon", label: "Amazon FBA" },
            { value: "ebay", label: "eBay" },
            { value: "shopify", label: "Shopify/Online Store" },
            { value: "wholesale", label: "Wholesale/B2B" },
            { value: "retail", label: "Physical Retail Store" },
            { value: "multiple", label: "Multiple Channels" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Existing Permits",
      description: "Do you have any existing sales tax permits?",
      fields: [
        {
          name: "hasExistingPermit",
          label: "Do you already have a sales tax permit in any state?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          name: "existingPermitState",
          label: "State with Existing Permit",
          type: "state",
          required: false,
          conditionalOn: { field: "hasExistingPermit", value: "yes" },
        },
        {
          name: "existingPermitNumber",
          label: "Existing Permit Number",
          type: "text",
          required: false,
          conditionalOn: { field: "hasExistingPermit", value: "yes" },
        },
      ],
    },
    {
      id: 4,
      name: "Contact Information",
      description: "Your contact details",
      fields: [
        {
          name: "contactName",
          label: "Contact Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is a Reseller Certificate?",
      answer: "A Reseller Certificate (also called Sales Tax Exemption Certificate) allows you to purchase products for resale without paying sales tax, since you'll collect sales tax from the end customer.",
    },
    {
      question: "Do I need a certificate for each state?",
      answer: "You need a reseller certificate in each state where you purchase inventory from suppliers. Requirements and forms vary by state.",
    },
    {
      question: "Is this the same as a sales tax permit?",
      answer: "They're related but different. A sales tax permit authorizes you to collect sales tax. A reseller certificate exempts you from paying tax on wholesale purchases.",
    },
    {
      question: "Will this help me buy from Alibaba or overseas suppliers?",
      answer: "International purchases typically aren't subject to US sales tax anyway. The reseller certificate is primarily used for US domestic wholesale purchases.",
    },
  ],
};

// ============================================
// PRODUCT LISTING OPTIMIZATION
// ============================================
export const productListingForm: ServiceFormConfig = {
  serviceSlug: "product-listing-optimization",
  title: "Product Listing Optimization",
  description: "Optimize your Amazon listings for maximum visibility and sales",
  steps: [
    {
      id: 1,
      name: "Amazon Account",
      description: "Your seller account info",
      fields: [
        {
          name: "amazonSellerId",
          label: "Amazon Seller ID",
          type: "text",
          required: true,
        },
        {
          name: "marketplace",
          label: "Primary Marketplace",
          type: "select",
          required: true,
          options: [
            { value: "us", label: "Amazon.com (USA)" },
            { value: "uk", label: "Amazon.co.uk (UK)" },
            { value: "de", label: "Amazon.de (Germany)" },
            { value: "ca", label: "Amazon.ca (Canada)" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "hasBrandRegistry",
          label: "Are you enrolled in Brand Registry?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Product Information",
      description: "Details about the products to optimize",
      fields: [
        {
          name: "numberOfListings",
          label: "Number of Listings to Optimize",
          type: "select",
          required: true,
          options: [
            { value: "1", label: "1 Listing" },
            { value: "3", label: "3 Listings" },
            { value: "5", label: "5 Listings" },
            { value: "10", label: "10 Listings" },
            { value: "custom", label: "More than 10" },
          ],
        },
        {
          name: "asin1",
          label: "ASIN or Product URL #1",
          type: "text",
          required: true,
          placeholder: "B0XXXXXXXXX or full Amazon URL",
        },
        {
          name: "additionalAsins",
          label: "Additional ASINs",
          type: "textarea",
          required: false,
          conditionalOn: { field: "numberOfListings", value: ["3", "5", "10", "custom"] },
          placeholder: "One ASIN per line",
        },
        {
          name: "productCategory",
          label: "Product Category",
          type: "select",
          required: true,
          options: [
            { value: "electronics", label: "Electronics" },
            { value: "home", label: "Home & Kitchen" },
            { value: "beauty", label: "Beauty & Personal Care" },
            { value: "health", label: "Health & Household" },
            { value: "sports", label: "Sports & Outdoors" },
            { value: "toys", label: "Toys & Games" },
            { value: "clothing", label: "Clothing & Accessories" },
            { value: "other", label: "Other" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Optimization Goals",
      description: "What do you want to achieve?",
      fields: [
        {
          name: "optimizationGoals",
          label: "Primary Goals (Select all that apply)",
          type: "textarea",
          required: true,
          helpText: "e.g., Improve search ranking, Increase conversions, Better main keyword targeting",
        },
        {
          name: "targetKeywords",
          label: "Target Keywords (if known)",
          type: "textarea",
          required: false,
          placeholder: "List your main keywords, one per line",
        },
        {
          name: "competitors",
          label: "Main Competitor ASINs (if known)",
          type: "textarea",
          required: false,
          placeholder: "List competitor ASINs to analyze",
        },
        {
          name: "currentIssues",
          label: "Current Issues or Concerns",
          type: "textarea",
          required: false,
          placeholder: "What problems are you experiencing with your listings?",
        },
      ],
    },
    {
      id: 4,
      name: "Contact Information",
      description: "Your contact details",
      fields: [
        {
          name: "contactName",
          label: "Contact Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: false,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What's included in listing optimization?",
      answer: "We optimize your title, bullet points, description, backend search terms, and provide image recommendations. We conduct keyword research and competitor analysis to maximize visibility.",
    },
    {
      question: "How long does optimization take?",
      answer: "Single listings are typically completed within 3-5 business days. Larger packages may take 1-2 weeks depending on complexity.",
    },
    {
      question: "Will this guarantee more sales?",
      answer: "Optimization improves your listing's visibility and conversion potential, but sales depend on many factors including price, reviews, competition, and product-market fit.",
    },
    {
      question: "Can you optimize listings I don't own?",
      answer: "We can only optimize listings where you have editing rights as the brand owner or authorized seller in Seller Central.",
    },
  ],
};

// ============================================
// A+ CONTENT CREATION
// ============================================
export const aPlusContentForm: ServiceFormConfig = {
  serviceSlug: "a-plus-content",
  title: "A+ Content Creation",
  description: "Create stunning A+ Content (EBC) to boost conversions",
  steps: [
    {
      id: 1,
      name: "Amazon Account",
      description: "Your seller account info",
      fields: [
        {
          name: "amazonSellerId",
          label: "Amazon Seller ID",
          type: "text",
          required: true,
        },
        {
          name: "brandName",
          label: "Brand Name",
          type: "text",
          required: true,
          helpText: "As registered in Brand Registry",
        },
        {
          name: "hasBrandRegistry",
          label: "Confirm Brand Registry enrollment",
          type: "checkbox",
          required: true,
          helpText: "A+ Content requires Brand Registry enrollment",
        },
      ],
    },
    {
      id: 2,
      name: "Product Information",
      description: "Products for A+ Content",
      fields: [
        {
          name: "numberOfProducts",
          label: "Number of Products",
          type: "select",
          required: true,
          options: [
            { value: "1", label: "1 Product" },
            { value: "3", label: "3 Products" },
            { value: "5", label: "5 Products" },
            { value: "10+", label: "10+ Products" },
          ],
        },
        {
          name: "asin1",
          label: "Primary ASIN",
          type: "text",
          required: true,
          placeholder: "B0XXXXXXXXX",
        },
        {
          name: "additionalAsins",
          label: "Additional ASINs",
          type: "textarea",
          required: false,
          conditionalOn: { field: "numberOfProducts", value: ["3", "5", "10+"] },
          placeholder: "One ASIN per line",
        },
        {
          name: "productDescription",
          label: "Brief Product Description",
          type: "textarea",
          required: true,
          placeholder: "Describe your product's key features and benefits",
        },
      ],
    },
    {
      id: 3,
      name: "Design Preferences",
      description: "How should your A+ Content look?",
      fields: [
        {
          name: "contentType",
          label: "Content Type",
          type: "radio",
          required: true,
          options: [
            { value: "basic", label: "Basic A+ (Standard modules)" },
            { value: "premium", label: "Premium A+ (Video, interactive)" },
          ],
        },
        {
          name: "designStyle",
          label: "Design Style",
          type: "select",
          required: true,
          options: [
            { value: "modern", label: "Modern & Clean" },
            { value: "luxury", label: "Luxury & Premium" },
            { value: "playful", label: "Playful & Fun" },
            { value: "professional", label: "Professional & Corporate" },
            { value: "natural", label: "Natural & Organic" },
          ],
        },
        {
          name: "brandColors",
          label: "Brand Colors (Hex codes if known)",
          type: "text",
          required: false,
          placeholder: "#FF5733, #333333",
        },
        {
          name: "includeBrandStory",
          label: "Include Brand Story Module?",
          type: "checkbox",
          required: false,
          helpText: "Tells your brand's story across all products",
        },
        {
          name: "includeComparison",
          label: "Include Comparison Chart?",
          type: "checkbox",
          required: false,
          helpText: "Compare features across your product line",
        },
      ],
    },
    {
      id: 4,
      name: "Assets",
      description: "Upload existing brand assets",
      fields: [
        {
          name: "hasAssets",
          label: "Do you have existing product images/graphics?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, I'll provide assets" },
            { value: "partial", label: "Some, but need additional graphics" },
            { value: "no", label: "No, I need everything created" },
          ],
        },
        {
          name: "logoUpload",
          label: "Brand Logo",
          type: "file",
          required: false,
          accept: ".jpg,.jpeg,.png,.svg,.ai,.pdf",
          helpText: "High-resolution logo file",
        },
        {
          name: "productImages",
          label: "Product Images",
          type: "file",
          required: false,
          accept: ".jpg,.jpeg,.png,.zip",
          helpText: "Upload product images or a ZIP file",
        },
        {
          name: "referenceLinks",
          label: "Reference A+ Content (ASINs you like)",
          type: "textarea",
          required: false,
          placeholder: "List ASINs with A+ Content styles you like",
        },
      ],
    },
    {
      id: 5,
      name: "Contact Information",
      description: "Your contact details",
      fields: [
        {
          name: "contactName",
          label: "Contact Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: false,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is A+ Content?",
      answer: "A+ Content (formerly Enhanced Brand Content) lets brand-registered sellers add rich images, comparison charts, and formatted text to product descriptions, increasing conversion rates by up to 10%.",
    },
    {
      question: "What's the difference between Basic and Premium A+?",
      answer: "Basic A+ includes standard modules like images and text. Premium A+ (available to eligible brands) adds video, interactive hotspots, and carousel modules.",
    },
    {
      question: "How long does A+ Content creation take?",
      answer: "Standard projects take 5-7 business days. Rush delivery (2-3 days) is available for an additional fee.",
    },
    {
      question: "Do I need to provide product photos?",
      answer: "High-quality product images help create better A+ Content. If you don't have professional photos, we can work with what's available or recommend photography services.",
    },
  ],
};

// ============================================
// PPC CAMPAIGN SETUP
// ============================================
export const ppcCampaignForm: ServiceFormConfig = {
  serviceSlug: "ppc-campaign-setup",
  title: "PPC Campaign Setup",
  description: "Launch profitable Amazon advertising campaigns",
  steps: [
    {
      id: 1,
      name: "Amazon Account",
      description: "Your seller account info",
      fields: [
        {
          name: "amazonSellerId",
          label: "Amazon Seller ID",
          type: "text",
          required: true,
        },
        {
          name: "marketplace",
          label: "Primary Marketplace",
          type: "select",
          required: true,
          options: [
            { value: "us", label: "Amazon.com (USA)" },
            { value: "uk", label: "Amazon.co.uk (UK)" },
            { value: "de", label: "Amazon.de (Germany)" },
            { value: "ca", label: "Amazon.ca (Canada)" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "hasBrandRegistry",
          label: "Are you enrolled in Brand Registry?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
          helpText: "Sponsored Brands and some features require Brand Registry",
        },
        {
          name: "existingCampaigns",
          label: "Do you have existing PPC campaigns?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, I want to optimize/expand" },
            { value: "no", label: "No, starting fresh" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Products to Advertise",
      description: "Which products should we advertise?",
      fields: [
        {
          name: "numberOfProducts",
          label: "Number of Products",
          type: "select",
          required: true,
          options: [
            { value: "1-3", label: "1-3 Products" },
            { value: "4-10", label: "4-10 Products" },
            { value: "11-20", label: "11-20 Products" },
            { value: "20+", label: "More than 20" },
          ],
        },
        {
          name: "productAsins",
          label: "Product ASINs",
          type: "textarea",
          required: true,
          placeholder: "List ASINs to advertise, one per line",
        },
        {
          name: "productCategory",
          label: "Product Category",
          type: "select",
          required: true,
          options: [
            { value: "electronics", label: "Electronics" },
            { value: "home", label: "Home & Kitchen" },
            { value: "beauty", label: "Beauty & Personal Care" },
            { value: "health", label: "Health & Household" },
            { value: "sports", label: "Sports & Outdoors" },
            { value: "toys", label: "Toys & Games" },
            { value: "clothing", label: "Clothing & Accessories" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "averagePrice",
          label: "Average Product Price",
          type: "select",
          required: true,
          options: [
            { value: "under25", label: "Under $25" },
            { value: "25-50", label: "$25-$50" },
            { value: "50-100", label: "$50-$100" },
            { value: "100-200", label: "$100-$200" },
            { value: "200+", label: "Over $200" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Campaign Goals",
      description: "What do you want to achieve?",
      fields: [
        {
          name: "primaryGoal",
          label: "Primary Advertising Goal",
          type: "radio",
          required: true,
          options: [
            { value: "launch", label: "New Product Launch" },
            { value: "ranking", label: "Improve Organic Ranking" },
            { value: "sales", label: "Maximize Sales" },
            { value: "profit", label: "Maximize Profitability (ACOS)" },
            { value: "awareness", label: "Brand Awareness" },
          ],
        },
        {
          name: "targetAcos",
          label: "Target ACOS (if known)",
          type: "select",
          required: false,
          options: [
            { value: "15", label: "Under 15%" },
            { value: "20", label: "15-20%" },
            { value: "30", label: "20-30%" },
            { value: "40", label: "30-40%" },
            { value: "50+", label: "Over 40% (aggressive growth)" },
            { value: "unknown", label: "Not sure" },
          ],
        },
        {
          name: "monthlyBudget",
          label: "Monthly Advertising Budget",
          type: "select",
          required: true,
          options: [
            { value: "500", label: "Up to $500" },
            { value: "1000", label: "$500-$1,000" },
            { value: "2500", label: "$1,000-$2,500" },
            { value: "5000", label: "$2,500-$5,000" },
            { value: "10000", label: "$5,000-$10,000" },
            { value: "10000+", label: "Over $10,000" },
          ],
        },
      ],
    },
    {
      id: 4,
      name: "Campaign Types",
      description: "Which ad types do you want?",
      fields: [
        {
          name: "sponsoredProducts",
          label: "Sponsored Products",
          type: "checkbox",
          required: false,
          helpText: "Most common - ads in search results and product pages",
        },
        {
          name: "sponsoredBrands",
          label: "Sponsored Brands",
          type: "checkbox",
          required: false,
          helpText: "Brand banner ads (requires Brand Registry)",
        },
        {
          name: "sponsoredDisplay",
          label: "Sponsored Display",
          type: "checkbox",
          required: false,
          helpText: "Retargeting and audience-based ads",
        },
        {
          name: "productTargeting",
          label: "Product Targeting Campaigns",
          type: "checkbox",
          required: false,
          helpText: "Target specific competitor products",
        },
        {
          name: "competitorAsins",
          label: "Competitor ASINs to Target",
          type: "textarea",
          required: false,
          placeholder: "List competitor ASINs you want to target",
        },
      ],
    },
    {
      id: 5,
      name: "Contact Information",
      description: "Your contact details",
      fields: [
        {
          name: "contactName",
          label: "Contact Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: false,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How much should I budget for Amazon PPC?",
      answer: "Budget depends on your goals and competition. For new products, we recommend $20-50/day per product. More competitive categories may require higher budgets to gain visibility.",
    },
    {
      question: "What's a good ACOS?",
      answer: "A 'good' ACOS depends on your margins. If your profit margin is 30%, keeping ACOS under 30% means you're profitable. For launches, higher ACOS is acceptable to build ranking.",
    },
    {
      question: "How long until I see results?",
      answer: "Initial data takes 1-2 weeks to accumulate. Optimization is ongoing - most campaigns reach optimal performance after 4-8 weeks of refinement.",
    },
    {
      question: "Is ongoing management included?",
      answer: "Our setup packages include initial optimization. For ongoing management, we offer monthly management packages or can provide training for you to manage yourself.",
    },
  ],
};

// ============================================
// ACCOUNT REINSTATEMENT
// ============================================
export const accountReinstatementForm: ServiceFormConfig = {
  serviceSlug: "account-reinstatement",
  title: "Account Reinstatement",
  description: "Get your suspended Amazon account reinstated quickly",
  steps: [
    {
      id: 1,
      name: "Account Information",
      description: "Your suspended account details",
      fields: [
        {
          name: "amazonSellerId",
          label: "Amazon Seller ID",
          type: "text",
          required: true,
        },
        {
          name: "sellerName",
          label: "Seller/Business Name",
          type: "text",
          required: true,
        },
        {
          name: "marketplace",
          label: "Marketplace",
          type: "select",
          required: true,
          options: [
            { value: "us", label: "Amazon.com (USA)" },
            { value: "uk", label: "Amazon.co.uk (UK)" },
            { value: "de", label: "Amazon.de (Germany)" },
            { value: "ca", label: "Amazon.ca (Canada)" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "accountEmail",
          label: "Account Email",
          type: "email",
          required: true,
        },
      ],
    },
    {
      id: 2,
      name: "Suspension Details",
      description: "Tell us about the suspension",
      fields: [
        {
          name: "suspensionType",
          label: "Type of Suspension",
          type: "select",
          required: true,
          options: [
            { value: "performance", label: "Performance-Related (ODR, late shipment)" },
            { value: "policy", label: "Policy Violation" },
            { value: "inauthentic", label: "Inauthentic/Counterfeit Claims" },
            { value: "restricted", label: "Restricted Product Violation" },
            { value: "review_manipulation", label: "Review Manipulation" },
            { value: "linked_account", label: "Linked Account Issue" },
            { value: "verification", label: "Verification/Identity" },
            { value: "ip_complaint", label: "IP/Rights Owner Complaint" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "suspensionDate",
          label: "Suspension Date",
          type: "date",
          required: true,
        },
        {
          name: "previousAppeals",
          label: "Have you submitted appeals?",
          type: "radio",
          required: true,
          options: [
            { value: "no", label: "No, this is my first attempt" },
            { value: "yes_1", label: "Yes, 1 appeal" },
            { value: "yes_2", label: "Yes, 2 appeals" },
            { value: "yes_3+", label: "Yes, 3 or more appeals" },
          ],
        },
        {
          name: "previousAppealDetails",
          label: "Previous Appeal Details",
          type: "textarea",
          required: false,
          conditionalOn: { field: "previousAppeals", value: ["yes_1", "yes_2", "yes_3+"] },
          placeholder: "What did you submit? What was Amazon's response?",
        },
      ],
    },
    {
      id: 3,
      name: "Suspension Notice",
      description: "Upload the suspension notification",
      fields: [
        {
          name: "suspensionNotice",
          label: "Upload Suspension Notice",
          type: "file",
          required: true,
          accept: ".pdf,.jpg,.jpeg,.png,.eml",
          helpText: "Upload the email or Performance Notification from Amazon",
        },
        {
          name: "suspensionReason",
          label: "Suspension Reason (from Amazon)",
          type: "textarea",
          required: true,
          placeholder: "Copy the exact reason stated by Amazon",
        },
        {
          name: "affectedAsins",
          label: "Affected ASINs (if specific products)",
          type: "textarea",
          required: false,
          placeholder: "List ASINs if the suspension is product-specific",
        },
      ],
    },
    {
      id: 4,
      name: "Your Perspective",
      description: "Help us understand what happened",
      fields: [
        {
          name: "yourExplanation",
          label: "What Happened (Your Understanding)",
          type: "textarea",
          required: true,
          placeholder: "Explain what led to this suspension in your own words",
        },
        {
          name: "changesImplemented",
          label: "Changes Already Made",
          type: "textarea",
          required: false,
          placeholder: "Describe any changes you've already made to address the issue",
        },
        {
          name: "hasInvoices",
          label: "Do you have supplier invoices for affected products?",
          type: "radio",
          required: false,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "na", label: "Not applicable" },
          ],
        },
        {
          name: "invoiceUpload",
          label: "Upload Invoices",
          type: "file",
          required: false,
          accept: ".pdf,.jpg,.jpeg,.png",
          conditionalOn: { field: "hasInvoices", value: "yes" },
        },
      ],
    },
    {
      id: 5,
      name: "Urgency & Contact",
      description: "How can we reach you?",
      fields: [
        {
          name: "urgency",
          label: "Urgency Level",
          type: "radio",
          required: true,
          options: [
            { value: "standard", label: "Standard (5-7 business days)" },
            { value: "priority", label: "Priority (2-3 business days)" },
            { value: "emergency", label: "Emergency (Same day analysis)" },
          ],
        },
        {
          name: "contactName",
          label: "Contact Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "contactPhone",
          label: "Phone",
          type: "phone",
          required: true,
        },
        {
          name: "preferredContact",
          label: "Preferred Contact Method",
          type: "select",
          required: true,
          options: [
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
            { value: "whatsapp", label: "WhatsApp" },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What's the success rate for reinstatement?",
      answer: "Our success rate is over 80% for first-time appeals when sellers cooperate fully. Success depends on the suspension type and having proper documentation.",
    },
    {
      question: "How long does reinstatement take?",
      answer: "Once we submit the appeal, Amazon typically responds within 24-72 hours. Complex cases may require multiple appeals over several weeks.",
    },
    {
      question: "What if I've already submitted appeals?",
      answer: "We can still help. We'll analyze your previous appeals and Amazon's responses to craft a stronger Plan of Action addressing specific concerns.",
    },
    {
      question: "Can you guarantee reinstatement?",
      answer: "No one can guarantee reinstatement as the final decision is Amazon's. However, we craft professional appeals that address root causes and demonstrate accountability.",
    },
  ],
};

// ============================================
// FBA CONSULTATION
// ============================================
export const fbaConsultationForm: ServiceFormConfig = {
  serviceSlug: "fba-consultation",
  title: "FBA Consultation",
  description: "Expert guidance for your Amazon FBA business",
  steps: [
    {
      id: 1,
      name: "Your Background",
      description: "Tell us about your experience",
      fields: [
        {
          name: "experienceLevel",
          label: "Amazon Selling Experience",
          type: "radio",
          required: true,
          options: [
            { value: "beginner", label: "Beginner (0-6 months)" },
            { value: "intermediate", label: "Intermediate (6-24 months)" },
            { value: "experienced", label: "Experienced (2+ years)" },
          ],
        },
        {
          name: "hasAccount",
          label: "Do you have an Amazon seller account?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, active account" },
            { value: "pending", label: "In progress/pending" },
            { value: "no", label: "Not yet" },
          ],
        },
        {
          name: "currentRevenue",
          label: "Current Monthly Revenue (if selling)",
          type: "select",
          required: false,
          conditionalOn: { field: "hasAccount", value: "yes" },
          options: [
            { value: "0", label: "$0 (just started)" },
            { value: "1-5000", label: "$1-$5,000" },
            { value: "5000-10000", label: "$5,000-$10,000" },
            { value: "10000-25000", label: "$10,000-$25,000" },
            { value: "25000-50000", label: "$25,000-$50,000" },
            { value: "50000+", label: "$50,000+" },
          ],
        },
        {
          name: "businessModel",
          label: "Business Model",
          type: "select",
          required: true,
          options: [
            { value: "private_label", label: "Private Label" },
            { value: "wholesale", label: "Wholesale" },
            { value: "arbitrage", label: "Retail/Online Arbitrage" },
            { value: "dropshipping", label: "Dropshipping" },
            { value: "not_sure", label: "Not decided yet" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Consultation Topics",
      description: "What do you want to discuss?",
      fields: [
        {
          name: "primaryTopic",
          label: "Primary Topic",
          type: "select",
          required: true,
          options: [
            { value: "getting_started", label: "Getting Started on Amazon" },
            { value: "product_selection", label: "Product Selection/Research" },
            { value: "sourcing", label: "Product Sourcing" },
            { value: "launch", label: "Product Launch Strategy" },
            { value: "ppc", label: "PPC/Advertising" },
            { value: "scaling", label: "Scaling Operations" },
            { value: "inventory", label: "Inventory Management" },
            { value: "account_health", label: "Account Health/Issues" },
            { value: "exit", label: "Selling Your Business" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "additionalTopics",
          label: "Additional Topics",
          type: "textarea",
          required: false,
          placeholder: "List any other topics you'd like to cover",
        },
        {
          name: "specificQuestions",
          label: "Specific Questions",
          type: "textarea",
          required: true,
          placeholder: "What specific questions do you want answered?",
        },
        {
          name: "goals",
          label: "Your Goals",
          type: "textarea",
          required: true,
          placeholder: "What do you want to achieve with your Amazon business?",
        },
      ],
    },
    {
      id: 3,
      name: "Consultation Package",
      description: "Choose your consultation type",
      fields: [
        {
          name: "consultationType",
          label: "Consultation Type",
          type: "radio",
          required: true,
          options: [
            {
              value: "single",
              label: "Single Session (60 min)",
              description: "One-time consultation call",
            },
            {
              value: "package",
              label: "3-Session Package",
              description: "Three calls with email support",
            },
            {
              value: "mentorship",
              label: "Monthly Mentorship",
              description: "Ongoing support and guidance",
            },
          ],
        },
        {
          name: "preferredTime",
          label: "Preferred Time Zone",
          type: "select",
          required: true,
          options: [
            { value: "est", label: "Eastern Time (EST/EDT)" },
            { value: "pst", label: "Pacific Time (PST/PDT)" },
            { value: "gmt", label: "GMT/UTC" },
            { value: "bst", label: "Bangladesh Time (BST)" },
            { value: "ist", label: "India Standard Time (IST)" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "availability",
          label: "General Availability",
          type: "textarea",
          required: true,
          placeholder: "What days/times generally work for you?",
        },
      ],
    },
    {
      id: 4,
      name: "Contact Information",
      description: "Your contact details",
      fields: [
        {
          name: "contactName",
          label: "Full Name",
          type: "text",
          required: true,
        },
        {
          name: "contactEmail",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "contactPhone",
          label: "Phone/WhatsApp",
          type: "phone",
          required: true,
        },
        {
          name: "country",
          label: "Country",
          type: "country",
          required: true,
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Who are the consultants?",
      answer: "Our consultants are experienced Amazon sellers with proven track records. Each has built successful 6-7 figure Amazon businesses and understands the challenges you face.",
    },
    {
      question: "What can I expect from a consultation?",
      answer: "You'll receive personalized advice for your specific situation, actionable strategies you can implement immediately, and answers to your burning questions from someone who's been there.",
    },
    {
      question: "Is this a coaching program?",
      answer: "Our consultations are focused advisory sessions. For comprehensive training, we recommend dedicated Amazon courses. We can suggest appropriate programs during your consultation.",
    },
    {
      question: "Can you help with suspended accounts?",
      answer: "Basic suspension guidance can be covered in consultations. For hands-on reinstatement help, our Account Reinstatement service is better suited.",
    },
  ],
};

// ============================================
// BUSINESS BANKING
// ============================================
export const businessBankingForm: ServiceFormConfig = {
  serviceSlug: "business-banking",
  title: "Business Banking",
  description: "Open a US business bank account remotely",
  steps: [
    {
      id: 1,
      name: "Business Information",
      description: "Your business details",
      fields: [
        {
          name: "businessName",
          label: "Business Legal Name",
          type: "text",
          required: true,
        },
        {
          name: "businessType",
          label: "Business Type",
          type: "select",
          required: true,
          options: [
            { value: "llc", label: "LLC" },
            { value: "corporation", label: "Corporation" },
            { value: "sole_prop", label: "Sole Proprietorship" },
          ],
        },
        {
          name: "formationState",
          label: "State of Formation",
          type: "state",
          required: true,
        },
        {
          name: "formationDate",
          label: "Date of Formation",
          type: "date",
          required: true,
        },
        {
          name: "ein",
          label: "EIN",
          type: "text",
          required: true,
          placeholder: "XX-XXXXXXX",
        },
        {
          name: "businessAddress",
          label: "Business Address",
          type: "text",
          required: true,
        },
        {
          name: "businessCity",
          label: "City",
          type: "text",
          required: true,
        },
        {
          name: "businessState",
          label: "State",
          type: "state",
          required: true,
        },
        {
          name: "businessZip",
          label: "ZIP Code",
          type: "text",
          required: true,
        },
      ],
    },
    {
      id: 2,
      name: "Business Activities",
      description: "Tell us about your business",
      fields: [
        {
          name: "businessIndustry",
          label: "Business Industry",
          type: "select",
          required: true,
          options: [
            { value: "ecommerce", label: "E-commerce/Online Retail" },
            { value: "consulting", label: "Consulting/Professional Services" },
            { value: "software", label: "Software/Technology" },
            { value: "marketing", label: "Marketing/Advertising" },
            { value: "dropshipping", label: "Dropshipping" },
            { value: "wholesale", label: "Wholesale/Distribution" },
            { value: "import_export", label: "Import/Export" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "businessDescription",
          label: "Business Description",
          type: "textarea",
          required: true,
          placeholder: "Briefly describe what your business does",
        },
        {
          name: "expectedMonthlyRevenue",
          label: "Expected Monthly Revenue",
          type: "select",
          required: true,
          options: [
            { value: "0-5000", label: "$0 - $5,000" },
            { value: "5000-10000", label: "$5,000 - $10,000" },
            { value: "10000-25000", label: "$10,000 - $25,000" },
            { value: "25000-50000", label: "$25,000 - $50,000" },
            { value: "50000-100000", label: "$50,000 - $100,000" },
            { value: "100000+", label: "$100,000+" },
          ],
        },
        {
          name: "expectedTransactions",
          label: "Expected Monthly Transactions",
          type: "select",
          required: true,
          options: [
            { value: "1-20", label: "1-20 transactions" },
            { value: "21-50", label: "21-50 transactions" },
            { value: "51-100", label: "51-100 transactions" },
            { value: "100+", label: "100+ transactions" },
          ],
        },
        {
          name: "needsInternational",
          label: "Need international wire transfers?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes, frequently" },
            { value: "occasionally", label: "Occasionally" },
            { value: "no", label: "No, domestic only" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Owner Information",
      description: "Primary account owner details",
      fields: [
        {
          name: "ownerFirstName",
          label: "First Name",
          type: "text",
          required: true,
        },
        {
          name: "ownerLastName",
          label: "Last Name",
          type: "text",
          required: true,
        },
        {
          name: "ownerDob",
          label: "Date of Birth",
          type: "date",
          required: true,
        },
        {
          name: "ownerCitizenship",
          label: "Country of Citizenship",
          type: "country",
          required: true,
        },
        {
          name: "ownerAddress",
          label: "Residential Address",
          type: "text",
          required: true,
        },
        {
          name: "ownerCity",
          label: "City",
          type: "text",
          required: true,
        },
        {
          name: "ownerCountry",
          label: "Country",
          type: "country",
          required: true,
        },
        {
          name: "ownerPhone",
          label: "Phone Number",
          type: "phone",
          required: true,
        },
        {
          name: "ownerEmail",
          label: "Email Address",
          type: "email",
          required: true,
        },
      ],
    },
    {
      id: 4,
      name: "Documents",
      description: "Required documents",
      fields: [
        {
          name: "hasArticles",
          label: "Do you have Articles of Organization?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No, need help obtaining" },
          ],
        },
        {
          name: "hasEin",
          label: "Do you have EIN Letter (147C or CP575)?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          name: "hasOperatingAgreement",
          label: "Do you have an Operating Agreement?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No, need one" },
          ],
        },
        {
          name: "idUpload",
          label: "Passport or Government ID",
          type: "file",
          required: true,
          accept: ".pdf,.jpg,.jpeg,.png",
          helpText: "Upload a clear copy of your passport bio page",
        },
        {
          name: "proofOfAddress",
          label: "Proof of Address",
          type: "file",
          required: true,
          accept: ".pdf,.jpg,.jpeg,.png",
          helpText: "Utility bill or bank statement dated within 90 days",
        },
      ],
    },
    {
      id: 5,
      name: "Preferences",
      description: "Banking preferences",
      fields: [
        {
          name: "bankPreference",
          label: "Bank Preference",
          type: "select",
          required: true,
          options: [
            { value: "no_preference", label: "No preference - recommend best option" },
            { value: "mercury", label: "Mercury (tech-focused)" },
            { value: "relay", label: "Relay (online banking)" },
            { value: "bluevine", label: "Bluevine" },
            { value: "traditional", label: "Traditional bank (Chase, BofA)" },
          ],
        },
        {
          name: "needDebitCard",
          label: "Need a debit card?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          name: "needChecks",
          label: "Need checkbook?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          name: "additionalRequirements",
          label: "Additional Requirements",
          type: "textarea",
          required: false,
          placeholder: "Any specific features or requirements?",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Can non-US residents open a US business bank account?",
      answer: "Yes! Our partner banks accept applications from international business owners with a US-registered LLC. The process can be completed remotely in most cases.",
    },
    {
      question: "Do I need to visit the US?",
      answer: "For most of our partner banks, no. Account opening can be completed remotely with video verification. Traditional banks may require an in-person visit.",
    },
    {
      question: "What documents do I need?",
      answer: "Typically you need: Articles of Organization, EIN Letter, Operating Agreement, passport/ID, and proof of address. We help you gather and prepare these documents.",
    },
    {
      question: "How long does account opening take?",
      answer: "Online banks like Mercury and Relay can approve accounts within 1-3 business days. Traditional banks may take 1-2 weeks or longer.",
    },
    {
      question: "Can I get a debit card shipped internationally?",
      answer: "Yes, most banks offer international shipping for debit cards. Some may have an additional fee for express international delivery.",
    },
  ],
};

// Export all form configurations
export const serviceForms: Record<string, ServiceFormConfig> = {
  "ein-application": einApplicationForm,
  "itin-application": itinApplicationForm,
  "trademark-registration": trademarkRegistrationForm,
  "dba-filing": dbaFilingForm,
  "llc-dissolution": llcDissolutionForm,
  "amazon-seller": amazonSellerForm,
  "registered-agent": registeredAgentForm,
  "brand-registry": brandRegistryForm,
  "category-ungating": categoryUngatingForm,
  "compliance": annualComplianceForm,
  "bookkeeping": bookkeepingForm,
  "tax-filing": taxFilingForm,
  "virtual-address": virtualAddressForm,
  "operating-agreement": operatingAgreementForm,
  "amendment-filing": amendmentFilingForm,
  "certificate-good-standing": certificateGoodStandingForm,
  "multi-state-registration": multiStateRegistrationForm,
  "apostille-service": apostilleServiceForm,
  "reseller-certificate": resellerCertificateForm,
  "product-listing-optimization": productListingForm,
  "a-plus-content": aPlusContentForm,
  "ppc-campaign-setup": ppcCampaignForm,
  "account-reinstatement": accountReinstatementForm,
  "fba-consultation": fbaConsultationForm,
  "business-banking": businessBankingForm,
};

// Helper function to get form config by slug
export function getServiceForm(slug: string): ServiceFormConfig | undefined {
  return serviceForms[slug];
}
