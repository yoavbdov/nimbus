# Rules — read this before running anything

These rules are mandatory and apply to every change in this project.

1. **Always use shadcn elements.** Build UI from shadcn/ui components. Do not
   hand-roll markup when a shadcn component exists for it.

2. **No state or functionality inside the component itself.** Components stay
   presentational — pass data and handlers in via props. Keep state, side
   effects, and business logic in the parent / hooks / containers.

3. **The code has to be very clear.** No spaghetti code. Write readable,
   easy-to-follow code with clear names and a simple, obvious structure.

4. **If you write an answer with both hebrew and english, make sure to answer in proper RTL manner so if you write both English and Hebrew it will be easy to read.**

# Architecture — the established patterns (follow these, don't regress)

These are the conventions the codebase already uses. When adding or migrating a
feature, match them exactly instead of inventing a new approach.

5. **Firestore, multi-tenant (Option A).** Every entity is scoped under its club:
   `clubs/{clubId}/{players,courses,coaches,rooms,equipment,attendance,leagues,tournaments,events,relations,sessions}`.
   Active club is hard-coded to `DEMO_CLUB_ID = "demo-club"` for now. Collection
   map + path helpers live in [lib/firebase/collections.ts](lib/firebase/collections.ts).

6. **Naming: חוג = `course` everywhere** (data, hooks, components, Firestore, route
   `/courses`). Never call it `clubs`. UI label stays Hebrew "חוגים". `activity`
   is reserved for the umbrella grouping (course + tournament + event).

7. **Relationships live in the `relations` junction collection — never embedded**
   on the entity doc. One collection holds every link with uniform fields
   (`kind`, `subjectType`/`subjectId`, `targetType`/`targetId`, optional
   `role`/`status`). Writes go through [lib/firebase/data/relations.ts](lib/firebase/data/relations.ts)
   with DETERMINISTIC ids `${subjectId}__${kind}__${targetId}` (so add is
   idempotent and remove needs no query; the seed uses the same scheme). To show
   associations, read them live with the projection hook
   [useRelationNames.ts](hooks/relations/useRelationNames.ts) and merge the name
   arrays onto the entity in the panel hook — keep the maps separate per subject
   type (a coach and a player can share a name). Times live in `sessions`, not
   embedded either.

8. **Layering (strict).** Firestore reads/writes ONLY in `lib/firebase/data/*`
   (per-entity) or the generic live reader
   [useCollection](lib/firebase/useCollection.ts). Hooks compose that data and
   own all state/business logic. Components are presentational (rule 2). Never
   call Firestore from a component.

9. **Docs are keyed by name** (readable ids), so a relation's `targetId` already
   IS the display name — no id→name lookup needed. New records don't store
   associations; they simply start with no `relations`.

10. **Dropdown/filter options come from LIVE Firestore data, not the static mock
    arrays** (the mocks in `lib/*-data.ts` are legacy display data for
    not-yet-migrated modules). Thread live options down as an optional `options`
    prop with a static fallback so existing callers don't break.

11. **Seed is the source of truth for the DB.** [lib/seed-dataset.ts](lib/seed-dataset.ts)
    is curated and small; `npm run seed` clears + rewrites. Keep the intentional
    conflicts intact when editing it. The big `lib/*-data.ts` mock arrays are NOT
    seeded — don't seed from them.

12. **Migrate one module at a time, keeping the app compiling.** Match the
    already-migrated players/coaches modules as the reference. Run `npx tsc
    --noEmit` after changes; leave changed files lint-clean.
