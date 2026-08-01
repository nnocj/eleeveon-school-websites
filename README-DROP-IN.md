# Eleeveon public school websites — connected drop-in

This package connects `*.eleeveon.com` to the existing Eleeveon Schools NestJS backend and renders published school pages through a real `WebsiteRenderer`, section renderer and template registry.

## A. `eleeveon-school-websites` project

Copy everything inside `public-app/` into the root of the public website project. Allow it to replace:

`app/sites/[slug]/[[...path]]/page.tsx`

The implementation adds:

- `app/lib/websites/api.ts`
- `app/lib/websites/pageResolver.ts`
- `app/lib/websites/WebsiteRenderer.tsx`
- `app/lib/websites/components.tsx`
- three template mappings
- website CSS
- route metadata, 404 and error boundaries

Add these variables locally and in Vercel:

```env
NEXT_PUBLIC_ROOT_DOMAIN=eleeveon.com
ELEEVEON_API_URL=https://eleeveon-schools-backend.onrender.com
```

`ELEEVEON_API_URL` is server-only and must not have the `NEXT_PUBLIC_` prefix.

## B. Eleeveon Schools NestJS backend

Copy:

`backend/src/public-websites/`

to:

`src/public-websites/`

Then add the module to the backend `AppModule`:

```ts
import { PublicWebsitesModule } from "./public-websites/public-websites.module";

@Module({
  imports: [
    // existing modules
    PublicWebsitesModule,
  ],
})
export class AppModule {}
```

The supplied module assumes your existing paths are:

```ts
../prisma/prisma.module
../prisma/prisma.service
```

That matches the common `src/prisma/` structure. Adjust only those two imports if your Prisma folder lives elsewhere.

## C. Required records

The public endpoint resolves a site only when:

- `websiteSettings.eleeveonSlug` matches the subdomain;
- `websiteSettings.status` is `published`;
- the website has at least one `websitePages` record with `status: published`;
- website sections have `status: published` and are active;
- public images have `publicUrl`, `remoteUrl`, `storageUrl`, or `cdnUrl`.

The endpoint is:

```text
GET /public-websites/:slug
```

Example:

```text
https://eleeveon-schools-backend.onrender.com/public-websites/test
```

## D. Deployment order

1. Add the backend module and deploy the Render backend.
2. Open the endpoint directly and confirm it returns JSON or a clear 404.
3. Copy the public app files and set the two Vercel environment variables.
4. Redeploy `eleeveon-school-websites`.
5. Publish a website whose Eleeveon slug is `test`.
6. Open `https://test.eleeveon.com`.

## E. Important architecture detail

The public renderer does not import Dexie. It receives a public-safe snapshot from the NestJS backend. The builder inside Eleeveon Schools may continue using the uploaded shared `websites/` engine for private preview and publishing.
