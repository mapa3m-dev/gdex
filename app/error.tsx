"use client";

import { useEffect } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { AlertCircleIcon, RefreshIcon } from "@/components/icons";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps): React.ReactElement {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader icon={<AlertCircleIcon className="w-5 h-5" />}>
          <CardTitle subtitle="An unexpected error occurred">
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            {error.message || "Please try again. If the problem persists, refresh the page."}
          </p>
          <Button
            onClick={reset}
            icon={<RefreshIcon className="w-4 h-4" />}
            variant="primary"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
