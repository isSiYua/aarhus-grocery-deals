# Security policy

## Supported version

Only the current `main` branch and the deployed GitHub Pages site are supported. Archived Atlanta data is retained for historical reference and is not an actively maintained service.

## Reporting a vulnerability or impersonation

Use GitHub's private vulnerability reporting entry:

<https://github.com/isSiYua/aarhus-grocery-deals/security/advisories/new>

Please do not publish exploit details, precise user location, credentials, or other personal data in a public issue. Include the affected URL/file, reproduction steps, impact, and a safe proof of concept when possible.

The project is free, has no payment flow, accepts no donations, and never asks for card details, MitID, passwords, or verification codes. Reports of fake fundraising, impersonation, malicious mirrors, or altered deal data are in scope.

## Security design

- Static GitHub Pages site with no application backend, account database, posting API, payment endpoint, or analytics SDK.
- HTTPS enforcement, restrictive content security policy, no-referrer policy, and safe external-link attributes.
- Geolocation is opt-in and processed locally; coordinates are neither transmitted nor persisted.
- Scheduled automation uses no repository secrets or model credentials, grants job-specific permissions, and pins every action to a full commit SHA.
- Pull requests run a read-only publication gate; repository-authored shopper text is rejected when it contains payment solicitation, credential requests, unexpected links, or script injection.
- New or ambiguous source products are withheld until reviewed; successful source refreshes remove withdrawn promotions.

Repository owners must also enable the external branch rules documented in `docs/GITHUB_REPOSITORY_PROTECTION.md`; those GitHub settings cannot be enforced by files in the repository alone.

Please allow reasonable time for investigation. Do not test by disrupting the public site, changing third-party data, or accessing another person's device or account.
