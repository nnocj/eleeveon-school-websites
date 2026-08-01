# Eleeveon public school websites — full drop-in

## 1. Public renderer project (`eleeveon-school-websites`)
Copy the contents of `public-app/` into the project root. The route replaces the temporary slug page.

Add to Vercel and `.env.local`:

```env
ELEEVEON_API_URL=https://YOUR-BACKEND-DOMAIN
```

The code uses the `@/` alias expected by a normal Next.js project. If your project does not define it, replace the two `@/app/...` imports in the route with relative imports.

## 2. NestJS backend
Copy `backend/src/public-websites/` to `src/public-websites/`.

Add `PublicWebsitesModule` to `AppModule.imports`:

```ts
import { PublicWebsitesModule } from './public-websites/public-websites.module';

@Module({ imports: [/* existing modules */, PublicWebsitesModule] })
export class AppModule {}
```

The module reads published website records from the existing `SyncRecord` store, resolves school/branch/staff/academic/announcement/calendar/media data, and returns a safe public snapshot.

## 3. Required publishing state
For a site to resolve:
- `websiteSettings.status` must equal `published`;
- `websiteSettings.eleeveonSlug` must equal the subdomain slug;
- pages and sections must have `status: published`;
- media must have `publicUrl` or `remoteUrl`.

## 4. CORS
Because the public renderer fetches server-to-server during rendering, browser CORS is not required for the page request. Keep the endpoint public and read-only.

## 5. Test
After deploying both projects, open:

```text
https://test.eleeveon.com
```

The temporary message is replaced by the selected website data and sections.
