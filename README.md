# WICKET Backend

**An open-source, self-hosted authentication system (Backend API)**

**Note:** WICKET is currently in development. Everything described here is part of the planned design and may change as the project evolves.

---

## What is WICKET?

WICKET is a free, open-source, self-hosted authentication system designed to provide an alternative to closed-source, paid providers such as Clerk or Auth0. It allows developers and businesses to retain full control over authentication without vendor lock-in, hidden costs, or reliance on third-party services.

> ⚠️ **Important:** This repository contains only the **backend service** of WICKET. The frontend is hosted separately at [https://github.com/vishwajeetsharma/wicket-frontend](https://github.com/vishwajeetsharma/wicket-frontend).

---

## Vision

- Make authentication easy, secure, and scalable for everyone—from individual developers to large enterprises.
- Support a wide range of authentication methods while remaining fully self-hosted.
- Provide a plug-and-play solution that can be integrated into projects with minimal setup.

---

## Planned Authentication Methods

- Username and password
- Email OTP and SMS OTP
- TOTP (Google Authenticator, Authy, etc.)
- Passkeys (passwordless login)
- Social logins (Google, GitHub, Microsoft)
- Two-Factor Authentication (2FA)
- Single Sign-On (SSO) and SAML 2.0
- Hardware device authentication and WebAuthn

---

## WICKET Backend (Fastify API)

This backend service is built with [Fastify](https://fastify.dev/) and [TypeScript](https://www.typescriptlang.org/) to power WICKET’s authentication system. It handles core logic, database interactions, and API endpoints for the frontend or any compatible client.

### Project Status

🚧 **Early Development Stage** 🚧

- Very early in development; features are **planned but not yet implemented**.
- Containerization and deployment workflows are not yet available.
- Steps to run a **beta server** will be added once the architecture stabilizes.

### Features (Planned)

- Modular, domain-driven structure (e.g., authentication, user management, sessions)
- PostgreSQL with Prisma ORM for persistence
- Valkey (Redis-compatible) for caching and session handling
- Strict validation using Zod
- JWT-based stateless authentication with secure HTTP-only cookies
- Support for TOTP, OTP, Passkeys, OAuth providers, and more

### Architecture

- **Fastify**: Web framework for speed and modularity
- **Domain separation**: Different features (auth, sessions, profiles) are maintained independently for scalability
- **TypeScript-first**: Ensures type safety and maintainability
- **PostgreSQL + Prisma**: Reliable and flexible database layer
- **Valkey**: Caching and distributed session handling

This modular structure allows developers to extend, replace, or integrate features without major rewrites.

### Development Notes

- Focus is on **planning and scaffolding** at this stage
- No production-ready instructions yet
- Contributions will be easier once the core architecture stabilizes

---

## Documentation

The documentation will eventually cover:

- Authentication methods
- Project design
- API design
- Setup and configuration
- Deployment and scaling

---

## Inspiration and Competition

WICKET is inspired by modern authentication providers like Clerk, Auth0, and Firebase Auth. Unlike these closed-source services, WICKET is **fully transparent, secure, and free to self-host**.

---

## Contributing

WICKET is an open-source, community-driven project. Contributions, feedback, and suggestions will be welcome once the project reaches a more stable phase.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
