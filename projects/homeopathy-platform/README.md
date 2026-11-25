# Homeopathy E-commerce Platform

A full-stack e-commerce platform built to support the operations of a homeopathy business, including product discovery, guest checkout, order management, payment confirmation, and internal administration.

This project is part of my work as Co-Founder and Software Architect at Classical Homeopathy Indonesia. I have been responsible for the technical direction and hands-on implementation across the application stack, from architecture and database design to deployment and maintenance.

> **Project status:** Pre-launch  
> This repository contains a technical overview and selected, sanitized code samples. The production application and business-specific implementation are not publicly available.

## Project Overview

The platform consists of several applications that share a common backend and database:

- **Webstore** — customer-facing e-commerce application
- **Internal Dashboard** — administrative interface for managing business operations
- **Backend API** — application services and business logic
- **Shared Database Layer** — common data access and database infrastructure

The goal was to build a maintainable platform that could support the business's current needs while remaining flexible enough to evolve as the product and operational requirements grow.

## My Role

**Co-Founder & Software Architect**

I have been the primary technical owner of the platform, working across:

- Architecture and technology decisions
- Frontend and backend development
- Database schema and data access design
- Business logic and application workflows
- Authentication and authorization
- Order lifecycle and payment confirmation workflows
- Deployment, server configuration, and maintenance
- Technical mentoring and code quality

This is an end-to-end engineering project in which I work directly on both product requirements and their technical implementation.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Node.js, Express |
| Database | MySQL |
| Data Access | Custom ORM and shared TypeScript data models |
| Authentication | Auth.js / NextAuth |
| Monorepo | pnpm workspaces |
| Infrastructure | Linux, NGINX, PM2 |
| Deployment | Self-managed VPS |

The applications are organized in a pnpm workspace, allowing related projects to share code and development conventions while retaining separate application boundaries.

## Architecture

```text
                    ┌─────────────────────┐
                    │      Customers     │
                    │   (Guest Checkout) │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Webstore       │
                    │      Next.js       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Backend API     │
                    │      Express        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Shared Database  │
                    │       MySQL        │
                    └──────────▲──────────┘
                               │
                    ┌──────────┴──────────┐
                    │  Internal Dashboard│
                    │      Next.js       │
                    └─────────────────────┘
```

The webstore and internal dashboard are separate applications, but they operate on a shared data model.

The backend API encapsulates application services and business logic. The database layer provides a consistent way to access and manipulate shared data across the applications.

## Selected Engineering Challenges

### 1. Shared Data Architecture

The webstore and internal dashboard need to work with the same business entities, including products, orders, payments, and operational data.

Rather than duplicating database logic across applications, I built a shared data access layer and reusable TypeScript models.

This helps maintain consistency in how data is represented and accessed, while reducing duplication between applications.

### 2. Guest Checkout and Payment Confirmation

The platform uses a guest checkout model: customers can place orders without creating an account or logging in.

Since payment confirmation is handled in-house rather than through an integrated third-party payment gateway, the workflow is designed around customer-submitted payment evidence.

The typical flow is:

1. A customer places an order through the webstore.
2. The system creates an order with an initial payment status.
3. The customer completes the payment using the provided payment instructions.
4. The customer returns to the website and submits a payment confirmation form, including screenshots of the payment receipt.
5. The submitted confirmation is associated with the order for internal review.
6. The business reviews the submitted evidence and updates the payment status accordingly.

From an engineering perspective, this involves more than simply uploading an image. The application needs to maintain a consistent relationship between guest orders, payment records, and uploaded proof of payment.

The implementation also considers:

- Order and payment status management
- Secure association of payment submissions with the correct order
- File upload validation and storage
- Transactional updates to related records
- Controlled state transitions to prevent inconsistent order and payment states
- Internal workflows for reviewing payment confirmations

This approach keeps the payment process simple for customers while allowing the business to retain control over payment verification.

### 3. Authentication and Access Control

Although customers can shop and place orders as guests, the internal dashboard requires authentication and controlled access to administrative functionality.

I implemented authentication using Auth.js / NextAuth and designed the application around protected routes and role-based access control.

The objective is to keep administrative capabilities separate from the public customer-facing application.

### 4. Deployment and Operations

I manage the application deployment on Linux-based infrastructure.

The setup includes:

- NGINX as a reverse proxy
- PM2 for process management
- Environment-specific application configuration
- Server firewall configuration
- Application deployment and troubleshooting

Working directly with the infrastructure has given me practical experience beyond application development, particularly in understanding how software behaves in a real deployment environment.

## Repository Contents

This repository is intended to provide a technical view of the project without exposing the private production codebase.

```text
homeopathy-platform/
├── README.md
├── screenshots/
│   ├── storefront.png
│   ├── product-detail.png
│   └── dashboard.png
├── architecture/
│   ├── system-overview.md
│   └── diagrams/
└── code-samples/
    ├── payment-workflow/
    ├── database-access/
    └── application-architecture/
```

The examples are selected and sanitized to demonstrate the engineering concepts behind the project.

## What I Learned

Building this platform has reinforced several principles:

- Architecture should reflect actual business boundaries, not just framework conventions.
- Shared code is valuable when it improves consistency without creating unnecessary coupling.
- Guest checkout requires careful handling of order identity and customer access without relying on user accounts.
- File uploads and manual payment verification are business workflows that need proper validation and state management.
- Production reliability depends on operational practices as much as application code.
- Small teams benefit from simple, understandable systems that can be maintained without excessive ceremony.

## Future Development

As the platform evolves, areas of continued work include:

- Improving automated testing and observability
- Refining operational workflows
- Strengthening deployment and release practices
- Preparing the platform for production traffic
- Continuously improving maintainability as the business grows

---

**Built with a focus on practical architecture, reliable business workflows, and end-to-end ownership.**