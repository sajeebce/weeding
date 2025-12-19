"use client";
// Dynamic service checkout with account creation
import { useState, useEffect, Suspense, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Shield,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Lock,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  cn,
  sanitizePhone,
  sanitizeName,
  sanitizeEmail,
  sanitizeText,
  INPUT_LIMITS
} from "@/lib/utils";
import {
  getServiceForm,
  type ServiceFormConfig,
  type FormField,
  type FormStep,
} from "@/lib/data/service-forms";
import { StateSelector, type State } from "@/components/ui/state-selector";
import { CountrySelector } from "@/components/ui/country-selector";
import { Header } from "@/components/layout/header";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface FormValues {
  [key: string]: string | boolean | number | File | null;
}

interface LoggedInUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AccountData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
}

function ServiceCheckoutForm() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceSlug = params.service as string;
  const selectedPackageSlug = searchParams.get("package") || "basic";

  const [formConfig, setFormConfig] = useState<ServiceFormConfig | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<FormValues>({});
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [understandDisclaimer, setUnderstandDisclaimer] = useState(false);

  // User & Account states
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [accountData, setAccountData] = useState<AccountData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    country: "BD",
  });
  const [emailCheckStatus, setEmailCheckStatus] = useState<"idle" | "checking" | "exists" | "available">("idle");
  const [existingUserName, setExistingUserName] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Inline login state
  const [showInlineLogin, setShowInlineLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Service data from API
  interface ServicePackage {
    id: string;
    name: string;
    description: string | null;
    price: number;
    isPopular: boolean;
    features: string[];
    notIncluded: string[];
  }

  interface ServiceInfo {
    id: string;
    slug: string;
    name: string;
    shortDesc: string;
    packages: ServicePackage[];
  }

  // Dynamic form template from database
  interface DynamicFormField {
    id: string;
    name: string;
    label: string;
    type: string;
    placeholder?: string | null;
    helpText?: string | null;
    width: string;
    required: boolean;
    validation?: Record<string, unknown> | null;
    options?: Array<{ value: string; label: string; description?: string }> | null;
    dataSourceType?: string | null;
    dataSourceKey?: string | null;
    dependsOn?: string | null;
    conditionalLogic?: { when: string; operator: string; value: string } | null;
    accept?: string | null;
    maxSize?: number | null;
    defaultValue?: string | null;
  }

  interface DynamicFormTab {
    id: string;
    name: string;
    description?: string | null;
    icon: string;
    order: number;
    fields: DynamicFormField[];
  }

  interface DynamicFormTemplate {
    id: string;
    version: number;
    tabs: DynamicFormTab[];
  }

  const [service, setService] = useState<ServiceInfo | null>(null);
  const [dynamicTemplate, setDynamicTemplate] = useState<DynamicFormTemplate | null>(null);
  const [isLoadingService, setIsLoadingService] = useState(true);

  // Fetch service data and dynamic form from API
  useEffect(() => {
    const fetchServiceAndForm = async () => {
      setIsLoadingService(true);
      try {
        // Fetch service data
        const serviceResponse = await fetch(`/api/services/${serviceSlug}`);
        if (serviceResponse.ok) {
          const data = await serviceResponse.json();
          setService(data);
        }

        // Fetch dynamic form template
        const formResponse = await fetch(`/api/services/${serviceSlug}/form`);
        if (formResponse.ok) {
          const formData = await formResponse.json();
          if (formData.template) {
            setDynamicTemplate(formData.template);
          }
        }
      } catch (error) {
        console.error("Error fetching service:", error);
      } finally {
        setIsLoadingService(false);
      }
    };
    fetchServiceAndForm();
  }, [serviceSlug]);

  // Check for logged-in user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.id && user.email) {
          setLoggedInUser(user);
        }
      } catch {
        // Invalid stored user data
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Load form configuration - prefer dynamic template from DB, fall back to static
  useEffect(() => {
    if (dynamicTemplate && dynamicTemplate.tabs.length > 0) {
      // Convert dynamic template to ServiceFormConfig format
      const dynamicConfig: ServiceFormConfig = {
        slug: serviceSlug,
        serviceName: service?.name || serviceSlug,
        steps: dynamicTemplate.tabs.map((tab, index) => ({
          id: index + 1,
          name: tab.name,
          description: tab.description || undefined,
          fields: tab.fields.map((field) => {
            // Convert field type to match static config format
            const fieldType = field.type.toLowerCase();
            // Map database types to form types
            const typeMap: Record<string, string> = {
              text: "text",
              email: "email",
              phone: "phone",
              select: "select",
              textarea: "textarea",
              date: "date",
              number: "number",
              checkbox: "checkbox",
              radio: "radio",
              file_upload: "file",
              file: "file",
              country_select: "country",
              country: "country",
              state_select: "state",
              state: "state",
              heading: "heading",
              paragraph: "paragraph",
              divider: "divider",
              multi_select: "multi_select",
            };

            return {
              name: field.name,
              label: field.label,
              type: typeMap[fieldType] || fieldType,
              placeholder: field.placeholder || undefined,
              helpText: field.helpText || undefined,
              required: field.required,
              options: field.options || undefined,
              validation: field.validation ? {
                min: (field.validation as Record<string, unknown>).min as number | undefined,
                max: (field.validation as Record<string, unknown>).max as number | undefined,
                maxLength: (field.validation as Record<string, unknown>).maxLength as number | undefined,
                pattern: (field.validation as Record<string, unknown>).pattern as string | undefined,
              } : undefined,
              conditionalOn: field.conditionalLogic ? {
                field: field.conditionalLogic.when,
                value: field.conditionalLogic.value,
              } : undefined,
              accept: field.accept || undefined,
            } as FormField;
          }),
        })),
        faqs: [], // FAQs will come from static config as fallback
      };

      // Merge FAQs from static config if available
      const staticConfig = getServiceForm(serviceSlug);
      if (staticConfig?.faqs) {
        dynamicConfig.faqs = staticConfig.faqs;
      }

      setFormConfig(dynamicConfig);
    } else {
      // Fall back to static config
      const config = getServiceForm(serviceSlug);
      if (config) {
        setFormConfig(config);
      }
    }
  }, [serviceSlug, dynamicTemplate, service?.name]);

  // Auto-populate contact fields from logged-in user (so backend still gets the data)
  useEffect(() => {
    if (loggedInUser && formConfig) {
      // Find contact fields and pre-fill them from user data
      const contactFieldMappings: Record<string, string> = {
        contactName: loggedInUser.name,
        contactEmail: loggedInUser.email,
        email: loggedInUser.email,
        fullName: loggedInUser.name,
        authorizerName: loggedInUser.name,
        // Phone will be fetched from user record if needed
      };

      setFormValues((prev) => {
        const updated = { ...prev };
        formConfig.steps.forEach((step) => {
          step.fields.forEach((field) => {
            if (contactFieldMappings[field.name] && !prev[field.name]) {
              updated[field.name] = contactFieldMappings[field.name];
            }
          });
        });
        return updated;
      });
    }
  }, [loggedInUser, formConfig]);

  // Check if email exists (debounced)
  const checkEmailExists = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailCheckStatus("idle");
      return;
    }

    setEmailCheckStatus("checking");
    try {
      const res = await fetch(`/api/service-orders?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.exists) {
        setEmailCheckStatus("exists");
        setExistingUserName(data.user?.name || null);
        setShowLoginPrompt(true);
      } else {
        setEmailCheckStatus("available");
        setShowLoginPrompt(false);
        setExistingUserName(null);
      }
    } catch {
      setEmailCheckStatus("idle");
    }
  }, []);

  // Handle account field changes with sanitization
  const handleAccountChange = (field: keyof AccountData, value: string) => {
    let sanitizedValue = value;

    // Apply field-specific sanitization
    switch (field) {
      case "phone":
        sanitizedValue = sanitizePhone(value);
        break;
      case "firstName":
      case "lastName":
        sanitizedValue = sanitizeName(value, INPUT_LIMITS.firstName.max);
        break;
      case "email":
        sanitizedValue = sanitizeEmail(value);
        break;
      case "password":
      case "confirmPassword":
        sanitizedValue = value.slice(0, INPUT_LIMITS.password.max);
        break;
      default:
        sanitizedValue = sanitizeText(value, 200);
    }

    setAccountData(prev => ({ ...prev, [field]: sanitizedValue }));
    if (errors[`account_${field}`]) {
      setErrors(prev => ({ ...prev, [`account_${field}`]: "" }));
    }

    // Trigger email check on email change
    if (field === "email") {
      setShowLoginPrompt(false);
      setEmailCheckStatus("idle");
    }
  };

  // Debounced email check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (accountData.email && !loggedInUser) {
        checkEmailExists(accountData.email);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [accountData.email, loggedInUser, checkEmailExists]);

  // Handle inline login
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error || "Invalid email or password");
        return;
      }

      // Store user data and update state
      localStorage.setItem("user", JSON.stringify(data.user));
      setLoggedInUser(data.user);
      setShowInlineLogin(false);
      setShowLoginPrompt(false);
      // Dispatch event for header update
      window.dispatchEvent(new Event("user-auth-change"));
      toast.success(`Welcome back, ${data.user.name}!`);
    } catch {
      setLoginError("An error occurred. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Get selected package from service data
  const selectedPackage = service?.packages.find(
    (p) => p.name.toLowerCase() === selectedPackageSlug.toLowerCase()
  ) || service?.packages[0];
  const serviceFee = selectedPackage?.price || 0;

  // Check if a field should be visible based on conditional logic
  const isFieldVisible = (field: FormField): boolean => {
    if (!field.conditionalOn) return true;
    const { field: dependentField, value } = field.conditionalOn;
    const currentValue = formValues[dependentField];
    if (Array.isArray(value)) {
      return value.includes(currentValue as string);
    }
    return currentValue === value;
  };

  // Handle input changes with sanitization based on field type
  const handleInputChange = (name: string, value: string | boolean | number | File | null, fieldType?: string) => {
    let sanitizedValue = value;

    // Only sanitize string values
    if (typeof value === "string") {
      switch (fieldType) {
        case "phone":
          sanitizedValue = sanitizePhone(value);
          break;
        case "email":
          sanitizedValue = sanitizeEmail(value);
          break;
        case "textarea":
          sanitizedValue = sanitizeText(value, INPUT_LIMITS.description.max);
          break;
        default:
          // Apply general text sanitization for text fields
          if (fieldType === "text" || !fieldType) {
            // Check if field name suggests a specific type
            if (name.toLowerCase().includes("name") || name.toLowerCase().includes("firstname") || name.toLowerCase().includes("lastname")) {
              sanitizedValue = sanitizeName(value, INPUT_LIMITS.name.max);
            } else if (name.toLowerCase().includes("address")) {
              sanitizedValue = sanitizeText(value, INPUT_LIMITS.address.max);
            } else if (name.toLowerCase().includes("city")) {
              sanitizedValue = sanitizeText(value, INPUT_LIMITS.city.max);
            } else {
              sanitizedValue = sanitizeText(value, 500);
            }
          }
      }
    }

    setFormValues((prev) => ({ ...prev, [name]: sanitizedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle state selection
  const handleStateChange = (state: State | null, fieldName: string) => {
    if (fieldName === "formationState" || fieldName === "state") {
      setSelectedState(state);
    }
    handleInputChange(fieldName, state?.code || "");
  };

  // Validate current step
  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    step.fields.forEach((field) => {
      if (!isFieldVisible(field)) return;
      if (!field.required) return;

      const value = formValues[field.name];
      if (!value || (typeof value === "string" && !value.trim())) {
        newErrors[field.name] = `${field.label} is required`;
      }

      // Email validation
      if (field.type === "email" && value && typeof value === "string") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[field.name] = "Please enter a valid email address";
        }
      }

      // Phone validation
      if (field.type === "phone" && value && typeof value === "string") {
        if (value.length < 7) {
          newErrors[field.name] = "Please enter a valid phone number";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate account step (for non-logged-in users)
  const validateAccountStep = (): boolean => {
    if (loggedInUser) return true; // Skip validation for logged-in users

    const newErrors: Record<string, string> = {};

    if (!accountData.email.trim()) {
      newErrors.account_email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
      newErrors.account_email = "Please enter a valid email";
    } else if (emailCheckStatus === "exists") {
      newErrors.account_email = "This email already has an account. Please login.";
    }

    if (!accountData.firstName.trim()) {
      newErrors.account_firstName = "First name is required";
    }

    if (!accountData.lastName.trim()) {
      newErrors.account_lastName = "Last name is required";
    }

    if (!accountData.password) {
      newErrors.account_password = "Password is required";
    } else if (accountData.password.length < 8) {
      newErrors.account_password = "Password must be at least 8 characters";
    }

    if (!accountData.confirmPassword) {
      newErrors.account_confirmPassword = "Please confirm your password";
    } else if (accountData.password !== accountData.confirmPassword) {
      newErrors.account_confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate final step (terms)
  const validateFinalStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms";
    }
    if (!understandDisclaimer) {
      newErrors.understandDisclaimer = "Please acknowledge the disclaimer";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if a step is a Contact Information step (to skip for logged-in users)
  const isContactInfoStep = (step: FormStep): boolean => {
    return step.name.toLowerCase().includes("contact");
  };

  // Get filtered steps (skip contact info for logged-in users)
  const getFilteredSteps = () => {
    if (!formConfig) return [];
    if (loggedInUser) {
      // Skip contact info steps for logged-in users
      return formConfig.steps.filter((step) => !isContactInfoStep(step));
    }
    return formConfig.steps;
  };

  // Calculate total steps - add account step if not logged in, skip contact for logged in
  const getTotalSteps = () => {
    if (!formConfig) return 1;
    const filteredSteps = getFilteredSteps();
    return loggedInUser ? filteredSteps.length : formConfig.steps.length + 1;
  };

  // Get step number for account step (inserted before last step)
  const getAccountStepNumber = () => {
    if (!formConfig) return 1;
    return formConfig.steps.length; // Account step is right before the final terms step
  };

  // Check if current step is account step
  const isAccountStep = () => {
    if (loggedInUser) return false;
    return currentStep === getAccountStepNumber();
  };

  // Check if current step is the final terms step
  const isFinalStep = () => {
    return currentStep === getTotalSteps();
  };

  // Get the actual form step config (adjust for account step and contact info)
  const getCurrentFormStep = () => {
    if (!formConfig) return null;
    if (loggedInUser) {
      const filteredSteps = getFilteredSteps();
      return filteredSteps[currentStep - 1] || null;
    }
    // For non-logged-in users, account step is inserted before the last step
    if (isAccountStep()) return null; // Account step has no form config
    if (currentStep > getAccountStepNumber()) {
      // After account step, we're on the terms step (which was the last form step)
      return formConfig.steps[formConfig.steps.length - 1];
    }
    return formConfig.steps.find((s) => s.id === currentStep);
  };

  const handleNext = () => {
    if (!formConfig) return;

    const totalSteps = getTotalSteps();

    // Validate based on current step type
    if (isAccountStep()) {
      // Validate account step
      if (validateAccountStep()) {
        setCurrentStep(currentStep + 1);
        if (typeof window !== "undefined") {
          window.scrollTo(0, 0);
        }
      }
      return;
    }

    // Regular form step validation
    const currentFormStep = getCurrentFormStep();
    if (currentFormStep && validateStep(currentFormStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        if (typeof window !== "undefined") {
          window.scrollTo(0, 0);
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formConfig || !validateFinalStep()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/service-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: serviceSlug,
          serviceName: service?.name,
          packageId: selectedPackageSlug,
          packageName: selectedPackage?.name,
          packagePrice: serviceFee,
          formData: formValues,
          totalAmount: serviceFee + (selectedState?.fee || 0),
          stateCode: selectedState?.code,
          stateName: selectedState?.name,
          // Include account data for new users, or userId for logged-in users
          ...(loggedInUser
            ? { userId: loggedInUser.id }
            : {
                account: {
                  email: accountData.email,
                  password: accountData.password,
                  firstName: accountData.firstName,
                  lastName: accountData.lastName,
                  phone: accountData.phone || undefined,
                  country: accountData.country || undefined,
                },
              }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        toast.success("Application submitted successfully!");
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } else if (response.status === 409 && data.error === "EMAIL_EXISTS") {
        // Email already exists - prompt login
        setShowLoginPrompt(true);
        setExistingUserName(data.userName);
        toast.error("An account with this email already exists. Please login to continue.");
        // Go back to account step
        setCurrentStep(getAccountStepNumber());
      } else {
        toast.error(data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render a single form field
  const renderField = (field: FormField) => {
    if (!isFieldVisible(field)) return null;

    const fieldError = errors[field.name];
    const value = formValues[field.name];

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={field.name}>
                {field.label} {field.required && "*"}
              </Label>
              {field.helpText && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{field.helpText}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Input
              id={field.name}
              type={field.type === "phone" ? "tel" : field.type}
              placeholder={field.placeholder}
              value={(value as string) || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
              className={fieldError ? "border-destructive" : ""}
              min={field.validation?.min}
              max={field.validation?.max}
              maxLength={
                field.type === "phone" ? INPUT_LIMITS.phone.max :
                field.type === "email" ? INPUT_LIMITS.email.max :
                field.validation?.maxLength || 500
              }
            />
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={field.name}>
                {field.label} {field.required && "*"}
              </Label>
              {field.helpText && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{field.helpText}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              value={(value as string) || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value, "textarea")}
              className={fieldError ? "border-destructive" : ""}
              rows={3}
              maxLength={field.validation?.maxLength || INPUT_LIMITS.description.max}
            />
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError}</p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>
                {field.label} {field.required && "*"}
              </Label>
              {field.helpText && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{field.helpText}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Select
              value={(value as string) || ""}
              onValueChange={(val) => handleInputChange(field.name, val)}
            >
              <SelectTrigger className={fieldError ? "border-destructive" : ""}>
                <SelectValue placeholder={field.placeholder || "Select..."} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError}</p>
            )}
          </div>
        );

      case "radio":
        return (
          <div key={field.name} className="space-y-3">
            <div className="flex items-center gap-2">
              <Label>
                {field.label} {field.required && "*"}
              </Label>
              {field.helpText && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{field.helpText}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <RadioGroup
              value={(value as string) || ""}
              onValueChange={(val) => handleInputChange(field.name, val)}
              className="grid gap-3"
            >
              {field.options?.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-all",
                    value === option.value
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  )}
                  onClick={() => handleInputChange(field.name, option.value)}
                >
                  <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
                  <div className="flex-1">
                    <Label
                      htmlFor={`${field.name}-${option.value}`}
                      className="font-medium cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    {option.description && (
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.name} className="flex items-start space-x-3 py-2">
            <Checkbox
              id={field.name}
              checked={(value as boolean) || false}
              onCheckedChange={(checked) => handleInputChange(field.name, checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor={field.name} className="cursor-pointer">
                {field.label} {field.required && "*"}
              </Label>
              {field.helpText && (
                <p className="text-sm text-muted-foreground">{field.helpText}</p>
              )}
            </div>
          </div>
        );

      case "date":
        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={field.name}>
                {field.label} {field.required && "*"}
              </Label>
              {field.helpText && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{field.helpText}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Input
              id={field.name}
              type="date"
              value={(value as string) || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={fieldError ? "border-destructive" : ""}
            />
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError}</p>
            )}
          </div>
        );

      case "file":
        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={field.name}>
                {field.label} {field.required && "*"}
              </Label>
              {field.helpText && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{field.helpText}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Input
              id={field.name}
              type="file"
              accept={field.accept}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                handleInputChange(field.name, file);
              }}
              className={fieldError ? "border-destructive" : ""}
            />
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError}</p>
            )}
          </div>
        );

      case "state":
        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>
                {field.label} {field.required && "*"}
              </Label>
              {field.helpText && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{field.helpText}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <StateSelector
              value={field.name === "formationState" || field.name === "state" ? selectedState : null}
              onChange={(state) => handleStateChange(state, field.name)}
              placeholder={field.placeholder || "Select a state..."}
            />
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError}</p>
            )}
          </div>
        );

      case "country":
        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>
                {field.label} {field.required && "*"}
              </Label>
              {field.helpText && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{field.helpText}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <CountrySelector
              value={(value as string) || ""}
              onChange={(val) => handleInputChange(field.name, val)}
              placeholder={field.placeholder || "Select a country..."}
            />
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state while fetching service data
  if (isLoadingService) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">
              Loading service details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if service not found in database
  if (!service) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold">Service Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The requested service is not available.
          </p>
          <Link href="/services">
            <Button className="mt-4">Browse Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!formConfig) {
    // If no form config, redirect to main checkout or show error
    if (serviceSlug === "llc-formation") {
      router.push("/checkout");
      return null;
    }
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold">Checkout Not Configured</h1>
          <p className="mt-2 text-muted-foreground">
            The checkout flow for this service is being set up.
          </p>
          <Link href="/services">
            <Button className="mt-4">Browse Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStepConfig = getCurrentFormStep();
  const totalSteps = getTotalSteps();

  // Build progress steps array - filter contact for logged-in, insert Account for new users
  const getProgressSteps = () => {
    if (loggedInUser) {
      // For logged-in users: skip contact info steps
      const filteredSteps = formConfig.steps.filter((s) => !isContactInfoStep(s));
      return filteredSteps.map((s, idx) => ({
        id: idx + 1,
        name: s.name,
        isLast: idx === filteredSteps.length - 1,
      }));
    }

    // For non-logged-in users: show all steps + Account step
    const steps = formConfig.steps.map((s, idx) => ({
      id: s.id,
      name: s.name,
      isLast: idx === formConfig.steps.length - 1,
    }));

    // Insert Account step before the last step
    const lastStep = steps.pop();
    steps.push({ id: steps.length + 1, name: "Account", isLast: false });
    if (lastStep) {
      steps.push({ ...lastStep, id: steps.length + 1 });
    }
    return steps;
  };

  const progressSteps = getProgressSteps();

  return (
    <>
      <Header />
      <TooltipProvider>
        <div className="min-h-screen bg-muted/30 py-8">
          <div className="container mx-auto px-4">
            {/* Logged-in User Banner - shown below header for context */}
            {loggedInUser && (
              <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Welcome back, {loggedInUser.name}!</p>
                    <p className="text-sm text-green-600">You&apos;re logged in as {loggedInUser.email}</p>
                  </div>
                </div>
              </div>
            )}

          {/* Back Link */}
          <Link
            href={`/services/${serviceSlug}`}
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {service?.name || "Service"}
          </Link>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center flex-wrap gap-2">
              {progressSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm",
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="font-medium">{step.id}</span>
                    )}
                    <span className="hidden sm:inline">{step.name}</span>
                  </div>
                  {index < progressSteps.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 h-0.5 w-6 sm:w-10",
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2">
              {/* Account Step (for non-logged-in users) */}
              {isAccountStep() && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Create Your Account
                    </CardTitle>
                    <CardDescription>
                      Create an account to track your order and access your dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Login Prompt for Existing Users - with inline login form */}
                    {(showLoginPrompt || showInlineLogin) && (
                      <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3 mb-4">
                          <LogIn className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-800">
                              {showLoginPrompt ? "Account Already Exists" : "Login to Your Account"}
                            </h4>
                            <p className="text-sm text-amber-700">
                              {existingUserName ? (
                                <span>Welcome back, <strong>{existingUserName}</strong>! </span>
                              ) : showLoginPrompt ? (
                                <span>An account with this email already exists. </span>
                              ) : null}
                              Login below to continue with your order.
                            </p>
                          </div>
                        </div>

                        {/* Inline Login Form */}
                        <form onSubmit={handleInlineLogin} className="space-y-4 bg-white rounded-lg p-4 border">
                          {loginError && (
                            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                              {loginError}
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label htmlFor="login_email">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="login_email"
                                type="email"
                                placeholder="your@email.com"
                                value={loginEmail || accountData.email}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="pl-10"
                                required
                                disabled={isLoggingIn}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="login_password">Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="login_password"
                                type={showLoginPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="pl-10 pr-10"
                                required
                                disabled={isLoggingIn}
                              />
                              <button
                                type="button"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={isLoggingIn} className="flex-1">
                              {isLoggingIn ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Logging in...
                                </>
                              ) : (
                                <>
                                  <LogIn className="mr-2 h-4 w-4" />
                                  Login & Continue
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowInlineLogin(false);
                                setShowLoginPrompt(false);
                                setLoginError("");
                                setAccountData(prev => ({ ...prev, email: "" }));
                                setEmailCheckStatus("idle");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="account_email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address *
                      </Label>
                      <div className="relative">
                        <Input
                          id="account_email"
                          type="email"
                          placeholder="your@email.com"
                          value={accountData.email}
                          onChange={(e) => handleAccountChange("email", e.target.value)}
                          className={cn(
                            errors.account_email ? "border-destructive" : "",
                            emailCheckStatus === "available" ? "border-green-500 pr-10" : "",
                            emailCheckStatus === "exists" ? "border-amber-500 pr-10" : ""
                          )}
                        />
                        {emailCheckStatus === "checking" && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {emailCheckStatus === "available" && (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {errors.account_email && (
                        <p className="text-sm text-destructive">{errors.account_email}</p>
                      )}
                      {emailCheckStatus === "available" && (
                        <p className="text-sm text-green-600">Email is available</p>
                      )}
                    </div>

                    {/* Name Fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="account_firstName">First Name *</Label>
                        <Input
                          id="account_firstName"
                          placeholder="Your first name"
                          value={accountData.firstName}
                          onChange={(e) => handleAccountChange("firstName", e.target.value)}
                          className={errors.account_firstName ? "border-destructive" : ""}
                        />
                        {errors.account_firstName && (
                          <p className="text-sm text-destructive">{errors.account_firstName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account_lastName">Last Name *</Label>
                        <Input
                          id="account_lastName"
                          placeholder="Your last name"
                          value={accountData.lastName}
                          onChange={(e) => handleAccountChange("lastName", e.target.value)}
                          className={errors.account_lastName ? "border-destructive" : ""}
                        />
                        {errors.account_lastName && (
                          <p className="text-sm text-destructive">{errors.account_lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Phone and Country */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="account_phone">Phone Number (Optional)</Label>
                        <Input
                          id="account_phone"
                          type="tel"
                          placeholder="+880 1XXX XXXXXX"
                          value={accountData.phone}
                          onChange={(e) => handleAccountChange("phone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <CountrySelector
                          value={accountData.country}
                          onChange={(value) => handleAccountChange("country", value)}
                          placeholder="Select your country..."
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Password Fields */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Create Password
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="account_password">Password *</Label>
                          <Input
                            id="account_password"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={accountData.password}
                            onChange={(e) => handleAccountChange("password", e.target.value)}
                            className={errors.account_password ? "border-destructive" : ""}
                          />
                          {errors.account_password && (
                            <p className="text-sm text-destructive">{errors.account_password}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account_confirmPassword">Confirm Password *</Label>
                          <Input
                            id="account_confirmPassword"
                            type="password"
                            placeholder="Re-enter password"
                            value={accountData.confirmPassword}
                            onChange={(e) => handleAccountChange("confirmPassword", e.target.value)}
                            className={errors.account_confirmPassword ? "border-destructive" : ""}
                          />
                          {errors.account_confirmPassword && (
                            <p className="text-sm text-destructive">{errors.account_confirmPassword}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Already have account link */}
                    {!showLoginPrompt && !showInlineLogin && (
                      <div className="rounded-lg bg-muted p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          Already have an account?{" "}
                          <button
                            type="button"
                            onClick={() => setShowInlineLogin(true)}
                            className="text-primary font-medium hover:underline"
                          >
                            Login here
                          </button>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Regular Form Step */}
              {!isAccountStep() && currentStepConfig && (
                <Card>
                  <CardHeader>
                    <CardTitle>{currentStepConfig.name}</CardTitle>
                    {currentStepConfig.description && (
                      <CardDescription>{currentStepConfig.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Render fields for current step */}
                    {currentStepConfig.fields.map((field) => renderField(field))}
                  </CardContent>
                </Card>
              )}

              {/* Final step - Terms and agreements */}
              {isFinalStep() && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Review & Submit</CardTitle>
                    <CardDescription>Please review and accept the terms to complete your order</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Order Summary for logged-in users */}
                    {loggedInUser && (
                      <div className="rounded-lg border p-4 bg-muted/50">
                        <h4 className="font-medium mb-2">Account</h4>
                        <p className="text-sm text-muted-foreground">{loggedInUser.name}</p>
                        <p className="text-sm text-muted-foreground">{loggedInUser.email}</p>
                      </div>
                    )}

                    {/* Account summary for new users */}
                    {!loggedInUser && (
                      <div className="rounded-lg border p-4 bg-muted/50">
                        <h4 className="font-medium mb-2">Your Account</h4>
                        <p className="text-sm text-muted-foreground">
                          {accountData.firstName} {accountData.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{accountData.email}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="font-semibold">Terms & Agreements</h3>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms"
                          checked={agreeTerms}
                          onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                        />
                        <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                          I agree to the{" "}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                      {errors.agreeTerms && (
                        <p className="text-sm text-destructive">{errors.agreeTerms}</p>
                      )}

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="disclaimer"
                          checked={understandDisclaimer}
                          onCheckedChange={(checked) => setUnderstandDisclaimer(checked as boolean)}
                        />
                        <Label htmlFor="disclaimer" className="text-sm leading-tight cursor-pointer">
                          I understand that LLCPad is a business formation service, not a law firm.
                          This is not legal advice.
                        </Label>
                      </div>
                      {errors.understandDisclaimer && (
                        <p className="text-sm text-destructive">{errors.understandDisclaimer}</p>
                      )}

                      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                        <Shield className="h-4 w-4" />
                        <span>Your information is encrypted and securely stored.</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                {!isFinalStep() ? (
                  <Button onClick={handleNext} disabled={emailCheckStatus === "exists" && isAccountStep()}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isLoading} size="lg">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Submit Application - ${serviceFee + (selectedState?.fee || 0)}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* FAQs Section */}
              {formConfig.faqs.length > 0 && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {formConfig.faqs.map((faq, index) => (
                      <Collapsible
                        key={index}
                        open={faqOpen === index}
                        onOpenChange={() => setFaqOpen(faqOpen === index ? null : index)}
                      >
                        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-muted/50">
                          <span className="font-medium">{faq.question}</span>
                          {faqOpen === index ? (
                            <ChevronUp className="h-4 w-4 shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 shrink-0" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-4 pt-2 text-muted-foreground">
                          {faq.answer}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {service?.name}
                        {selectedPackage && (
                          <span className="ml-1 text-xs">({selectedPackage.name})</span>
                        )}
                      </span>
                      <span className="font-medium">${serviceFee}</span>
                    </div>
                    {selectedState && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">State Fee ({selectedState.name})</span>
                        <span className="font-medium">${selectedState.fee}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">
                      ${serviceFee + (selectedState?.fee || 0)}
                    </span>
                  </div>

                  {/* Service Features */}
                  {selectedPackage?.features && (
                    <div className="mt-6 space-y-2">
                      <p className="text-sm font-medium">What&apos;s Included:</p>
                      <ul className="space-y-1">
                        {selectedPackage.features.slice(0, 5).map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <Check className="h-4 w-4 text-primary shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Processing Time */}
                  <div className="mt-4 rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">Processing Time</p>
                    <p className="text-sm text-muted-foreground">
                      3-5 business days
                    </p>
                  </div>

                  {/* Guarantee */}
                  <div className="rounded-lg bg-muted p-3 text-center text-sm">
                    <p className="font-medium">100% Satisfaction Guarantee</p>
                    <p className="text-muted-foreground">30-day money back guarantee</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </TooltipProvider>
    </>
  );
}

function CheckoutLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading checkout...</p>
      </div>
    </div>
  );
}

export default function ServiceCheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <ServiceCheckoutForm />
    </Suspense>
  );
}
