'use client';

import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { ERROR_MESSAGES } from '@/messages/error.messages';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen items-center justify-center p-4">
          <ErrorPanel title={ERROR_MESSAGES.SERVER} onRetry={reset} />
        </div>
      </body>
    </html>
  );
}
