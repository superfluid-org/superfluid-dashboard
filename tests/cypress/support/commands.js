require('cypress-iframe');

// Preview deployments are protected by Vercel Authentication. When CI provides
// the project's automation bypass secret, attach it to the initial document
// request and ask Vercel to persist the bypass in a cookie for subsequent
// in-browser navigation and asset/API requests.
Cypress.Commands.overwrite('visit', (originalVisit, url, options = {}) => {
  const bypassSecret = Cypress.env('VERCEL_AUTOMATION_BYPASS_SECRET');

  if (!bypassSecret) {
    return originalVisit(url, options);
  }

  return originalVisit(url, {
    ...options,
    headers: {
      ...options.headers,
      'x-vercel-protection-bypass': bypassSecret,
      'x-vercel-set-bypass-cookie': 'true',
    },
  });
});
