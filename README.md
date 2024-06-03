# business-dashboard-ui
Contains business filing ledger, addresses, people, documents, and launch points for new filings

# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# pnpm
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# pnpm
pnpm run dev
```

## Production

Build the application for production:

```bash
# pnpm
pnpm run build
```

Locally preview production build:

```bash
# pnpm
pnpm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

# Proposed Technical Plan for Entity UIs
Current UIs:
  - business-filings-ui (business dashboard with filing ledger, annual report, address change, and director change - links out to business-edit-ui/business-create-ui for other filings)
  - business-edit-ui (handles several other filings such as change of name, alteration, etc.)
  - business-create-ui (handles several other filings such as incorporation, dissolution, etc.)
  - *business-ar* (In Development: will take over the Annual Report filing)
  - *business-dashboard-ui* (In Development: will take over the business dashboard / filings ledger portion of the business-filings-ui)
## Background
The 3 UIs managed by the Entities teams (business-filings-ui, business-edit-ui, business-create-ui) are in an older stack (Vue2) and it would be a very large effort to upgrade them all at once. BTR requires many changes to the business dashboard inside business-filings-ui.
## Plan
BTR will create an upgraded version of the *business dashboard* (front facing business summary including addresses, directors, filing ledger, etc. - see picture of existing app below) in its own repo https://github.com/bcgov/business-dashboard-ui.
- Filings launched via the business tombstone will work the same way (linking out to business-edit-ui / business-create-ui)
- Annual Report will link out to business-ar to fill out the form/submit.
- Change of Directors will link out to the business-filings-ui in the same way.
- Change of Address will link out to the business-filings-ui in the same way.

This will require minor changes in the entities UIs to link back to the new business-dashboard-ui on filing completion/cancelation or breadcrumb click.

This will allow the Entities teams to stay in the older stack and continue building out different filings as they want. The business dashboard will link out to any new filings they add so updates beyond what is already planned for BTR should be minor.

In the future, other teams could also help upgrade some of the other entities pieces incrementally if that is desirable (i.e. director change) as the business dashboard would simply link out to the new page for that filing.


