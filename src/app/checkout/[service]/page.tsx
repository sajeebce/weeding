"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { cn } from "@/lib/utils";
import { services } from "@/lib/data/services";
import {
  getServiceForm,
  type ServiceFormConfig,
  type FormField,
  type FormStep,
} from "@/lib/data/service-forms";
import { StateSelector, type State } from "@/components/ui/state-selector";
import { CountrySelector } from "@/components/ui/country-selector";
import { toast } from "sonner";

interface FormValues {
  [key: string]: string | boolean | number | File | null;
}

function ServiceCheckoutForm() {
  const params = useParams();
  const router = useRouter();
  const serviceSlug = params.service as string;

  const [formConfig, setFormConfig] = useState<ServiceFormConfig | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<FormValues>({});
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [understandDisclaimer, setUnderstandDisclaimer] = useState(false);

  // Load form configuration
  useEffect(() => {
    const config = getServiceForm(serviceSlug);
    if (config) {
      setFormConfig(config);
    }
  }, [serviceSlug]);

  // Get service info
  const service = services.find((s) => s.slug === serviceSlug);
  const serviceFee = service?.packages[0]?.price || 0;

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

  // Handle input changes
  const handleInputChange = (name: string, value: string | boolean | number | File | null) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
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

  const handleNext = () => {
    if (!formConfig) return;
    const currentStepConfig = formConfig.steps.find((s) => s.id === currentStep);
    if (currentStepConfig && validateStep(currentStepConfig)) {
      if (currentStep < formConfig.steps.length) {
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
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: serviceSlug,
          serviceName: service?.name,
          formData: formValues,
          totalAmount: serviceFee,
          stateCode: selectedState?.code,
          stateName: selectedState?.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        toast.success("Application submitted successfully!");
        router.push(`/checkout/success?orderId=${data.orderId}`);
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
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={fieldError ? "border-destructive" : ""}
              min={field.validation?.min}
              max={field.validation?.max}
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
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={fieldError ? "border-destructive" : ""}
              rows={3}
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

  if (!formConfig) {
    // If no form config, redirect to main checkout or show error
    if (serviceSlug === "llc-formation") {
      router.push("/checkout");
      return null;
    }
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold">Service Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The requested service checkout is not available.
          </p>
          <Link href="/services">
            <Button className="mt-4">Browse Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStepConfig = formConfig.steps.find((s) => s.id === currentStep);
  const isLastStep = currentStep === formConfig.steps.length;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4">
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
              {formConfig.steps.map((step, index) => (
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
                  {index < formConfig.steps.length - 1 && (
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
              <Card>
                <CardHeader>
                  <CardTitle>{currentStepConfig?.name}</CardTitle>
                  {currentStepConfig?.description && (
                    <CardDescription>{currentStepConfig.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Render fields for current step */}
                  {currentStepConfig?.fields.map((field) => renderField(field))}

                  {/* Final step - Terms and agreements */}
                  {isLastStep && (
                    <>
                      <Separator />
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
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                {!isLastStep ? (
                  <Button onClick={handleNext}>
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
                        Submit Application - ${serviceFee}
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
                      <span className="text-muted-foreground">{service?.name}</span>
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
                  {service?.packages[0]?.features && (
                    <div className="mt-6 space-y-2">
                      <p className="text-sm font-medium">What's Included:</p>
                      <ul className="space-y-1">
                        {service.packages[0].features.slice(0, 5).map((feature, index) => (
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
                      {service?.processingTime || "3-5 business days"}
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
