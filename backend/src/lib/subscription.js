const { getPlanEntitlements } = require('./plans');

const PAID_STATUSES = new Set(['active', 'trialing']);

const isAdminRole = (role) => role === 'ADMIN' || role === 'SUPERADMIN';

const hasDashboardAccess = (subscription, role) => {
  if (isAdminRole(role)) return true;
  if (!subscription || subscription.plan === 'free') return false;
  if (!PAID_STATUSES.has(subscription.status)) return false;

  return !subscription.currentPeriodEnd
    || new Date(subscription.currentPeriodEnd).getTime() > Date.now();
};

const serializeSubscription = (subscription, role) => ({
  plan: subscription?.plan || (isAdminRole(role) ? 'admin' : 'free'),
  status: subscription?.status || (isAdminRole(role) ? 'active' : 'inactive'),
  currentPeriodEnd: subscription?.currentPeriodEnd || null,
  cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
  hasDashboardAccess: hasDashboardAccess(subscription, role),
  entitlements: getPlanEntitlements(subscription?.plan, { isAdmin: isAdminRole(role) }),
});

module.exports = {
  hasDashboardAccess,
  isAdminRole,
  serializeSubscription,
};
