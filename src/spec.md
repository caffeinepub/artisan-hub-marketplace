# Specification

## Summary
**Goal:** Add Terms and Conditions and Privacy Policy pages with footer links and required acceptance during registration.

**Planned changes:**
- Create Terms and Conditions page at /terms with placeholder template text
- Create Privacy Policy page at /privacy-policy with placeholder template text
- Add footer links to both legal pages in the Layout component
- Add required acceptance checkboxes to ProfileSetupModal for Terms and Privacy Policy
- Add required acceptance checkboxes to ArtistRegistration form for Terms and Privacy Policy
- Add termsAccepted and privacyPolicyAccepted boolean fields to UserProfile data model
- Implement backend validation to reject profile creation if legal documents are not accepted

**User-visible outcome:** Users can view Terms and Conditions and Privacy Policy pages from footer links, and must accept both documents via checkboxes before completing profile setup or artist registration.
