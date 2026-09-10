# Product Notes

## Register

Product / creative tool.

## User

Designers and builders who want a small, local tool for generating animated typography assets and reusable web components.

## Product purpose

Letter Shape Generator turns text into a controllable particle system. It should be fast enough for exploration, deterministic enough for design iteration, and exportable enough to become part of another project.

Success criteria:

- The same seed recreates the same composition.
- Text stays centered and readable across single characters, words, and short phrases.
- Loop and hover modes feel intentionally different.
- Exported components match the editor output.
- The tool works offline by opening one HTML file.

## Product decisions

### Typography, not generic particles

The tool is about letterforms. The particle system exists to support glyph recognition, phrase transitions, and interaction, not to become an abstract simulation.

### Two clear modes

Loop mode is for motion assets. Hover mode is for interactive page elements. Keeping these separate makes the controls easier to understand and gives exported code a clearer purpose.

### Inspector on the right

The canvas stays visually dominant while the inspector behaves like a design-tool control panel. This matches the way designers tune properties while watching output.

### Seeded control

Randomness is useful only when it can be returned to. Seeds make the tool dependable enough for real design iteration.

### Export as reusable implementation

The code exports are production-oriented components, not examples. The exported engine includes the same behavior as the editor preview.

## Interaction model

- Looks give fast starting points.
- Text and seed stay near the top because they define the composition.
- Shape, distribution, life, motion, color, and background are grouped by mental model.
- Folded sections keep the first screen from becoming a wall of controls.
- Keyboard and touch interactions are first-class, not afterthoughts.

## Quality gates

- Confirm seed reproducibility.
- Confirm Chinese and English text fit the canvas.
- Confirm loop timing and hover/touch behavior.
- Confirm PNG, WebM, GIF, Vanilla, React, Vue, and JSON exports.
- Confirm reduced-motion behavior.
- Confirm keyboard navigation and focus visibility.

## Public story

Letter Shape Generator should be framed as a design-engineering tool:

- Product: turns animated typography into something configurable and exportable.
- Design: keeps creative control compact and scannable.
- Implementation: seeded particle engine, glyph-mask sampling, multiple render forms, and framework exports.
- QA: reproducible output, performance, accessibility, and export parity.
