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


### Initial setup

Game Features and Modular Gameplay plugins allow you to organise code by encapsulating game functionality as a separate plugin called a "Game Feature". This has several benefits:
* Promotes the creation of smaller and independent features over large monolithic classes and systems.
* Improved dependency management between different components of a game, avoids accidental coupling that could happen when all code and assets are all kept together.

In order to get started, you'll need to enable the `Game Features` and `Modular Gameplay` plugins. Note that for Game Features to work the Asset Manager will need to be configured to support `GameFeatureData` as an asset type. The Unreal Editor should prompt you to auto-generate the necessary configuration when you restart after adding the Game Features plugin.

If you're using C++, you'll also need to add the `ModularGameplay` module to the build file of your project (`<project-name>.Build.cs`) in order to access `UGameFrameworkComponentManager`.


### UGameFrameworkComponentManager

`UGameFrameworkComponentManager` implements the `Extension Handling System` used to implement extensibility via Game Features. It's worth noting that this manager also implements support for `Initialization States`, but we won't discuss that here since it's not a functionality that's required to implement Modular Gameplay and Game Features.

The `Extension Handling System` manages 2 complementary entities: `Receivers`, and `Extension Handlers`.


#### Receivers

Receivers are Actors that register for extension via `UGameFrameworkComponentManager`. Only registered Actors are eligible to be extended via Game Features.

Actors register using `AddGameFrameworkComponentReceiver` in `PreInitializeComponents()`, unregister using `RemoveGameFrameworkComponentReceiver` in `EndPlay`, and send events destined for `Extension Handlers` using `SendGameFrameworkComponentExtensionEvent`. An example of this can be seen in [ModularPawn.cpp](https://github.com/guidorota/UE5_ModularFeaturesTest/blob/main/Source/ModularFeaturesTest/Private/ModularGameplayActorBase/ModularPawn.cpp).

It's worth noting that `ModularPawn` only sends the default `NAME_GameActorReady` event via `SendGameFrameworkComponentExtensionEvent`, but if needed you can send custom events as well (Lyra's `ULyraHeroComponent` sends `NAME_BindInputsNow`, which is then leveraged by `UGameFeatureAction_AddInputBinding`);


#### Extension Handlers (Actions)

Extension Handlers register to `UGameFrameworkComponentManager` and execute code that extends Receiver Actors. They're commonly referred to as GameFeatureActions, or Actions. Unreal provide various built-in GameFeatureActions, but you can create your own if you have specific needs.

Registering an Extension Handler can be done by adding a delegate via `AddExtensionHandler` (suitable for running custom logic, see [UGameFeatureAction_AddNiagara.cpp](https://github.com/guidorota/UE5_ModularFeaturesTest/blob/main/Source/ModularFeaturesTest/Private/GameFeatures/GameFeatureAction_AddNiagara.cpp) or any of Lyra's `UGameFeatureAction_*` classes), or by using `AddComponentRequest` (suitable if you just need to add a Component to an Actor, as done in the built-in `UGameFeatureAction_AddComponents`).

[UGameFeatureAction_AddNiagara.cpp](https://github.com/guidorota/UE5_ModularFeaturesTest/blob/main/Source/ModularFeaturesTest/Private/GameFeatures/GameFeatureAction_AddNiagara.cpp) is a basic custom GameFeatureAction that I created for illustration purposes. It spawns a Niagara System, and its basic functionality is implemented as follows:
* It extends `UGameFeatureAction`.
* The property `NiagaraSystemList` of type `FGameFeatureNiagaraSystemEntry` stored the Action's configuration. This configuration is validated via the `IsDataValid()` method.
* `OnGameFeatureActivating` and `OnGameFeatureDeactivating` are used to register and unregister a delegate that is invoked whenever a new GameInstance is started, and to execute on any world that has already been instantiated.


## Other resources

If you want dig deeper, you can find other information about Game Features and Modular Gameplay plugins here:
* [Game Features and Modular Gameplay @ dev.epicgames.com](https://dev.epicgames.com/documentation/en-us/unreal-engine/game-features-and-modular-gameplay-in-unreal-engine)
* [A video showcasing Modular Gameplay features in Valley of the Ancient and Fortnite](https://www.youtube.com/watch?v=7F28p564kuY&ab_channel=UnrealEngine), worth watching if you want to see how Epic is using Modular Gameplay in their own games