import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { USER_ROUTES } from '@/constants/routes.constants';

/** Design "NotFound". */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 py-8 text-foreground">
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG lockup */}
      <img src="/brand/dx-lockup.svg" alt="DX Enterprise" className="h-9 w-auto self-start" />
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="flex max-w-[520px] flex-col items-center gap-5 text-center">
          <div aria-hidden className="flex items-center gap-3 text-[96px] leading-none font-semibold tracking-[-0.04em] text-primary sm:text-[120px]">
            4
            <span className="box-border size-[76px] rounded-full border-[14px] border-brand-green sm:size-24 sm:border-[18px]" />
            4
          </div>
          <h1 className="text-[28px] leading-9 font-semibold tracking-[-0.025em]">This page doesn&apos;t exist</h1>
          <p className="text-[15px] leading-[22px] text-muted-foreground">
            The link may be old, or the record was deleted. Check the address, or head back to where you started.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="lg" render={<Link href={USER_ROUTES.LOGIN} />}>
              Sign in again
            </Button>
            <Button size="lg" render={<Link href={USER_ROUTES.HOME} />}>
              Go home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
