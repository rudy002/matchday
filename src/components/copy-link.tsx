"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { messages } from "@/lib/messages";
import { useOrigin } from "@/lib/use-origin";

type CopyLinkProps = {
  id: string;
  label: string;
  path: string;
  hint?: string;
};

type CopyStatus = "idle" | "copied" | "failed";

export function CopyLink({ id, label, path, hint }: CopyLinkProps) {
  const origin = useOrigin();
  const [status, setStatus] = useState<CopyStatus>("idle");
  const url = `${origin}${path}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          readOnly
          value={url}
          className="h-11 text-base"
          onFocus={(event) => event.currentTarget.select()}
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 px-4 text-base"
          onClick={copy}
        >
          {status === "copied" ? <Check /> : <Copy />}
          {status === "copied"
            ? messages.created.copied
            : messages.created.copy}
        </Button>
      </div>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      <p role="status" className="text-sm text-destructive empty:hidden">
        {status === "failed" ? messages.created.copyFailed : null}
      </p>
    </div>
  );
}
