# Social integrations

The first supported targets are Facebook Pages, eligible Instagram professional accounts, and LinkedIn. Each adapter must own OAuth state validation, minimum permissions, account eligibility, media upload, publication submission, status verification, token refresh/revocation, rate-limit handling, and capability discovery.

No provider connection is simulated by this codebase. Real operation requires developer applications, callback URLs, app review, approved scopes, encrypted token storage, and staging verification with real test accounts. Publication status must be updated from provider responses, not inferred from an accepted HTTP request.
