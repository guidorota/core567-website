---
title: 'Unreal Engine Game Features and Modular Gameplay'
description: "A quick run through Unreal Engine's Game Features and Modular Gameplay"
date: 2024-10-31
tags:
  - technology
  - 'unreal engine'
---

The [Lyra sample project](https://dev.epicgames.com/community/learning/paths/Z4/lyra-starter-game) is one of the few resources that I'm constantly referencing as part of learning to build games with Unreal Engine. It's a great resource to discover best practices and get insights on how to use engine features.

Epic provides [some written documentation about Lyra](https://dev.epicgames.com/documentation/en-us/unreal-engine/lyra-sample-game-in-unreal-engine?application_version=5.0) but it's far from being comprehensive, which means that to get a full understanding of how this game is put together, one has to dive into its source and reference various other documentation sources. For a total beginner this is not an easy task: Lyra uses multiple Unreal Engine subsystem and frameworks in an interconnected way, which means that in order to find how a specific technology is used familiarity with other ancyllary systems that support its implementation in Lyra is required.

Let me give a practical example: I wanted to understand how Lyra uses the Ability System, but its implementation is tightly coupled with Game Features and the Modular Gameplay Plugin. Unfortunately for me, I couldn't really find a satisfying primer on how Modular Gameplay works, which meant I had to do my own research. This post documents my findings, accompanied by a [project that showcases an isolated implementation of these systems](https://github.com/guidorota/UE5_ModularFeaturesTest).


## Game Features and Modular Gameplay

Game Features and Modular Gameplay plugins allow you to organise code by encapsulating game functionality as a separate plugin called a "Game Feature". This has several benefits:
* Promotes the creation of smaller and independent features over large monolithic classes and systems.
* Improved dependency management between different components of a game, avoids accidental coupling that could happen when all code and assets are all kept together.

In order to get started, you'll need to enable the following plugins:
* `Game Features`
* `Modular Gameplay`

Note that you'll also need to add a <ASSET TO SCAN, CONTINUE HERE>

If you're using C++, you'll also need to add the `ModularGameplay` module to the build file of your project (`<project-name>.Build.cs`).


## Other resources

If you want dig deeper, you can find other information about Game Features and Modular Gameplay plugins here:
* [Game Features and Modular Gameplay @ dev.epicgames.com](https://dev.epicgames.com/documentation/en-us/unreal-engine/game-features-and-modular-gameplay-in-unreal-engine)
* [A video showcasing Modular Gameplay features in Valley of the Ancient and Fortnite](https://www.youtube.com/watch?v=7F28p564kuY&ab_channel=UnrealEngine)

