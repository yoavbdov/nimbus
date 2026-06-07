# Rules — read this before running anything

These rules are mandatory and apply to every change in this project.

1. **Always use shadcn elements.** Build UI from shadcn/ui components. Do not
   hand-roll markup when a shadcn component exists for it.

2. **No state or functionality inside the component itself.** Components stay
   presentational — pass data and handlers in via props. Keep state, side
   effects, and business logic in the parent / hooks / containers.

3. **The code has to be very clear.** No spaghetti code. Write readable,
   easy-to-follow code with clear names and a simple, obvious structure.

4. **If you write an answer with both hebrew and english, make sure to use RTL in the answer.**
