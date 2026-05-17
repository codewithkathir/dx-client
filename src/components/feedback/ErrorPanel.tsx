import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ERROR_MESSAGES } from '@/messages/error.messages';
import { UI_MESSAGES } from '@/messages/ui.messages';
import { cn } from '@/lib/utils';

interface ErrorPanelProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorPanel({
  title = ERROR_MESSAGES.GENERIC,
  message,
  onRetry,
  className,
}: ErrorPanelProps) {
  return (
    <Card className={cn('border-destructive/30', className)}>
      <CardHeader className="flex flex-row items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {message ? <CardDescription>{message}</CardDescription> : null}
        </div>
      </CardHeader>
      {onRetry ? (
        <CardContent>
          <Button variant="outline" size="sm" onClick={onRetry}>
            {UI_MESSAGES.TRY_AGAIN}
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
