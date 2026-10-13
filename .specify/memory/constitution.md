<!--
Sync Impact Report
- Version change: N/A (uninitialized template) → 1.0.0
- Modified principles:
  - [PRINCIPLE_1_NAME] → I. Clean Architecture & Separation of Concerns
  - [PRINCIPLE_2_NAME] → II. Code Quality & Readability Standards
  - [PRINCIPLE_3_NAME] → III. Test-First & Automated Verification (NON-NEGOTIABLE)
  - [PRINCIPLE_4_NAME] → IV. Integration & Contract Testing
  - [PRINCIPLE_5_NAME] → V. Maintainability, Simplicity & Technical Debt Control
- Added sections:
  - Quality & Testing Standards (replaces [SECTION_2_NAME])
  - Development Workflow & Quality Gates (replaces [SECTION_3_NAME])
- Removed sections: None
- Templates requiring updates:
  - [UPDATED] .specify/templates/plan-template.md
  - [VERIFIED] .specify/templates/spec-template.md
  - [UPDATED] .specify/templates/tasks-template.md
- Follow-up TODOs: None
-->

# DoAnJ2EE Constitution

## Core Principles

### I. Clean Architecture & Separation of Concerns
All application modules MUST enforce strict separation of concerns across presentation, business/service logic, and data persistence layers.
- Controllers and UI handlers MUST only manage request/response mapping, input validation, and routing; they MUST NOT contain domain business rules or direct database queries.
- Services MUST encapsulate domain logic and transaction boundaries through well-defined interfaces and DTOs rather than exposing persistence entities directly to external consumers.
- Repositories and data access components MUST isolate persistence details so business rules remain independently testable without requiring a live database when unit testing.

**Rationale**: Strict layer boundaries prevent tight coupling, localize the blast radius of schema or UI changes, and keep the codebase modular as features scale.

### II. Code Quality & Readability Standards
All source code MUST adhere to consistent formatting, naming conventions, and static analysis rules with zero unresolved compiler or linter warnings.
- Classes, methods, and functions MUST adhere to the Single Responsibility Principle (SRP) and maintain low cyclomatic complexity; methods exceeding 40 lines or 3 levels of nesting MUST be refactored into smaller, well-named units.
- Magic numbers, hardcoded configuration strings, and commented-out dead code MUST NOT be committed; all constants and environment settings MUST be named and externalized.
- Every public API, service contract, and non-trivial algorithm MUST include clear documentation explaining intent, edge cases, and error conditions.

**Rationale**: Code is read far more often than it is written; consistent structure and self-documenting conventions minimize cognitive load during maintenance and onboarding.

### III. Test-First & Automated Verification (NON-NEGOTIABLE)
Every new feature, enhancement, and bug fix MUST be accompanied by automated tests that verify both happy-path behavior and boundary/error conditions before merge.
- Development MUST follow the Red-Green-Refactor cycle: write a failing test that defines the expected behavior, implement the minimal code required to pass, and refactor for cleanliness while keeping tests green.
- Unit tests MUST execute deterministically, in complete isolation, without network, filesystem, or external service dependencies.
- Bug fixes MUST begin with a regression test that reproduces the defect prior to applying the fix.

**Rationale**: Automated tests act as executable specifications and a safety net that enables fearless refactoring without regressions.

### IV. Integration & Contract Testing
All cross-component boundaries—including REST/HTTP endpoints, database repositories, authentication flows, and third-party adapters—MUST be verified by automated integration or contract tests.
- Database queries, custom ORM mappings, and schema migrations MUST be tested against a disposable test database instance or container to guarantee query correctness and transactional integrity.
- API endpoints MUST be validated against their documented request/response schemas, HTTP status codes, and error payloads.
- Breaking changes to shared contracts or schemas MUST be versioned or accompanied by an explicit migration path and updated contract tests.

**Rationale**: Unit tests alone cannot catch serialization mismatches, SQL dialect issues, or configuration wiring errors across system boundaries.

### V. Maintainability, Simplicity & Technical Debt Control
Solutions MUST follow YAGNI (You Aren't Gonna Need It) and favor simple, idiomatic patterns over speculative abstractions.
- New third-party libraries or frameworks MUST NOT be introduced when standard library or existing project utilities suffice; every added dependency MUST be justified in the implementation plan.
- Duplicate logic across three or more locations (Rule of Three) MUST be extracted into reusable, tested components.
- Technical debt incurred under delivery constraints MUST be tracked with an explicit issue reference (`TODO(#issue): context`) and remediated during the polish phase of the feature cycle.

**Rationale**: Unchecked complexity and dependency sprawl degrade build times, increase security surface area, and slow down future feature delivery.

## Quality & Testing Standards

- **Test Pyramid & Coverage**: Unit tests MUST cover >= 80% of domain/service branch logic, complemented by integration tests for all persistence and controller endpoints.
- **Error Handling & Observability**: Exceptions MUST never be silently swallowed. All unexpected errors MUST be logged with structured context (correlation ID, operation name, sanitized parameters) and translated into safe, user-friendly error responses without leaking stack traces.
- **Static Analysis & Formatting**: All commits MUST pass automated formatting, linting, and type/compiler checks prior to review.
- **Security Hygiene**: Secrets, credentials, and API keys MUST NOT be committed to version control; all external inputs MUST be validated and parameterized to prevent injection vulnerabilities.

## Development Workflow & Quality Gates

- **Specification Before Implementation**: Every feature MUST have an approved specification (`spec.md`) and implementation plan (`plan.md`) that passes the Constitution Check before feature code is written.
- **Independent User Story Increments**: Tasks (`tasks.md`) MUST be organized by prioritized user stories so each increment can be implemented, tested, and demonstrated independently.
- **Pre-Merge Quality Gate**: No pull request or branch merge is permitted unless:
  1. All unit, integration, and contract tests pass in the build pipeline.
  2. Static analysis and linter checks report zero errors.
  3. Changes adhere to the architectural layer boundaries defined in Principle I.

## Governance

This Constitution supersedes all ad-hoc practices and conventions within the DoAnJ2EE repository.
- **Amendment Procedure**: Any proposed modification to Core Principles or Governance rules MUST be documented with a clear rationale, reviewed by project maintainers, and accompanied by synchronous updates to `.specify/templates/`.
- **Versioning Policy**: The Constitution follows Semantic Versioning (`MAJOR.MINOR.PATCH`):
  - **MAJOR**: Backward-incompatible governance changes, principle removals, or fundamental redefinitions.
  - **MINOR**: Addition of new principles, new mandatory sections, or materially expanded quality gates.
  - **PATCH**: Wording clarifications, typo fixes, or non-semantic refinements.
- **Compliance Review**: Every implementation plan (`plan.md`), task list (`tasks.md`), and code review MUST explicitly verify compliance with these principles. Any exception MUST be documented and justified in the plan's `Complexity Tracking` table.

**Version**: 1.0.0 | **Ratified**: 2026-10-13 | **Last Amended**: 2026-10-13
