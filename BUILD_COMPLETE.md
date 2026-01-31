**Summary**
- Updated package description and default metadata to the Tally tagline. `package.json:4` `components/layout/Layout.tsx:13`
- Refreshed header/footer/dashboard and sign-in branding copy for Tally. `components/layout/Header.tsx:40` `components/layout/Footer.tsx:11` `components/Dashboard.tsx:203` `pages/sign-in.tsx:10`
- Updated README + public metadata assets and refreshed build completion notes. `README.md:1` `README.md:121` `public/site.webmanifest:4` `public/og-image.svg:12` `BUILD_COMPLETE.md:1`

**Build**
- `docker build -t tally:test .`

**Notes**
- Docker build succeeded; `npm ci` emitted deprecation warnings and reported 3 vulnerabilities.
- Changes committed and pushed to `origin/main`.