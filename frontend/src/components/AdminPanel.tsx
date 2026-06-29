"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type UserItem = {
  id: string;
  name: string | null;
  email: string | null;
  role?: string | null;
  websites: Array<{ id: string; propertyName: string; websiteUrl: string }>;
  subscription: { plan: string; status: string } | null;
};

export default function AdminPanel({ compact, modalStyle }: { compact?: boolean; modalStyle?: boolean } = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [session, status, router]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to load users');
      } else {
        setUsers(data);
      }
    } catch (err) {
      setError('Unable to load users');
    }

    setLoading(false);
  };

  if (status === 'loading') return <div className="p-6 text-sm text-slate-400">Loading...</div>;

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPERADMIN') {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-400">You do not have access to this page.</p>
      </div>
    );
  }

  const wrapperClasses = modalStyle
    ? 'w-full max-w-5xl mx-auto rounded-2xl bg-[#0f1117] border border-[#2a2d3a] shadow-lg p-4 text-white'
    : 'min-h-screen bg-transparent text-white p-6';

  const innerContainer = modalStyle ? 'p-4' : 'max-w-6xl mx-auto';

  return (
    <div className={wrapperClasses}>
      <div className={innerContainer}>
        <div className={`mb-4 flex items-center justify-between ${modalStyle ? 'gap-2' : 'flex-col gap-4 md:flex-row md:items-center md:justify-between'}`}>
          <div>
            <h1 className={`text-2xl ${modalStyle ? 'font-semibold' : 'text-3xl font-semibold'}`}>Admin Panel</h1>
            <p className="text-sm text-slate-400 mt-1">View user accounts, roles, and website assignments.</p>
          </div>
          {modalStyle ? (
            <div className="flex items-center gap-2">
              <button onClick={fetchUsers} className="text-sm bg-slate-800 px-3 py-1 rounded text-slate-200">Refresh</button>
            </div>
          ) : null}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="rounded-3xl border border-[#2a2d3a] bg-[#13151f] p-6">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            {loading ? (
              <p className="text-slate-400">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-slate-400">No user accounts found.</p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="rounded-3xl border border-[#2a2d3a] bg-[#0f1117] p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-medium">{user.name || 'Unnamed user'}</p>
                        <p className="text-sm text-slate-400">{user.email || 'No email'}</p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300">
                        Role: {user.role || 'USER'}
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-400">
                      <p>Websites: {user.websites?.length ?? 0}</p>
                      <p>Subscription: {user.subscription ? `${user.subscription.plan} / ${user.subscription.status}` : 'none'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#2a2d3a] bg-[#13151f] p-6">
            <h2 className="text-xl font-semibold mb-4">Admin access</h2>
            <p className="text-sm leading-6 text-slate-400">
              Only users with the role admin or superadmin can access this page. You can use the backend role management API to grant or revoke roles for users.
            </p>
            <div className="mt-6 rounded-2xl border border-[#2a2d3a] bg-[#0f1117] p-4 text-sm text-slate-400">
              <p className="font-medium text-white mb-2">Superadmin only</p>
              <p>This project includes a protected API endpoint to change user roles at:</p>
              <pre className="mt-3 rounded-xl bg-[#13151f] p-3 text-xs text-slate-300">POST /api/admin/users/:id/role</pre>
              <p className="mt-3">Only a superadmin may assign <span className="text-white">admin</span> or <span className="text-white">superadmin</span> roles.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
