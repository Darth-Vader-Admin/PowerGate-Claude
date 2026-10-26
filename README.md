# PowerGate on Zoho Catalyst

BMI's work-approval portal (Client + CSP), rebuilt from the Material Dashboard template as a
Catalyst project: a React web client plus one Advanced I/O function that talks to the existing
PowerGate Zoho Creator app.

```
powergate/
├── catalyst.json                 # Catalyst project config (client + functions)
├── powergate-client/             # React app (Catalyst web client)
│   ├── client-package.json       # Catalyst web client manifest
│   ├── public/                   # index.html (loads Catalyst Web SDK), embedded-login CSS
│   └── src/
│       ├── assets/               # ← YOUR existing assets folder goes here (not in this zip)
│       ├── api/                  # powergate.js = every API call; mockData.js for mock mode
│       ├── auth/                 # Catalyst Embedded Auth + role context
│       ├── components/           # layout (TopBar, Sidebar, AppShell) + shared UI
│       ├── config/               # app.js (URLs, rules), navigation.js (menus), brand.js
│       ├── data/faqs.js          # Help & FAQ content
│       ├── pages/                # auth / client / csp pages
│       └── theme/                # design tokens + MUI theme
└── functions/powergate_api/      # Advanced I/O function (Express)
    ├── catalyst-config.json
    ├── .env.example              # env vars to set in the Catalyst console
    └── src/
        ├── config.js             # env settings + Creator schema map (PLACEHOLDER link names)
        ├── creator.js            # Creator REST v2.1 client (token via Catalyst Connector)
        ├── auth.js / customer.js # Catalyst user -> role -> Creator customer
        └── routes/               # me, client, csp
```

## 1. Run the UI locally with sample data (no Catalyst needed)

```bash
cd powergate-client
npm install
echo "REACT_APP_USE_MOCK=true" > .env.local
npm start
```
Pick "Client" or "CSP" on the sign-in page. Console 404s for `/__catalyst/sdk/init.js` are expected in mock mode.

## 2. Catalyst setup

1. Create a Catalyst project in the BMI org, then from this folder run `catalyst init` and link it to that project
   (choose existing `catalyst.json`; this creates `.catalystrc`, which is gitignored).
2. Authentication → enable **Embedded Authentication** (conventional login form). Add your Catalyst web client domain to the authorized domains.
3. Authentication → User Management → Roles: create **CSP** and **Client** (names must match `CSP_ROLE_NAME` / `CLIENT_ROLE_NAME`).
   Invite users with the right role. Clients must use the email held as Primary or Authorized user on their Creator Customer record.
4. Zoho API Console (data centre of the Creator app) → Self Client → generate a refresh token with scopes
   `ZohoCreator.report.READ,ZohoCreator.report.UPDATE,ZohoCreator.report.CREATE,ZohoCreator.form.CREATE`
   (confirm the exact scope set against current Creator API docs — file upload in particular).
5. Serverless → Functions → `powergate_api` → Environment Variables: set everything in `functions/powergate_api/.env.example`.
6. Cache: the Catalyst Connector stores the access token in Catalyst Cache — make sure the project has the default cache segment.

## 3. Map the Creator schema (required before go-live)

Open `functions/powergate_api/src/config.js` → `schema`. Every report/form/field link name is a placeholder.
Replace each with the real link name from the PowerGate Creator app. The React app never sees Creator names,
so only this file changes. Also check:

- `tasks.values` matches the Approval Status dropdown values.
- `requests.allowedTypes` / `allowedPlans` match the Request_Form dropdowns (and `powerPlans` in `powergate-client/src/config/app.js`).
- `requests.fileFields` lists the file-upload fields on Request_Form (one file per field).
- `CREATOR_DATE_FORMAT` matches the Creator app's date format.

## 4. Serve and deploy

```bash
catalyst serve      # local, with real auth + function
catalyst deploy     # client + function
```
App URL: `https://<project-domain>/app/` (the client uses hash routes, e.g. `/app/#/client/dashboard`).

## API (all under `/server/powergate_api/api`)

| Method | Path | Who | Notes |
|---|---|---|---|
| GET | /me | any | role from Catalyst user role; clients must map to a Customer |
| GET | /client/summary · /client/tasks?view=pending\|decided\|all | Client | scoped to the user's Customer record |
| POST | /client/tasks/:id/decision | Client | `{decision: approve\|reject, note}`; ownership + Pending checked server-side |
| GET/POST | /client/profile · /client/requests | Client | POST is multipart (files[]) |
| GET | /csp/summary · /csp/tasks?view=pending\|sent\|mine\|all · /csp/projects?scope=mine\|all | CSP | |
| POST | /csp/tasks/:id/action | CSP | `{action: send\|approve\|reject}`; own tasks only; threshold rule |
| POST | /csp/tasks · /csp/projects | CSP | projects link to an existing Customer by primary email |

## Things to know

- **Writes are live.** Approve/reject/send PATCH real Creator records and will fire whatever "on edit" workflows
  the Creator app has (emails, battery recalcs). Test against a copy of the Creator app or sample records first.
- **API usage.** Each dashboard load is ~3–5 Creator calls (summary, tasks, customer lookup). `all` views are capped at
  1,000 records (`settings.creator.maxRecords`). File uploads are one call per file.
- **CSP threshold rule** (`CSP_APPROVAL_REQUIRES_THRESHOLD`): an assumption taken from the FAQ copy. Set to `false` if CSPs may approve any estimate.
- The Creator "Home Page" stays in Creator; set `creatorHomePageUrl` in `powergate-client/src/config/app.js` to show it in the client menu.
