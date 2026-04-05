"use client";

import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
        <Construction className="h-8 w-8 text-blue-600" />
      </div>
      <h1 className="mt-4 text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground">
        {description || "This feature is coming in a future phase."}
      </p>
    </div>
  );
}
