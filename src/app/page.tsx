import { redirect } from 'next/navigation';

import { USER_ROUTES } from '@/constants/routes.constants';

export default function HomePage() {
  redirect(USER_ROUTES.LOGIN);
}
