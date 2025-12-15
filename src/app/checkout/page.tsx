"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  User,
  Users,
  FileText,
  CreditCard,
  Shield,
  Loader2,
  AlertCircle,
  Info,
  Plus,
  Trash2,
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  cn,
  sanitizePhone,
  sanitizeName,
  sanitizeEmail,
  sanitizeText,
  sanitizePassportNumber,
  sanitizeZipCode,
  INPUT_LIMITS
} from "@/lib/utils";
import { StateSelector, type State } from "@/components/ui/state-selector";
import { CountrySelector, ELIGIBLE_COUNTRIES } from "@/components/ui/country-selector";
import { Header } from "@/components/layout/header";
import { toast } from "sonner";
import {
  PaymentGatewaySelector,
  type PaymentGateway,
} from "@/components/checkout/payment-gateway-selector";
import { PayPalButton } from "@/components/checkout/paypal-button";

const steps = [
  { id: 1, name: "Package", icon: Building2 },
  { id: 2, name: "LLC Details", icon: FileText },
  { id: 3, name: "Owner Info", icon: User },
  { id: 4, name: "Review", icon: FileText },
  { id: 5, name: "Payment", icon: CreditCard },
];

const llcTypes = [
  { value: "single", label: "Single-Member LLC", description: "One owner - simplest structure" },
  { value: "multi", label: "Multi-Member LLC", description: "Two or more owners" },
];

const managementTypes = [
  { value: "member", label: "Member-Managed", description: "Owners manage the business (most common)" },
  { value: "manager", label: "Manager-Managed", description: "Designated manager(s) run operations" },
];

interface LoggedInUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
}

// Service types for API response
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

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Services from API
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  // Logged-in user state
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);

  // Inline login state
  const [showInlineLogin, setShowInlineLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Service & Package selection
  const [selectedService, setSelectedService] = useState(
    searchParams.get("service") || "llc-formation"
  );
  const [selectedPackage, setSelectedPackage] = useState(
    searchParams.get("package") || "standard"
  );
  const [selectedState, setSelectedState] = useState<State | null>(null);

  // Payment state
  const [enabledGateways, setEnabledGateways] = useState<PaymentGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoadingServices(true);
      try {
        const response = await fetch("/api/services");
        if (response.ok) {
          const data = await response.json();
          setServices(data.services || []);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch initial state from URL
  useEffect(() => {
    const stateCode = searchParams.get("state");
    if (stateCode) {
      fetch(`/api/states?search=${stateCode}&limit=1`)
        .then((res) => res.json())
        .then((data) => {
          if (data.states && data.states.length > 0) {
            setSelectedState(data.states[0]);
          }
        })
        .catch(console.error);
    }
  }, [searchParams]);

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
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Pre-fill contact fields from logged-in user
  useEffect(() => {
    if (loggedInUser) {
      const nameParts = loggedInUser.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData((prev) => ({
        ...prev,
        ownerFirstName: prev.ownerFirstName || firstName,
        ownerLastName: prev.ownerLastName || lastName,
        ownerEmail: prev.ownerEmail || loggedInUser.email,
        ownerPhone: prev.ownerPhone || loggedInUser.phone || "",
      }));
    }
  }, [loggedInUser]);

  // Fetch enabled payment gateways
  useEffect(() => {
    const fetchGateways = async () => {
      try {
        const res = await fetch("/api/checkout/gateways");
        const data = await res.json();
        if (data.gateways && data.gateways.length > 0) {
          setEnabledGateways(data.gateways as PaymentGateway[]);
          // Auto-select if only one gateway
          if (data.gateways.length === 1) {
            setSelectedGateway(data.gateways[0] as PaymentGateway);
          }
        }
      } catch (error) {
        console.error("Error fetching gateways:", error);
      }
    };
    fetchGateways();
  }, []);

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
      // Dispatch event for header update
      window.dispatchEvent(new Event("user-auth-change"));
      toast.success(`Welcome back, ${data.user.name}!`);
    } catch {
      setLoginError("An error occurred. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [formData, setFormData] = useState({
    // LLC Details
    llcName: "",
    llcName2: "",
    llcName3: "",
    llcType: "single",
    managementType: "member",
    businessPurpose: "Any and all lawful business activities",
    businessIndustry: "",

    // Manager-Managed Options (only if managementType === "manager")
    managerType: "member" as "member" | "nonMember", // Member acts as manager OR hire non-member
    managingMemberIndex: 0, // Which member will be manager (0 = primary owner)
    nonMemberManager: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "US",
    },

    // Profit Distribution (for multi-member)
    profitDistribution: "proportional" as "proportional" | "equal" | "custom",

    // Owner/Member Information (Primary)
    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerCountry: "BD",
    ownerAddress: "",
    ownerCity: "",
    ownerPostalCode: "",
    ownerPassportNumber: "",
    ownerDateOfBirth: "",

    // Account Credentials (for customer login)
    password: "",
    confirmPassword: "",

    // Additional Members (for multi-member LLC)
    additionalMembers: [] as Array<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      country: string;
      ownershipPercentage: number;
    }>,

    // Ownership percentage for primary owner
    ownershipPercentage: 100,

    // Additional Options
    needsEIN: true,
    needsRegisteredAgent: true,
    needsBankingAssistance: false,
    expeditedProcessing: false,

    // Terms
    agreeTerms: false,
    agreeRefundPolicy: false,
    understandNotLegalAdvice: false,
  });

  const service = services.find((s) => s.slug === selectedService);
  const pkg = service?.packages.find(
    (p) => p.name.toLowerCase() === selectedPackage
  );

  const serviceFee = pkg?.price || 0;
  const stateFee = selectedState?.fee || 0;
  const expeditedFee = formData.expeditedProcessing ? 75 : 0;
  const total = serviceFee + stateFee + expeditedFee;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Apply field-specific sanitization
    switch (name) {
      case "ownerPhone":
        sanitizedValue = sanitizePhone(value);
        break;
      case "ownerFirstName":
      case "ownerLastName":
        sanitizedValue = sanitizeName(value, INPUT_LIMITS.firstName.max);
        break;
      case "ownerEmail":
        sanitizedValue = sanitizeEmail(value);
        break;
      case "ownerPassportNumber":
        sanitizedValue = sanitizePassportNumber(value);
        break;
      case "ownerPostalCode":
        sanitizedValue = sanitizeZipCode(value);
        break;
      case "ownerAddress":
        sanitizedValue = sanitizeText(value, INPUT_LIMITS.address.max);
        break;
      case "ownerCity":
        sanitizedValue = sanitizeText(value, INPUT_LIMITS.city.max);
        break;
      case "llcName":
      case "llcName2":
      case "llcName3":
        sanitizedValue = sanitizeText(value, INPUT_LIMITS.llcName.max);
        break;
      case "businessIndustry":
        sanitizedValue = sanitizeText(value, INPUT_LIMITS.businessIndustry.max);
        break;
      case "businessPurpose":
        sanitizedValue = sanitizeText(value, INPUT_LIMITS.description.max);
        break;
      case "password":
      case "confirmPassword":
        sanitizedValue = value.slice(0, INPUT_LIMITS.password.max);
        break;
      default:
        sanitizedValue = sanitizeText(value, 500);
    }

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Add a new member (for multi-member LLC)
  const addMember = () => {
    const currentTotal = formData.ownershipPercentage +
      formData.additionalMembers.reduce((sum, m) => sum + m.ownershipPercentage, 0);
    const remainingPercentage = Math.max(0, 100 - currentTotal);

    setFormData((prev) => ({
      ...prev,
      additionalMembers: [
        ...prev.additionalMembers,
        {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          country: "BD",
          ownershipPercentage: remainingPercentage,
        },
      ],
    }));
  };

  // Remove a member
  const removeMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalMembers: prev.additionalMembers.filter((_, i) => i !== index),
    }));
  };

  // Update a member's field
  const updateMember = (index: number, field: string, value: string | number) => {
    let sanitizedValue = value;
    if (typeof value === "string") {
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
        case "address":
          sanitizedValue = sanitizeText(value, INPUT_LIMITS.address.max);
          break;
        case "city":
          sanitizedValue = sanitizeText(value, INPUT_LIMITS.city.max);
          break;
        default:
          sanitizedValue = sanitizeText(value, 200);
      }
    }
    setFormData((prev) => ({
      ...prev,
      additionalMembers: prev.additionalMembers.map((member, i) =>
        i === index ? { ...member, [field]: sanitizedValue } : member
      ),
    }));
  };

  // Update non-member manager field
  const updateNonMemberManager = (field: string, value: string) => {
    let sanitizedValue = value;
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
      case "address":
        sanitizedValue = sanitizeText(value, INPUT_LIMITS.address.max);
        break;
      case "city":
        sanitizedValue = sanitizeText(value, INPUT_LIMITS.city.max);
        break;
      default:
        sanitizedValue = sanitizeText(value, 200);
    }
    setFormData((prev) => ({
      ...prev,
      nonMemberManager: { ...prev.nonMemberManager, [field]: sanitizedValue },
    }));
  };

  // Calculate total ownership percentage
  const totalOwnership = formData.ownershipPercentage +
    formData.additionalMembers.reduce((sum, m) => sum + m.ownershipPercentage, 0);

  // Validate individual field on blur
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "llcName":
        if (!value.trim()) return "LLC name is required";
        if (!value.toLowerCase().includes("llc")) return "LLC name must contain 'LLC'";
        return "";
      case "businessIndustry":
        if (!value.trim()) return "Please describe your business industry";
        return "";
      case "ownerFirstName":
        if (!value.trim()) return "First name is required";
        return "";
      case "ownerLastName":
        if (!value.trim()) return "Last name is required";
        return "";
      case "ownerEmail":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email";
        return "";
      case "ownerPhone":
        if (!value.trim()) return "Phone number is required";
        return "";
      case "ownerAddress":
        if (!value.trim()) return "Address is required";
        return "";
      case "ownerCity":
        if (!value.trim()) return "City is required";
        return "";
      case "ownerPassportNumber":
        if (!value.trim()) return "Passport number is required for international LLC owners";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        return "";
      default:
        return "";
    }
  };

  // Handle blur event for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!selectedState) {
        newErrors.state = "Please select a formation state";
      }
    }

    if (step === 2) {
      if (!formData.llcName.trim()) {
        newErrors.llcName = "LLC name is required";
      } else if (!formData.llcName.toLowerCase().includes("llc")) {
        newErrors.llcName = "LLC name must contain 'LLC'";
      }
      if (!formData.businessIndustry.trim()) {
        newErrors.businessIndustry = "Please describe your business industry";
      }

      // Multi-member validation
      if (formData.llcType === "multi") {
        if (formData.additionalMembers.length === 0) {
          newErrors.additionalMembers = "Multi-member LLC requires at least 2 members. Please add another member.";
        } else {
          // Validate each additional member
          formData.additionalMembers.forEach((member, index) => {
            if (!member.firstName.trim()) {
              newErrors[`member${index}FirstName`] = `Member ${index + 2} first name is required`;
            }
            if (!member.lastName.trim()) {
              newErrors[`member${index}LastName`] = `Member ${index + 2} last name is required`;
            }
            if (!member.email.trim()) {
              newErrors[`member${index}Email`] = `Member ${index + 2} email is required`;
            }
          });
        }
        // Check total ownership
        if (totalOwnership !== 100) {
          newErrors.ownership = `Total ownership must equal 100%. Current: ${totalOwnership}%`;
        }
      }

      // Manager-managed validation
      if (formData.managementType === "manager" && formData.managerType === "nonMember") {
        if (!formData.nonMemberManager.firstName.trim()) {
          newErrors.managerFirstName = "Manager first name is required";
        }
        if (!formData.nonMemberManager.lastName.trim()) {
          newErrors.managerLastName = "Manager last name is required";
        }
        if (!formData.nonMemberManager.email.trim()) {
          newErrors.managerEmail = "Manager email is required";
        }
        if (!formData.nonMemberManager.phone.trim()) {
          newErrors.managerPhone = "Manager phone is required";
        }
        if (!formData.nonMemberManager.address.trim()) {
          newErrors.managerAddress = "Manager address is required";
        }
        if (!formData.nonMemberManager.city.trim()) {
          newErrors.managerCity = "Manager city is required";
        }
      }
    }

    if (step === 3) {
      if (!formData.ownerFirstName.trim()) {
        newErrors.ownerFirstName = "First name is required";
      }
      if (!formData.ownerLastName.trim()) {
        newErrors.ownerLastName = "Last name is required";
      }
      if (!formData.ownerEmail.trim()) {
        newErrors.ownerEmail = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
        newErrors.ownerEmail = "Please enter a valid email";
      }
      if (!formData.ownerPhone.trim()) {
        newErrors.ownerPhone = "Phone number is required";
      }
      if (!formData.ownerAddress.trim()) {
        newErrors.ownerAddress = "Address is required";
      }
      if (!formData.ownerCity.trim()) {
        newErrors.ownerCity = "City is required";
      }
      if (!formData.ownerPassportNumber.trim()) {
        newErrors.ownerPassportNumber = "Passport number is required for international LLC owners";
      }
      // Only require password for non-logged-in users
      if (!loggedInUser) {
        if (!formData.password) {
          newErrors.password = "Password is required to create your account";
        } else if (formData.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        }
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }
    }

    if (step === 4) {
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = "You must agree to the terms";
      }
      if (!formData.understandNotLegalAdvice) {
        newErrors.understandNotLegalAdvice = "Please acknowledge this is not legal advice";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Don't allow going back from payment step if order is created
      if (currentStep === 5 && createdOrderId) {
        toast.error("Order already created. Please complete payment.");
        return;
      }
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Create order and proceed to payment (Step 4 -> Step 5)
  const handleCreateOrder = async () => {
    if (!validateStep(4)) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Service & Package
          serviceId: selectedService,
          serviceName: service?.name,
          packageId: selectedPackage,
          packageName: pkg?.name,

          // State
          stateCode: selectedState?.code,
          stateName: selectedState?.name,
          stateFee: stateFee,

          // LLC Details
          llcName: formData.llcName,
          llcNameAlt1: formData.llcName2,
          llcNameAlt2: formData.llcName3,
          llcType: formData.llcType,
          managementType: formData.managementType,
          businessPurpose: formData.businessPurpose,
          businessIndustry: formData.businessIndustry,

          // Manager Details (for manager-managed LLC)
          managerType: formData.managerType,
          nonMemberManager: formData.managementType === "manager" && formData.managerType === "nonMember"
            ? formData.nonMemberManager
            : null,

          // Profit Distribution (for multi-member)
          profitDistribution: formData.llcType === "multi" ? formData.profitDistribution : null,

          // Owner Information
          owner: {
            firstName: formData.ownerFirstName,
            lastName: formData.ownerLastName,
            email: formData.ownerEmail,
            phone: formData.ownerPhone,
            country: formData.ownerCountry,
            address: formData.ownerAddress,
            city: formData.ownerCity,
            postalCode: formData.ownerPostalCode,
            passportNumber: formData.ownerPassportNumber,
            dateOfBirth: formData.ownerDateOfBirth,
            ownershipPercentage: formData.ownershipPercentage,
            // Only include password for new users
            ...(loggedInUser ? {} : { password: formData.password }),
          },

          // Include userId for logged-in users
          ...(loggedInUser ? { userId: loggedInUser.id } : {}),

          // Additional Members
          additionalMembers: formData.additionalMembers,

          // Additional Services
          needsEIN: formData.needsEIN,
          needsRegisteredAgent: formData.needsRegisteredAgent,
          needsBankingAssistance: formData.needsBankingAssistance,
          expeditedProcessing: formData.expeditedProcessing,

          // Pricing
          serviceFee,
          expeditedFee,
          totalAmount: total,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto-login: store user data in localStorage
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("user-auth-change"));
        }
        // Store order ID and proceed to payment step
        setCreatedOrderId(data.orderNumber);
        setCurrentStep(5);
        window.scrollTo(0, 0);
        toast.success("Order created! Please complete payment.");
      } else {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error;
        toast.error(errorMsg || "Failed to submit application");
        console.error("Order creation failed:", data);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Stripe payment
  const handleStripePayment = async () => {
    if (!createdOrderId) return;

    setIsProcessingPayment(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: createdOrderId,
          serviceId: selectedService,
          packageId: selectedPackage,
          stateCode: selectedState?.code,
          llcName: formData.llcName,
          contactInfo: {
            fullName: `${formData.ownerFirstName} ${formData.ownerLastName}`,
            email: formData.ownerEmail,
            phone: formData.ownerPhone,
            country: formData.ownerCountry,
          },
          total,
          serviceFee,
          stateFee,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Stripe payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle PayPal payment success
  const handlePayPalSuccess = (transactionId: string) => {
    toast.success("Payment successful!");
    router.push(`/checkout/success?orderId=${createdOrderId}&gateway=paypal&txn=${transactionId}`);
  };

  // Handle PayPal payment error
  const handlePayPalError = (error: string) => {
    toast.error(error || "Payment failed. Please try again.");
  };

  // Show loading state while fetching services
  if (isLoadingServices) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-muted/30 py-8">
          <div className="container mx-auto flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg text-muted-foreground">
                Loading checkout...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <TooltipProvider>
        <div className="min-h-screen bg-muted/30 py-8">
          <div className="container mx-auto px-4">
            {/* Back Link */}
            <Link
              href="/"
              className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2",
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                    <span className="hidden text-sm font-medium sm:inline">
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 h-0.5 w-8 sm:w-12",
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
              {/* Step 1: Package & State Selection */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Your Package & State</CardTitle>
                    <CardDescription>
                      Choose the service package and formation state for your LLC
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Service */}
                    <div className="space-y-2">
                      <Label>Service</Label>
                      <Select
                        value={selectedService}
                        onValueChange={setSelectedService}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((s) => (
                            <SelectItem key={s.slug} value={s.slug}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Package */}
                    <div className="space-y-2">
                      <Label>Package</Label>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {service?.packages.map((p) => (
                          <div
                            key={p.name}
                            onClick={() => setSelectedPackage(p.name.toLowerCase())}
                            className={cn(
                              "cursor-pointer rounded-lg border p-4 transition-all",
                              selectedPackage === p.name.toLowerCase()
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "hover:border-primary/50"
                            )}
                          >
                            {p.isPopular && (
                              <Badge className="mb-2" variant="secondary">
                                Popular
                              </Badge>
                            )}
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-2xl font-bold text-primary">
                              ${p.price}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* State Selection */}
                    {selectedService === "llc-formation" && (
                      <div className="space-y-2">
                        <Label>Formation State *</Label>
                        <StateSelector
                          value={selectedState}
                          onChange={setSelectedState}
                          placeholder="Search for a state..."
                        />
                        {errors.state && (
                          <p className="text-sm text-destructive">{errors.state}</p>
                        )}
                        <div className="mt-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                          <div className="flex items-start gap-2">
                            <Info className="mt-0.5 h-4 w-4 shrink-0" />
                            <div>
                              <p className="font-medium">Recommended: Wyoming</p>
                              <p className="text-blue-600">
                                No state income tax, strong privacy, lowest annual fees ($60/year).
                                Perfect for international entrepreneurs.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expedited Processing */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">Expedited Processing</p>
                        <p className="text-sm text-muted-foreground">
                          Get your LLC formed in 1-2 business days (+$75)
                        </p>
                      </div>
                      <Checkbox
                        checked={formData.expeditedProcessing}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            expeditedProcessing: checked as boolean,
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: LLC Details */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>LLC Details</CardTitle>
                    <CardDescription>
                      Provide the details for your new LLC (2025 Requirements)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* LLC Name */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="llcName">
                            Preferred LLC Name *
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Must be unique in your state and end with LLC, L.L.C., or Limited Liability Company
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="llcName"
                          name="llcName"
                          placeholder="e.g., Global Ventures LLC"
                          value={formData.llcName}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={errors.llcName ? "border-destructive" : ""}
                        />
                        {errors.llcName && (
                          <p className="text-sm text-destructive">{errors.llcName}</p>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="llcName2">2nd Choice (Optional)</Label>
                          <Input
                            id="llcName2"
                            name="llcName2"
                            placeholder="Alternative name"
                            value={formData.llcName2}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="llcName3">3rd Choice (Optional)</Label>
                          <Input
                            id="llcName3"
                            name="llcName3"
                            placeholder="Another alternative"
                            value={formData.llcName3}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* LLC Type */}
                    <div className="space-y-3">
                      <Label>LLC Type *</Label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {llcTypes.map((type) => (
                          <div
                            key={type.value}
                            onClick={() => handleSelectChange("llcType", type.value)}
                            className={cn(
                              "cursor-pointer rounded-lg border p-4 transition-all",
                              formData.llcType === type.value
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "hover:border-primary/50"
                            )}
                          >
                            <p className="font-medium">{type.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {type.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Management Type */}
                    <div className="space-y-3">
                      <Label>Management Structure *</Label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {managementTypes.map((type) => (
                          <div
                            key={type.value}
                            onClick={() => handleSelectChange("managementType", type.value)}
                            className={cn(
                              "cursor-pointer rounded-lg border p-4 transition-all",
                              formData.managementType === type.value
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "hover:border-primary/50"
                            )}
                          >
                            <p className="font-medium">{type.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {type.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Manager-Managed Options */}
                    {formData.managementType === "manager" && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Manager Details</h3>
                          </div>
                          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                            <p>
                              A manager-managed LLC has designated manager(s) who handle day-to-day operations.
                              The manager can be a member (owner) or someone you hire externally.
                            </p>
                          </div>

                          <div className="space-y-3">
                            <Label>Who will manage the LLC? *</Label>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div
                                onClick={() => handleSelectChange("managerType", "member")}
                                className={cn(
                                  "cursor-pointer rounded-lg border p-4 transition-all",
                                  formData.managerType === "member"
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "hover:border-primary/50"
                                )}
                              >
                                <p className="font-medium">A Member (Owner)</p>
                                <p className="text-sm text-muted-foreground">
                                  One of the LLC members will serve as manager
                                </p>
                              </div>
                              <div
                                onClick={() => handleSelectChange("managerType", "nonMember")}
                                className={cn(
                                  "cursor-pointer rounded-lg border p-4 transition-all",
                                  formData.managerType === "nonMember"
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "hover:border-primary/50"
                                )}
                              >
                                <p className="font-medium">Non-Member Manager</p>
                                <p className="text-sm text-muted-foreground">
                                  Hire someone outside the LLC to manage
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Non-Member Manager Info */}
                          {formData.managerType === "nonMember" && (
                            <div className="space-y-4 rounded-lg border p-4">
                              <h4 className="font-medium">Non-Member Manager Information</h4>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Manager First Name *</Label>
                                  <Input
                                    value={formData.nonMemberManager.firstName}
                                    onChange={(e) => updateNonMemberManager("firstName", e.target.value)}
                                    placeholder="First name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Manager Last Name *</Label>
                                  <Input
                                    value={formData.nonMemberManager.lastName}
                                    onChange={(e) => updateNonMemberManager("lastName", e.target.value)}
                                    placeholder="Last name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Manager Email *</Label>
                                  <Input
                                    type="email"
                                    value={formData.nonMemberManager.email}
                                    onChange={(e) => updateNonMemberManager("email", e.target.value)}
                                    placeholder="manager@example.com"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Manager Phone *</Label>
                                  <Input
                                    value={formData.nonMemberManager.phone}
                                    onChange={(e) => updateNonMemberManager("phone", e.target.value)}
                                    placeholder="+1 XXX XXX XXXX"
                                  />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                  <Label>Manager Address *</Label>
                                  <Input
                                    value={formData.nonMemberManager.address}
                                    onChange={(e) => updateNonMemberManager("address", e.target.value)}
                                    placeholder="Street address"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>City *</Label>
                                  <Input
                                    value={formData.nonMemberManager.city}
                                    onChange={(e) => updateNonMemberManager("city", e.target.value)}
                                    placeholder="City"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Country</Label>
                                  <CountrySelector
                                    value={formData.nonMemberManager.country}
                                    onChange={(value) => updateNonMemberManager("country", value)}
                                    placeholder="Select country..."
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Multi-Member LLC - Additional Members */}
                    {formData.llcType === "multi" && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold">LLC Members & Ownership</h3>
                            </div>
                            <Badge variant={totalOwnership === 100 ? "default" : "destructive"}>
                              Total: {totalOwnership}%
                            </Badge>
                          </div>

                          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                              <p>
                                All members must be listed with their ownership percentage.
                                Total ownership must equal 100%.
                              </p>
                            </div>
                          </div>

                          {/* Primary Owner */}
                          <div className="rounded-lg border p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">Member 1 (Primary - You)</h4>
                              <Badge variant="secondary">Primary</Badge>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                              <div className="sm:col-span-2">
                                <p className="text-sm text-muted-foreground">Name will be provided in Step 3</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Ownership %</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={99}
                                  value={formData.ownershipPercentage}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      ownershipPercentage: parseInt(e.target.value) || 0,
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          {/* Additional Members */}
                          {formData.additionalMembers.map((member, index) => (
                            <div key={index} className="rounded-lg border p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium">Member {index + 2}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMember(index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>First Name *</Label>
                                  <Input
                                    value={member.firstName}
                                    onChange={(e) => updateMember(index, "firstName", e.target.value)}
                                    placeholder="First name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Last Name *</Label>
                                  <Input
                                    value={member.lastName}
                                    onChange={(e) => updateMember(index, "lastName", e.target.value)}
                                    placeholder="Last name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Email *</Label>
                                  <Input
                                    type="email"
                                    value={member.email}
                                    onChange={(e) => updateMember(index, "email", e.target.value)}
                                    placeholder="member@example.com"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Phone</Label>
                                  <Input
                                    value={member.phone}
                                    onChange={(e) => updateMember(index, "phone", e.target.value)}
                                    placeholder="+880 1XXX XXXXXX"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Address</Label>
                                  <Input
                                    value={member.address}
                                    onChange={(e) => updateMember(index, "address", e.target.value)}
                                    placeholder="Street address"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>City</Label>
                                  <Input
                                    value={member.city}
                                    onChange={(e) => updateMember(index, "city", e.target.value)}
                                    placeholder="City"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Country</Label>
                                  <CountrySelector
                                    value={member.country}
                                    onChange={(value) => updateMember(index, "country", value)}
                                    placeholder="Select country..."
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Ownership % *</Label>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={member.ownershipPercentage}
                                    onChange={(e) =>
                                      updateMember(index, "ownershipPercentage", parseInt(e.target.value) || 0)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Add Member Button */}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addMember}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Another Member
                          </Button>

                          {/* Profit Distribution */}
                          <div className="space-y-3 mt-4">
                            <Label>Profit & Loss Distribution</Label>
                            <div className="grid gap-3 sm:grid-cols-3">
                              <div
                                onClick={() => handleSelectChange("profitDistribution", "proportional")}
                                className={cn(
                                  "cursor-pointer rounded-lg border p-3 transition-all text-center",
                                  formData.profitDistribution === "proportional"
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "hover:border-primary/50"
                                )}
                              >
                                <p className="font-medium text-sm">Proportional</p>
                                <p className="text-xs text-muted-foreground">
                                  Based on ownership %
                                </p>
                              </div>
                              <div
                                onClick={() => handleSelectChange("profitDistribution", "equal")}
                                className={cn(
                                  "cursor-pointer rounded-lg border p-3 transition-all text-center",
                                  formData.profitDistribution === "equal"
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "hover:border-primary/50"
                                )}
                              >
                                <p className="font-medium text-sm">Equal</p>
                                <p className="text-xs text-muted-foreground">
                                  Split equally
                                </p>
                              </div>
                              <div
                                onClick={() => handleSelectChange("profitDistribution", "custom")}
                                className={cn(
                                  "cursor-pointer rounded-lg border p-3 transition-all text-center",
                                  formData.profitDistribution === "custom"
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "hover:border-primary/50"
                                )}
                              >
                                <p className="font-medium text-sm">Custom</p>
                                <p className="text-xs text-muted-foreground">
                                  Define in agreement
                                </p>
                              </div>
                            </div>
                          </div>

                          {totalOwnership !== 100 && (
                            <p className="text-sm text-destructive">
                              Total ownership must equal 100%. Current total: {totalOwnership}%
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    <Separator />

                    {/* Business Information */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessIndustry">
                          Business Industry/Activity *
                        </Label>
                        <Input
                          id="businessIndustry"
                          name="businessIndustry"
                          placeholder="e.g., E-commerce, Software Development, Consulting"
                          value={formData.businessIndustry}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={errors.businessIndustry ? "border-destructive" : ""}
                        />
                        {errors.businessIndustry && (
                          <p className="text-sm text-destructive">{errors.businessIndustry}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessPurpose">Business Purpose</Label>
                        <Textarea
                          id="businessPurpose"
                          name="businessPurpose"
                          value={formData.businessPurpose}
                          onChange={handleInputChange}
                          rows={2}
                          placeholder="Describe your business activities"
                        />
                        <p className="text-xs text-muted-foreground">
                          Most states accept "Any and all lawful business activities"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Owner Information */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Owner Information</CardTitle>
                    <CardDescription>
                      Required for LLC formation and EIN application (2025 FinCEN BOI Compliance)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Important Notice */}
                    <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          <p className="font-medium">Important Information (2025 Update)</p>
                          <p>
                            As of 2025, all LLC owners must provide identification for
                            Beneficial Ownership Information (BOI) reporting. International
                            owners need a valid passport.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Personal Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="ownerFirstName">First Name (as on passport) *</Label>
                          <Input
                            id="ownerFirstName"
                            name="ownerFirstName"
                            value={formData.ownerFirstName}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={errors.ownerFirstName ? "border-destructive" : ""}
                          />
                          {errors.ownerFirstName && (
                            <p className="text-sm text-destructive">{errors.ownerFirstName}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownerLastName">Last Name (as on passport) *</Label>
                          <Input
                            id="ownerLastName"
                            name="ownerLastName"
                            value={formData.ownerLastName}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={errors.ownerLastName ? "border-destructive" : ""}
                          />
                          {errors.ownerLastName && (
                            <p className="text-sm text-destructive">{errors.ownerLastName}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="ownerDateOfBirth">Date of Birth</Label>
                          <Input
                            id="ownerDateOfBirth"
                            name="ownerDateOfBirth"
                            type="date"
                            value={formData.ownerDateOfBirth}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownerPassportNumber">Passport Number *</Label>
                          <Input
                            id="ownerPassportNumber"
                            name="ownerPassportNumber"
                            value={formData.ownerPassportNumber}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder="Required for international owners"
                            className={errors.ownerPassportNumber ? "border-destructive" : ""}
                          />
                          {errors.ownerPassportNumber && (
                            <p className="text-sm text-destructive">{errors.ownerPassportNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Contact Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="ownerEmail">Email Address *</Label>
                          <Input
                            id="ownerEmail"
                            name="ownerEmail"
                            type="email"
                            value={formData.ownerEmail}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={errors.ownerEmail ? "border-destructive" : ""}
                          />
                          {errors.ownerEmail && (
                            <p className="text-sm text-destructive">{errors.ownerEmail}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownerPhone">Phone Number *</Label>
                          <Input
                            id="ownerPhone"
                            name="ownerPhone"
                            type="tel"
                            value={formData.ownerPhone}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder="+880 1XXX XXXXXX"
                            className={errors.ownerPhone ? "border-destructive" : ""}
                          />
                          {errors.ownerPhone && (
                            <p className="text-sm text-destructive">{errors.ownerPhone}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ownerCountry">Country of Residence *</Label>
                        <CountrySelector
                          value={formData.ownerCountry}
                          onChange={(value) => handleSelectChange("ownerCountry", value)}
                          placeholder="Select your country..."
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Account Section - Different for logged-in vs new users */}
                    {loggedInUser ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold">Your Account</h3>
                        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                              <User className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-green-800">{loggedInUser.name}</p>
                              <p className="text-sm text-green-600">{loggedInUser.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="font-semibold">Create Your Account</h3>

                        {/* Inline Login Option */}
                        {showInlineLogin ? (
                          <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-start gap-3 mb-4">
                              <LogIn className="h-5 w-5 text-amber-600 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-amber-800">Login to Your Account</h4>
                                <p className="text-sm text-amber-700">
                                  Login below to continue with your order.
                                </p>
                              </div>
                            </div>

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
                                    value={loginEmail}
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
                                    setLoginError("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <>
                            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                              <div className="flex items-start gap-2">
                                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                <p>
                                  Create a password to access your dashboard and track your application status after submission.
                                </p>
                              </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                  id="password"
                                  name="password"
                                  type="password"
                                  value={formData.password}
                                  onChange={handleInputChange}
                                  onBlur={handleBlur}
                                  placeholder="Min. 8 characters"
                                  className={errors.password ? "border-destructive" : ""}
                                />
                                {errors.password && (
                                  <p className="text-sm text-destructive">{errors.password}</p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                <Input
                                  id="confirmPassword"
                                  name="confirmPassword"
                                  type="password"
                                  value={formData.confirmPassword}
                                  onChange={handleInputChange}
                                  onBlur={handleBlur}
                                  placeholder="Re-enter password"
                                  className={errors.confirmPassword ? "border-destructive" : ""}
                                />
                                {errors.confirmPassword && (
                                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                                )}
                              </div>
                            </div>
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
                          </>
                        )}
                      </div>
                    )}

                    <Separator />

                    {/* Address */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Residential Address</h3>
                      <div className="space-y-2">
                        <Label htmlFor="ownerAddress">Street Address *</Label>
                        <Input
                          id="ownerAddress"
                          name="ownerAddress"
                          value={formData.ownerAddress}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder="House/Apartment, Road, Area"
                          className={errors.ownerAddress ? "border-destructive" : ""}
                        />
                        {errors.ownerAddress && (
                          <p className="text-sm text-destructive">{errors.ownerAddress}</p>
                        )}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="ownerCity">City *</Label>
                          <Input
                            id="ownerCity"
                            name="ownerCity"
                            value={formData.ownerCity}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={errors.ownerCity ? "border-destructive" : ""}
                          />
                          {errors.ownerCity && (
                            <p className="text-sm text-destructive">{errors.ownerCity}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownerPostalCode">Postal Code</Label>
                          <Input
                            id="ownerPostalCode"
                            name="ownerPostalCode"
                            value={formData.ownerPostalCode}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ownership Percentage */}
                    {formData.llcType === "single" && (
                      <div className="rounded-lg bg-muted p-4">
                        <p className="text-sm">
                          <span className="font-medium">Ownership:</span> 100% (Single-Member LLC)
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Review Your Application</CardTitle>
                    <CardDescription>
                      Please review all details before submitting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Service Summary */}
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold">Service Details</h3>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Service</span>
                          <span className="font-medium">{service?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Package</span>
                          <span className="font-medium">{pkg?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Formation State</span>
                          <span className="font-medium">{selectedState?.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* LLC Details Summary */}
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold">LLC Details</h3>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">LLC Name</span>
                          <span className="font-medium">{formData.llcName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type</span>
                          <span className="font-medium">
                            {llcTypes.find((t) => t.value === formData.llcType)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Management</span>
                          <span className="font-medium">
                            {managementTypes.find((t) => t.value === formData.managementType)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Industry</span>
                          <span className="font-medium">{formData.businessIndustry}</span>
                        </div>
                      </div>
                    </div>

                    {/* Owner Summary */}
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold">Owner Information</h3>
                      <div className="mt-3 space-y-1 text-sm">
                        <p className="font-medium">
                          {formData.ownerFirstName} {formData.ownerLastName}
                        </p>
                        <p className="text-muted-foreground">{formData.ownerEmail}</p>
                        <p className="text-muted-foreground">{formData.ownerPhone}</p>
                        <p className="text-muted-foreground">
                          {formData.ownerCity}, {ELIGIBLE_COUNTRIES.find((c) => c.code === formData.ownerCountry)?.name}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Agreements */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeTerms}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              agreeTerms: checked as boolean,
                            }))
                          }
                        />
                        <Label htmlFor="terms" className="text-sm leading-tight">
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
                          id="notLegalAdvice"
                          checked={formData.understandNotLegalAdvice}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              understandNotLegalAdvice: checked as boolean,
                            }))
                          }
                        />
                        <Label htmlFor="notLegalAdvice" className="text-sm leading-tight">
                          I understand that LLCPad is a business formation service, not a law firm.
                          This is not legal advice.
                        </Label>
                      </div>
                      {errors.understandNotLegalAdvice && (
                        <p className="text-sm text-destructive">{errors.understandNotLegalAdvice}</p>
                      )}
                    </div>

                    {/* Security Note */}
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                      <Shield className="h-4 w-4" />
                      <span>
                        Your information is encrypted and securely stored.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 5: Payment */}
              {currentStep === 5 && createdOrderId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Payment</CardTitle>
                    <CardDescription>
                      Order #{createdOrderId} - Choose your payment method
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {enabledGateways.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-medium">No Payment Methods Available</p>
                        <p className="text-muted-foreground">
                          Please contact support to complete your order.
                        </p>
                      </div>
                    ) : (
                      <>
                        <PaymentGatewaySelector
                          enabledGateways={enabledGateways}
                          selectedGateway={selectedGateway}
                          onSelect={setSelectedGateway}
                          disabled={isProcessingPayment}
                        />

                        {selectedGateway === "stripe" && (
                          <div className="space-y-4">
                            <Button
                              onClick={handleStripePayment}
                              disabled={isProcessingPayment}
                              className="w-full"
                              size="lg"
                            >
                              {isProcessingPayment ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Pay ${total} with Card
                                </>
                              )}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                              You will be redirected to Stripe's secure checkout
                            </p>
                          </div>
                        )}

                        {selectedGateway === "paypal" && (
                          <div className="space-y-4">
                            <PayPalButton
                              orderId={createdOrderId}
                              amount={total}
                              onSuccess={handlePayPalSuccess}
                              onError={handlePayPalError}
                              disabled={isProcessingPayment}
                            />
                          </div>
                        )}

                        {!selectedGateway && enabledGateways.length > 0 && (
                          <p className="text-center text-muted-foreground">
                            Please select a payment method above
                          </p>
                        )}
                      </>
                    )}

                    {/* Security Note */}
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                      <Shield className="h-4 w-4" />
                      <span>
                        Your payment is secure and encrypted. We never store your card details.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1 || (currentStep === 5 && createdOrderId !== null)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                {currentStep < 4 ? (
                  <Button onClick={handleNext}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : currentStep === 4 ? (
                  <Button
                    onClick={handleCreateOrder}
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Continue to Payment - ${total}
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
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
                        {pkg?.name} Package
                      </span>
                      <span className="font-medium">${serviceFee}</span>
                    </div>
                    {selectedState && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          State Fee ({selectedState.name})
                        </span>
                        <span className="font-medium">${stateFee}</span>
                      </div>
                    )}
                    {formData.expeditedProcessing && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Expedited Processing
                        </span>
                        <span className="font-medium">${expeditedFee}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">${total}</span>
                  </div>

                  {/* What's Included */}
                  <div className="mt-6 space-y-2">
                    <p className="text-sm font-medium">What's Included:</p>
                    <ul className="space-y-1">
                      {pkg?.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Timeline */}
                  <div className="mt-4 rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">Processing Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.expeditedProcessing
                        ? "1-2 business days"
                        : "3-5 business days"}
                    </p>
                  </div>

                  {/* Guarantee */}
                  <div className="rounded-lg bg-muted p-3 text-center text-sm">
                    <p className="font-medium">100% Satisfaction Guarantee</p>
                    <p className="text-muted-foreground">
                      30-day money back guarantee
                    </p>
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
        <p className="mt-4 text-lg text-muted-foreground">
          Loading checkout...
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutForm />
    </Suspense>
  );
}
