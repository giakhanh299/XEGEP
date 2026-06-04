export type PushSubscriptionRecord = {
  id: string;
  endpoint: string;
  createdAt: string;
};

const subscriptions: PushSubscriptionRecord[] = [];

export function registerPushSubscription(endpoint: string) {
  const subscription: PushSubscriptionRecord = {
    id: `${Date.now()}`,
    endpoint,
    createdAt: new Date().toISOString()
  };
  subscriptions.push(subscription);
  return subscription;
}

export function listPushSubscriptions() {
  return subscriptions;
}
