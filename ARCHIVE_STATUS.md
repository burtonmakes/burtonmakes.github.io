# Burton Makes public archive status

This repository was first made public on June 9, 2026.

Active public maintenance ended on July 16, 2026. The repository and website remain public as a reference for how the portfolio, recruiter interface, Cocometric presentation, Astro pages, React components, Three.js model, and Cloudflare Worker prototype were originally built.

The original interfaces remain visible so other people can inspect and reuse the design patterns. Interactive services that would submit data or call a live backend are disabled in archive mode and display a clear unavailable message when used.

Ongoing Cocometric development now takes place in the private `burtonmakes/cocometric` repository.

## Archive behavior

- The visual site and original pages remain available.
- The recruiter workflow remains visible but does not send recruiter names, company information, role descriptions, or chat questions to a live service.
- The contact form remains visible but does not submit names, email addresses, or messages.
- The Cloudflare Worker source remains in the repository as historical reference, but the public archive does not depend on it.
- The public GitHub Pages build uses only the committed public snapshot and does not read from private repositories.
- New production features and infrastructure should not be added to this repository.
