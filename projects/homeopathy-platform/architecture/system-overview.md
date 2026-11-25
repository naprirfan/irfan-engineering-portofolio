# System Overview

This document describes the high-level architecture of the Homeopathy E-commerce Platform.

The platform is being developed for Classical Homeopathy Indonesia. It supports a public storefront and internal business operations through separate web applications that share a common data model and MySQL database.

> **Status:** Pre-launch. This document describes the intended/current logical architecture at a high level. It deliberately avoids exposing private implementation details, credentials, production hostnames, or customer data.

## Goals

- Provide a straightforward shopping experience without requiring customers to create accounts.
- Support order placement and manual payment confirmation using uploaded payment-receipt screenshots.
- Provide internal tools for managing products, orders, and operational workflows.
- Keep shared business data consistent across the storefront and internal dashboard.
- Keep the system understandable and maintainable by a small engineering team.

## Applications and responsibilities

| Component | Responsibility |
|---|---|
| Webstore | Public product discovery, cart/checkout, guest order placement, and payment-confirmation submission |
| Internal dashboard | Authenticated internal interface for business and order operations, including reviewing submitted payment evidence |
| Backend/API layer | Application services and business rules exposed to the web applications where applicable |
| Shared data-access layer | Reusable database access logic and TypeScript data models |
| MySQL | Persistent storage for products, orders, payments, and related business data |
| File storage | Stores uploaded payment-receipt images; the exact storage implementation is environment-specific |
| NGINX | Reverse proxy for the deployed web applications and API |
| PM2 | Process management for Node.js applications |

The webstore and internal dashboard are separate applications. They share the underlying business data rather than maintaining independent copies of products and orders.

## High-level architecture

At a logical level, customers interact with the webstore as guests. Internal users access the dashboard through authenticated routes. Application services and the shared data-access layer coordinate business operations against the MySQL database.

The diagram is intentionally logical rather than a deployment topology. It does not imply that every browser request travels through the same API endpoint or that the dashboard and storefront have identical data-access paths.

## Guest order and payment-confirmation workflow

The payment process is currently handled in-house; the platform does not initiate or verify payments through an integrated third-party payment gateway.

The typical workflow is:

1. A guest customer places an order through the storefront.
2. The application creates the order and its associated payment record with an initial status.
3. The customer makes the payment using the instructions provided by the business.
4. The customer returns to the webstore and submits a payment-confirmation form with screenshots of the payment receipt.
5. The application validates the submission and associates it with the relevant order/payment.
6. An internal user reviews the submitted evidence and records the verification outcome.
7. The order/payment status is updated to reflect the review.

A submitted receipt is evidence for review; it is not itself proof that the payment has been verified. The internal review step is therefore an important part of the workflow.

### Design considerations

- **Guest order access:** Customers do not need a registered account. The application must still ensure that a payment submission is associated with the correct order and that order-specific actions are appropriately protected.
- **Upload validation:** Uploaded files should be constrained by permitted file types and size. The current application has a 7 MB proof-upload limit.
- **State consistency:** Order and payment records must be updated consistently. Related database changes are handled transactionally where required.
- **Reviewability:** The internal workflow needs to distinguish a submitted receipt from a verified payment.
- **Failure handling:** Failed uploads or interrupted submissions should not leave the order in a misleading payment state.

## Data and application boundaries

The platform uses MySQL as its relational data store. A shared data-access layer and TypeScript models reduce duplication between applications and help keep access patterns consistent.

The exact ownership of each business operation remains in the application/service layer; the database is the persistent source of truth for order and payment records.

## Deployment overview

The applications are deployed on self-managed Linux infrastructure. NGINX acts as the reverse proxy, while PM2 manages the Node.js application processes. Environment-specific configuration is kept outside the public source repository.

This is a simplified deployment view. It omits provider-specific networking, backups, monitoring, and storage details that are not necessary for this public overview.

## Security and privacy notes

This public portfolio repository should contain only sanitized documentation and examples.

- Never commit environment files, secrets, access tokens, private keys, or production credentials.
- Do not publish real customer information, order records, or payment-receipt screenshots.
- Use synthetic data in screenshots and code samples.
- Do not expose internal administrative URLs or infrastructure identifiers.
- Keep any order lookup or guest-access mechanism protected against unauthorized access.

## Repository contents

```text
homeopathy-platform/
├── README.md
└── architecture/
    └── system-overview.md
```
