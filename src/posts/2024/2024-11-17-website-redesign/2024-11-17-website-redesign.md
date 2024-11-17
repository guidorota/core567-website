---
title: 'Core 567 website changes'
description: "A quick blog post about a few changes I made to this website."
date: 2024-11-17
tags:
  - personal
gallery:
  - image: ./src/posts/2024/2024-11-17-website-redesign/homepage-before.png
    alt: 'Homepage before the changes'
    caption: 'Homepage before the changes'
  - image: ./src/posts/2024/2024-11-17-website-redesign/post-before.png
    alt: 'Blog post before the changes'
    caption: 'Blog post before the changes'
  - image: ./src/posts/2024/2024-11-17-website-redesign/homepage-after.png
    alt: 'Homepage after the changes'
    caption: 'Homepage after the changes'
  - image: ./src/posts/2024/2024-11-17-website-redesign/post-after.png
    alt: 'Blog post after the changes'
    caption: 'Blog post after the changes'
---

I've just made a few changes to this website, and I'm documenting them here as a personal paper trail of the evolution of www.core567.com. Here are the changes:

* Changed fonts face. Titles and headings moved from Redhat to Faustina, and the rest of the text moved from Inclusive Sans to Source Sans 3.
* Slightly reduced font size.
* Increased line height, text leading, and letter spacing to improve readability.
* Removed the dedicated blog page. Now the homepage shows all blog posts, instead of the last 6 only. I'll review this choice once there's more content (probably add pagination).
* Changed page heading style.
* Fixed a bug in the Tailwind configuration that prevented fonts whose name has spaces in it to be rendered correctly in Safari.
* Fixed sitemap to include all pages, and not just those generated from a `.md` file.

Changes are implemented in commits between [244f9db](https://github.com/guidorota/core567-website/commit/244f9dba39f15740ad091544af0fafed2b5232cb) and [9980aa0](https://github.com/guidorota/core567-website/commit/9980aa0780b81883b0f2e59195667459cca0fa24) inclusive.

The changes above address the main gripes and readability issues I had with the previous version of this website, but there are various other improvements that I want to do once I have some time:

* Better automatic resizing of images (currently they're cut in a weird way).
* Remove unnecessary white space in blog post link cards.
* Better usage of colours.
* Improve homepage header.
* Reduce padding in lists.

## Before and after images

{% include "partials/gallery.njk" %}