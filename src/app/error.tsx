'use client';

import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { ERROR_MESSAGES } from '@/messages/error.messages';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ErrorPanel title={ERROR_MESSAGES.GENERIC} onRetry={reset} />
    </div>
  );
}
