---
title: 'Building Core 567 - Part 1'
description: 'A brief description of how this website was built.'
date: 2024-10-24
tags:
  - technology
---

This is the first of two blog posts where I will write about how I built Core 567.

In this first one, I will give you a brief description of the various tools I used to create this website ([source code available here](https://github.com/guidorota/core567-website)). In the next one, we'll go through how I deploy it to AWS and serve it to the world.

## The static site generator

I knew from the get-go that I wanted a completely static website to keep operating and maintenance costs low. Something I could just upload to S3 and serve without the need of any compute. I also didn't want to muck around with HTML directly every time I wanted to create a new post, so the choice to use a static website generator was an easy one. After a very quick search on Google (probably less than 10 minutes), I decided to give [11ty](https://www.11ty.dev/) a try.

11ty (pronounce eleventy) is a simple static website generator that takes template files as inputs, and processes them into something (mainly HTML, but it could be whatever). I'm currently using version 3.0.0, which at the time of writing is the latest available. The [official getting started guide](https://www.11ty.dev/docs/) is quite terse, perhaps to a fault, and barely scratches the surface of what can be done with this tool. Luckily there are plenty of other tutorials that go in greater details to introduce the various functionalities that 11ty provides. [Many are linked directly from the 11ty official documentation](https://www.11ty.dev/docs/tutorials/), but I personally found [11ty Recipies](https://11ty.recipes/) a very useful resource for getting started.


## Choosing an 11ty starter project

I didn't want to start completely from scratch, as that would have likely taken more than a week of spare time effort I had budgeted, so I went on the hunt for a starter project that I could reuse. [There's plenty linked directly from the 11ty official website](https://www.11ty.dev/docs/starter/), and after a quick browse I decided to use [Eleventy Excellent](https://eleventy-excellent.netlify.app/) as I overall liked its design and it had quite positive reviews.

What I didn't expect was that getting the code to work and behave the way I wanted took way longer than I originally thought, mainly due to the following issues:

* Lots of unnecessary indirection. This made it harder to understand what was going on in the starter, to the point that I decided to spend a couple of days to cleanup and simplify the codebase.
* There seems to be an issue between [11ty WebC](https://github.com/11ty/webc) and the [11ty Bundle Plugin](https://github.com/11ty/eleventy-plugin-bundle). Unfortunately I discovered this after having spent a considerable amount of time converting Eleventy Excellent to use [bundle postprocess transforms](https://www.11ty.dev/docs/plugins/bundle/#postprocess-the-bundle-output). I was able to monkey-patch the 11ty WebC plugin to address the issue, but in the end I decided to simplify things even further by not using the 11ty Bundle plugin. I'm now just manually bundling all stylesheet and scripts in a single bundle file, since their size is trivially small.
* There were quite a few features that I didn't want to support and that I removed. Like light/dark theme selector and support for yaml configuration.
* Rewrote a few plugins (e.g., Open Graph preview image generation).
* [Issues with hot reload when running in Docker via WSL2](https://www.11ty.dev/docs/watch-serve/#advanced-chokidar-configuration), which hit me as Core 567 was built mainly on a Windows machine using Dev Containers. Off topic, but Dev Containers are an excellent tool to manage development environments, and if you haven't done so yet you should really give it a try.

The list of things I want to fix or change is way longer than this, but through the power of fierceful prioritization I was able to contain the effort to get Core 567 up and running to about a week of work. I will probably continue tackling all the other issues that didn't make the cut in this first version of the site over the next few weeks.


## Any regrets?

If I could go back in time, I would spend more time testing out different static site generators.

I got quite frustrated after finding issues between the WebC and the Bundle plugins, to the point that I almost considered throwing everything in the bin and starting from scratch with a different tool. The amount of [open issues on the 11ty Github page](https://github.com/11ty/eleventy) also didn't give me good vibes.

But in the end sanity prevailed. I just stuck with what I had somce everything was mostly working, and avoided making this a "forever project".