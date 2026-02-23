import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook that enables Elementor-style "click canvas element → expand sidebar accordion".
 * Returns getAccordionProps(fieldId) to spread on AccordionSection components.
 *
 * When activeFieldId matches a fieldId, returns { isOpen: true, onOpenChange }.
 * For non-matching fields, returns {} (uncontrolled mode).
 * After the user interacts with the accordion, control is released.
 */
export function useFieldAccordion(activeFieldId?: string | null) {
  const [forcedField, setForcedField] = useState<string | null>(null);
  const prevFieldRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (activeFieldId && activeFieldId !== prevFieldRef.current) {
      setForcedField(activeFieldId);
    }
    prevFieldRef.current = activeFieldId;
  }, [activeFieldId]);

  const getAccordionProps = useCallback(
    (fieldId: string) => {
      if (forcedField === fieldId) {
        return {
          isOpen: true as const,
          onOpenChange: () => setForcedField(null),
        };
      }
      return {};
    },
    [forcedField]
  );

  return { getAccordionProps };
}
