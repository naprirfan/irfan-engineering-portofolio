# Repertory Search

## Overview

The Repertory Search module provides a searchable, hierarchical interface for browsing homeopathic repertories, inspecting the remedies associated with rubrics, and adding selected rubrics to a case analysis.

A repertory can contain thousands of rubrics arranged in a hierarchy. For example:

```text
Mind
└── Memory
    └── Weakness of memory
        ├── for names
        ├── for words
        └── for places
```

The main challenge is to make this large hierarchy easy to search and navigate without requiring users to expand every parent node manually.

The search experience should help practitioners:

- Find rubrics quickly by name.
- Understand where a rubric belongs in the hierarchy.
- Browse parent and child rubrics.
- Inspect the remedies and grades associated with a rubric.
- Add selected rubrics to an active case analysis.

## Data model

The repertory feature is built around four main relationships:

```text
Repertories
    │
    └── Rubrics
          │
          ├── Rubrics (parent-child hierarchy)
          │
          └── Rubric Remedies
                    │
                    └── Remedies

Case Analyses
    │
    └── Analysis Rubrics
              │
              └── Rubrics
```

### Repertories

The `repertories` table represents a repertory as an independent source collection.

There are two types:

- **SYSTEM** — shared repertories available to practitioners.
- **CUSTOM** — repertories owned by an individual practitioner.

The `ownerUserId` field determines ownership. System repertories have no owner, while custom repertories belong to a practitioner.

A practitioner should only be able to access:
- Active system repertories.
- Their own active custom repertories.

Custom repertories belonging to other practitioners must not be exposed.

### Rubrics

Rubrics belong to a repertory and form a self-referencing hierarchy.

The `parentId` relationship is the canonical representation of the tree:

- `parentId = NULL` identifies a root rubric.
- A non-null `parentId` identifies a child rubric.

The examples in this document assume the rubric table contains these fields:

| Field | Purpose |
|---|---|
| `id` | Rubric identifier |
| `repertoryId` | Owning repertory |
| `parentId` | Parent rubric |
| `name` | Rubric name |
| `sortOrder` | Display order |
| `fullPath` | Optional materialized hierarchy path |

The exact field names should be adjusted to match the current database schema.

If maintained, `fullPath` can be useful for displaying breadcrumbs and supporting search. However, it should not replace the parent-child relationship as the authoritative hierarchy.

### Remedies and rubric relationships

The relationship between rubrics and remedies is represented by `rubric_remedies`.

A rubric can have multiple remedies, and a remedy can appear in multiple rubrics.

The `grade` belongs to the relationship, not to the remedy itself. This is important because a remedy can have different grades in different rubrics.

```text
Rubric A ── Remedy X (grade 3)
         └─ Remedy Y (grade 2)

Rubric B ── Remedy X (grade 1)
         └─ Remedy Z (grade 3)
```

### Case analysis

The `analysis_rubrics` table connects selected rubrics to a case analysis.

It stores case-specific information:

- `weight` — the importance assigned to a rubric in the analysis.
- `sortOrder` — the order in which rubrics appear.
- `notes` — additional practitioner notes.

The repertory used by an analysis should also be stored in the case analysis itself through a `repertoryId` reference.

This ensures that an analysis retains its original repertory context, even if the practitioner changes their default repertory later.

It is important to distinguish between:

- **Remedy grade:** The grade assigned to a remedy in a particular rubric.
- **Rubric weight:** The importance assigned to a selected rubric in a particular case analysis.

These values represent different concepts and should remain separate.

---

## Search and navigation strategy

The recommended approach is to combine database search with lazy-loaded tree navigation.

Search and browsing solve different problems:

- Search helps practitioners locate a rubric quickly.
- Tree navigation helps practitioners understand its context and explore related rubrics.

### 1. Scope every search to a repertory

A search request must include the selected `repertoryId`.

For example:

```http
GET /api/repertories/12/rubrics?q=memory
```

Before executing the search, the backend must verify that the practitioner can access the requested repertory.

This prevents users from searching custom repertories that belong to other practitioners.

### 2. Search rubric names and hierarchy context

Search should prioritize the most relevant matches.

A useful ranking strategy is:

1. Exact rubric name.
2. Rubric name starting with the search term.
3. Rubric name containing the search term.
4. Full hierarchy path containing the search term.

For example, searching for `memory` might return:

```text
Mind → Memory
Mind → Memory → Weakness of memory
Mind → Memory → Loss of memory
```

Showing the hierarchy path alongside each result is important. A rubric name alone may not provide enough context for a practitioner to determine whether it is relevant.

### 3. Use lazy loading for the rubric tree

Do not load the entire hierarchy when opening a repertory.

Instead:

1. Load root rubrics when the practitioner opens a repertory.
2. Load children when a parent rubric is expanded.
3. Load remedies when a rubric is selected.

This reduces the initial payload and avoids unnecessary database queries.

The UI should maintain the expanded tree state so practitioners can navigate without repeatedly losing their position.

### 4. Keep search results and tree navigation connected

When a practitioner selects a search result, the application should be able to navigate to that rubric in the tree.

A typical flow:

1. Practitioner searches for a rubric.
2. Application displays matching rubrics with their hierarchy paths.
3. Practitioner selects a result.
4. Application loads or expands the necessary parent nodes.
5. The selected rubric becomes visible in the tree.
6. The application displays its associated remedies and grades.

This provides a consistent experience between searching and browsing.

### 5. Separate browsing from adding to an analysis

Selecting a rubric for inspection should not automatically add it to a case analysis.

Instead, provide an explicit action such as **Add to analysis**.

This allows practitioners to explore a rubric and inspect its remedies before deciding whether it belongs in the current analysis.

---

## Database query examples

The following examples assume the rubric fields described earlier. Adapt them to the actual `rubrics` table definition and your custom ORM.

### Search rubrics

A basic implementation can use `LIKE`:

```sql
SELECT
    r.id,
    r.name,
    r.parent_id,
    r.full_path
FROM rubrics r
WHERE
    r.repertory_id = ?
    AND r.name LIKE ?
ORDER BY
    CASE
        WHEN LOWER(r.name) = LOWER(?) THEN 1
        WHEN LOWER(r.name) LIKE LOWER(?) THEN 2
        ELSE 3
    END,
    r.name
LIMIT ?;
```

Parameters:

1. `repertoryId`
2. `%searchTerm%`
3. `searchTerm`
4. `searchTerm%`
5. `limit`

This is a straightforward starting point. For production use, validate and escape user-provided `LIKE` wildcard characters (`%` and `_`) so they are treated as literal search characters when appropriate.

If `fullPath` is maintained, it can also be included in the search conditions.

### Load root rubrics

```sql
SELECT
    id,
    name,
    parent_id,
    sort_order
FROM rubrics
WHERE
    repertory_id = ?
    AND parent_id IS NULL
ORDER BY sort_order, name;
```

### Load child rubrics

```sql
SELECT
    id,
    name,
    parent_id,
    sort_order
FROM rubrics
WHERE
    repertory_id = ?
    AND parent_id = ?
ORDER BY sort_order, name;
```

The backend should verify that the parent rubric belongs to the requested repertory.

### Load remedies associated with a rubric

```sql
SELECT
    rem.id,
    rem.slug,
    rem.name,
    rem.abbreviation,
    rr.grade
FROM rubric_remedies rr
JOIN remedies rem
    ON rem.id = rr.remedy_id
WHERE rr.rubric_id = ?
ORDER BY rem.name;
```

This returns the remedies and their grades for the selected rubric.

### Suggested indexes

The following indexes may help the most common access patterns, assuming they do not already exist:

```sql
CREATE INDEX rubric_repertory_parent_sort_idx
ON rubrics (repertory_id, parent_id, sort_order);

CREATE INDEX rubric_repertory_name_idx
ON rubrics (repertory_id, name);
```

The first supports loading roots and children within a repertory. The second can help with repertory-scoped name lookups, particularly exact and prefix searches.

A normal B-tree index generally cannot efficiently accelerate a leading-wildcard search such as:

```sql
WHERE name LIKE '%memory%'
```

For a dataset with thousands of rubrics, `LIKE` may be an adequate starting point. Measure the actual query plan using `EXPLAIN ANALYZE` before introducing a more complex search solution.

If search performance becomes a bottleneck, evaluate MySQL FULLTEXT search or a dedicated normalized search representation. Check tokenization and minimum token length against actual rubric names before choosing FULLTEXT.

---

## Suggested API design

The following endpoints are illustrative. They can be adapted to the existing API conventions.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/repertories` | List accessible repertories |
| GET | `/api/repertories/:repertoryId/rubrics` | Search rubrics within a repertory |
| GET | `/api/repertories/:repertoryId/rubrics/roots` | Load root rubrics |
| GET | `/api/rubrics/:rubricId/children` | Load child rubrics |
| GET | `/api/rubrics/:rubricId/remedies` | Load remedies associated with a rubric |

All endpoints that access a rubric should validate its repertory ownership and the practitioner's access rights.

For example, a child-loading endpoint should not allow a caller to provide a parent rubric from another repertory.

---

## Frontend experience

A practical layout could contain three main areas:

```text
┌─────────────────────────────────────────────────────────────┐
│ Repertory: [ Select repertory                     ▼ ]       │
├─────────────────────────────────────────────────────────────┤
│ Search rubrics: [ memory                         ]          │
├──────────────────────────┬──────────────────────────────────┤
│ Rubric tree / Results    │ Selected rubric                  │
│                          │                                  │
│ Mind                     │ Weakness of memory               │
│  ├── Memory              │                                  │
│  │   ├── Weakness...     │ Remedies                         │
│  │   └── Loss...         │ ┌──────────────┬───────────────┐ │
│  └── Intelligence        │ │ Remedy       │ Grade         │ │
│                          │ ├──────────────┼───────────────┤ │
│                          │ │ Remedy A     │ 3             │ │
│                          │ │ Remedy B     │ 2             │ │
│                          │ └──────────────┴───────────────┘ │
│                          │                                  │
│                          │ [ Add to analysis ]               │
└──────────────────────────┴──────────────────────────────────┘
```

Recommended behavior:

- Keep the selected repertory visible.
- Debounce search input to avoid unnecessary requests.
- Paginate search results where necessary.
- Display hierarchy breadcrumbs for every result.
- Lazy-load tree children.
- Load remedies only when a rubric is selected.
- Preserve tree expansion state when moving between search and browsing.
- Clearly distinguish inspecting a rubric from adding it to an analysis.

For large result sets or trees, consider list virtualization to avoid rendering hundreds or thousands of nodes simultaneously.

---

## Performance considerations

Start with a simple implementation and optimize based on actual query performance.

Important considerations:

1. **Avoid loading the entire tree.** Use root and child queries.
2. **Scope all queries by repertory.** This also supports index selectivity.
3. **Avoid N+1 queries.** When displaying multiple search results, retrieve their hierarchy context efficiently rather than querying every parent individually.
4. **Paginate search results.** Do not return every matching rubric.
5. **Measure database performance.** Use `EXPLAIN ANALYZE` with realistic search terms and repertory sizes.
6. **Avoid premature infrastructure.** A database-backed search should be sufficient for the current scale unless measurements show otherwise.

If hierarchy breadcrumbs are expensive to calculate repeatedly, maintaining a `fullPath` field can be useful. However, updates to a rubric's name or parent must also update the affected descendants' paths.

---

## Security and data integrity

- Always validate access to a repertory before searching or browsing it.
- Never expose another practitioner's custom repertory.
- Verify that parent and child rubrics belong to the same repertory.
- Verify that a selected rubric belongs to the repertory associated with the active analysis.
- Prevent duplicate rubric entries in an analysis using the existing unique constraint on `(analysisId, rubricId)`.
- Keep remedy grades and analysis weights as separate values.
- Use parameterized queries for all search and lookup operations.

---

## Future improvements

Potential enhancements as the feature evolves:

- Better search ranking and relevance tuning.
- Search across rubric names and alternative terminology.
- Highlight matching text in search results.
- Keyboard navigation for faster repertory browsing.
- Recently viewed and frequently used rubrics.
- Efficient bulk loading of remedy data for multiple selected rubrics.
- Search performance monitoring and query-plan optimization.

The initial implementation should prioritize accurate search results, clear hierarchy context, and a responsive browsing experience over introducing a dedicated search engine or additional infrastructure.

## Summary

The core design principle is to keep the repertory hierarchy authoritative while making search a fast alternative way to navigate it.

Use `repertories` to isolate source collections, `rubrics.parentId` to represent the hierarchy, `rubric_remedies` to associate remedies and grades, and `analysis_rubrics` to preserve case-specific rubric selections and weights.

This gives the application a straightforward foundation that can scale with additional repertories and larger rubric collections without making the initial implementation unnecessarily complex.