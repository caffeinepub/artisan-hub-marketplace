# Specification

## Summary
**Goal:** Implement a split payment system that allows artists to configure payment via Stripe API key or Stripe Connect, and enables automatic commission distribution between platform admin and artists on each sale.

**Planned changes:**
- Add optional `stripeApiKey` field to UserProfile data model for artists to store their Stripe secret keys
- Add payment configuration section to ArtistDashboard with form for Stripe API key input or Stripe Connect onboarding
- Add `adminStripeAccountId` field to backend storage for platform admin's Stripe account
- Add Stripe account configuration form to AdminDashboard for admin to configure payment details
- Implement `processSplitPayment` backend function to calculate commission split and coordinate payment distribution
- Update BuyNowButton to trigger split payment after successful checkout
- Add validation to prevent purchases when artist or admin payment configuration is incomplete

**User-visible outcome:** Artists can configure their payment method (Stripe API key or Stripe Connect) in their dashboard. Platform admin can configure their Stripe account in the admin dashboard. When a purchase is made, payments are automatically split between the artist and platform admin based on the configured commission rate. Buyers see clear error messages if payment configuration is incomplete.
