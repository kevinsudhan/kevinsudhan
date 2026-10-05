# Fonts

`geist.woff2` and `geist-mono.woff2` are subsets of [Geist and Geist Mono](https://github.com/vercel/geist-font)
(variable, weights 100–900), cut down to basic Latin plus a few punctuation marks so they can be
embedded in every SVG without making the images heavy. `metrics.json` holds each glyph's advance
width at weights 400/500/600, which `build.mjs` uses to wrap text and size pills.

Geist is © Vercel, in collaboration with basement.studio, and is licensed under the
[SIL Open Font License 1.1](https://github.com/vercel/geist-font/blob/main/LICENSE.TXT).

Glyphs outside the subset (arrows, for example) won't render in the embedded font — `build.mjs`
draws arrows as paths for that reason.
