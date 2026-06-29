---
name: squad-spec
description: Implement every story in a spec scope — run /spec first to generate the scope
---

Read `.contextkit/commands/squad/squad-spec.md` and execute it.

Processes one story per invocation. With a slug, runs that scope only. Without a slug, runs ALL completed spec scopes in sequence — advances to the next scope automatically when one finishes.

Single scope: `$squad-spec 01-identity-auth`
All scopes:   `$squad-spec` (auto mode)
