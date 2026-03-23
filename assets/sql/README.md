# EchoCampus SQL Flow

Use this order only:

1. `01_tables_relations.sql`
2. `02_functions_triggers_policies.sql`

Notes:
- `01` creates structural objects (tables, FKs, constraints, indexes).
- `02` applies RLS, policies, trigger functions, and auth-sync triggers.
- Re-running scripts is safe for most objects due to `if not exists`, `drop ... if exists`, and `create or replace`.
- Do not execute SQL snippets from `assets/*.txt` legacy summary files.
