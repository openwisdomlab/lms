// Convex Auth Configuration
// Using @convex-dev/auth for authentication

export default {
  providers: [
    {
      // Configure your authentication providers here
      // Example with password authentication
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
