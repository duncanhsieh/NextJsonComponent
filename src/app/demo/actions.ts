'use server';

/**
 * demo/actions.ts
 *
 * Real Next.js Server Actions to demonstrate integration with NextJsonComponent.
 */

export async function submitDemoAction(formData: unknown) {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1500));

  let name = 'Guest';
  if (formData instanceof FormData) {
    name = (formData.get('name') as string) || 'Guest';
  } else if (typeof formData === 'object' && formData !== null) {
    name = (formData as any).name || 'Guest';
  }

  // Return some data to be injected into state._actions.submitDemo.result
  return {
    success: true,
    message: `Hello ${name}! 這封訊息來自 Next.js Server Action。`,
    timestamp: new Date().toLocaleTimeString(),
  };
}
