# Letter Shape Generator

Letter Shape Generator is a single-file particle typography tool. Type a word or phrase, tune the system, and export an animated text effect as code or media.

The core idea is simple: particles fill a glyph mask, breathe in place, then either loop between phrases or scatter until the user hovers.

## Modes

### Loop

Particles move through a sequence of phrases:

1. Hold the current phrase.
2. Scatter outward.
3. Re-form into the next phrase.

### Hover

Particles drift across the canvas until hover or touch. On interaction, they gather into the target text; when the interaction ends, they disperse again.

## Using it

Open `index.html`.

There is no build step, server, account, or network dependency. The tool runs offline.

The inspector controls:

- Looks: finished presets for quick direction.
- Text: up to 40 characters, including Chinese.
- Seed: reproducible composition.
- Shape: dots, bricks, or ASCII characters.
- Distribution: count, edge feather, opacity.
- Life: jitter, speed, breathing.
- Motion: phrase sequence and timing.
- Colors: palette, weight, and custom colors.
- Background: preset or custom canvas color.

## Export

### Code

The current settings can be baked into:

- Vanilla JavaScript
- React
- Vue
- Config JSON

The exported component carries the same particle engine used by the editor, so what ships is what was previewed.

### Media

- PNG: current frame at 1200 by 1200.
- WebM: frame-stepped capture for a complete loop or hover gesture.
- GIF: 480 by 480 at 14 fps, with an embedded GIF89a encoder.

## Implementation notes

- Deterministic particles: layout, mask sampling, and scatter targets are seeded.
- Real-time tuning: non-structural values are read every frame; structural values rebuild the particle pool only when needed.
- Performance: sprite caching for ASCII particles, direct canvas primitives for dots/bricks, and minimal per-particle state changes.
- Accessibility: keyboard-reachable controls, visible focus states, reduced-motion handling, and touch targets sized for mobile use.

## Public story

This repo is strongest as a compact design-engineering artifact:

- Product decision: two interaction modes instead of a generic particle toy.
- UX decision: a right-side inspector keeps the canvas central.
- Engineering decision: export real components, not screenshots.
- Quality decision: seed reproducibility and offline export.

## Lineage

The project was implemented from a particle-typography design brief credited to bycoraldesign. The application code, export system, interaction model, performance work, and product framing were built for this implementation.

Keep this note if the source brief or license requires public attribution.
