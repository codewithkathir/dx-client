import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { USER_ROUTES } from '@/constants/routes.constants';
import { ERROR_MESSAGES } from '@/messages/error.messages';
import { UI_MESSAGES } from '@/messages/ui.messages';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">{ERROR_MESSAGES.NOT_FOUND}</p>
      <Button render={<Link href={USER_ROUTES.HOME} />}>{UI_MESSAGES.GO_HOME}</Button>
    </div>
  );
}
