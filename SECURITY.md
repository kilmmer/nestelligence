# Security Policy

## Reporting A Vulnerability

If you discover a security issue, please do not publish it publicly first.

Preferred process:

1. Report privately with a clear description.
2. Include reproduction steps and impact analysis.
3. Wait for acknowledgement and coordinated fix timeline.

## Scope

Security reports are especially relevant for:

- prompt/response data leakage
- secret/key handling
- unsafe tool execution
- injection vectors in provider payload handling
- insecure logging and redaction failures

## Sensitive Data Handling

By design, this library should allow:

- configurable redaction
- optional prompt/response logging
- strict control over trace payloads

## Dependency Security

- Keep provider SDK dependencies up to date.
- Isolate provider adapters to reduce blast radius.
- Review HTTP transport paths carefully.

## Disclosure

After patch release, security advisories should include:

- affected versions
- fixed versions
- migration or mitigation notes
