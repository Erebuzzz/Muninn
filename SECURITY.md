# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | Yes                |
| < 1.0   | No                 |

---

## Reporting a Vulnerability

If you discover a security vulnerability within Muninn, please report it privately. Do not open public issues or pull requests detailing undisclosed vulnerabilities.

- **Primary Contact**: Kshitiz Kumar
- **Email**: [kshitiz23kumar@gmail.com](mailto:kshitiz23kumar@gmail.com)
- **GitHub**: [github.com/Erebuzzz](https://github.com/Erebuzzz)

Please include:
1. A clear description of the vulnerability and attack vector.
2. Step-by-step reproduction steps or proof-of-concept payload.
3. Impact assessment on user confidentiality or memory isolation.

You will receive an initial response acknowledging your report within 48 hours, followed by coordinated patch deployment.

---

## Core Security & Isolation Architecture

Muninn was built from the ground up around strict data isolation principles:

1. **Opt-In Session Boundaries**: Audio capturing is explicitly started and stopped by the user. There are no ambient, passive, or always-on listeners.
2. **Ephemeral Web Guest Sandboxing**: In unauthenticated web mode, recorded audio, transcripts, and crystallized claims exist solely within the browser tab memory (`sessionStorage`) and are never written to permanent server databases.
3. **Hardware Local-First Android APK**: Native tablet builds store transcripts and knowledge graphs locally on device flash storage via Android SharedPreferences. No network egress is initiated without explicit user consent.
4. **Sensitivity & Consent Gate**: All extracted statements pass through a sensitivity classifier. Confidential credentials, private figures, and off-the-record statements are automatically sequestered in the review gate under a strict **Default-Discard** policy. Flagged items are never committed to permanent storage unless approved by the user.
5. **Cryptographic Authentication**: Password hashing uses PBKDF2 with HMAC-SHA256, 100,000 iterations, and a unique 16-byte cryptographically secure random salt per user. Session tokens use JSON Web Tokens (JWT) signed with HS256.
