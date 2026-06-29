import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const role = session.user?.role;
  if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing/subscription`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        cache: 'no-store',
      },
    ).catch(() => null);

    if (!response?.ok) {
      redirect('/pricing?reason=subscription');
    }

    const subscription = await response.json();
    if (!subscription.hasDashboardAccess) {
      redirect('/pricing?reason=subscription');
    }
  }

  return children;
}
