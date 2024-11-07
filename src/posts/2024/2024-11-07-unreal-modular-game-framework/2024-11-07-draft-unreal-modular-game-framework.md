---
title: 'Unreal Engine Game Features and Modular Gameplay'
description: "A quick run through Unreal Engine's Game Features and Modular Gameplay"
date: 2024-11-07
tags:
  - technology
  - 'unreal engine'
---

The [Lyra sample project](https://dev.epicgames.com/community/learning/paths/Z4/lyra-starter-game) is one of the resources that I'm constantly referencing as part of learning to build games with Unreal Engine. It's a great showcase of best practices, and allows me to get valuable insights on how to use engine features.

Epic provides [some written documentation about Lyra](https://dev.epicgames.com/documentation/en-us/unreal-engine/lyra-sample-game-in-unreal-engine?application_version=5.0) but unfortunately it's far from being comprehensive, which means that to get a full understanding of how this game is put together one has to dive into its source code and reference various other docs. Since Lyra uses multiple Unreal Engine subsystem and frameworks in an interconnected way, understanding how a certain feature is implemented can be a daunting task that requires familiarity with multiple ancyllary frameworks and plugins.

Let me give a practical example: I wanted to understand how Lyra uses the Ability System, but its implementation is tightly coupled with Game Features and the Modular Gameplay Plugin. Unfortunately for me, I couldn't really find a satisfying primer on how Modular Gameplay works, which meant I had to do my own research.

This post and the companion [sample project](https://github.com/guidorota/UE5_ModularFeaturesTest), which I strongly recommend you fork it and check it out if you want to follow along, document my findings.


## Game Features and Modular Gameplay

Game Features and Modular Gameplay plugins allow you to organise code by encapsulating game functionality as separate plugins called _"Game Features"_. This has several benefits:
* Promotes the creation of smaller and independent features over large monolithic projects.
* Improved dependency management between different components of a game, avoids accidental coupling that could happen when all code and assets are all kept together.
* Makes it easy to extract and reuse code and content in other projects.


### Initial setup

In order to get started, you'll need to enable the `Game Features` and `Modular Gameplay` plugins in your project. Note that for Game Features to work the Asset Manager will need to be configured to support `GameFeatureData` as an asset type. The Unreal Editor should prompt you to auto-generate the necessary configuration when you restart after adding the Game Features plugin.

If you're using C++, you'll also need to add the `ModularGameplay` module to the build file of your project in order to access `UGameFrameworkComponentManager` (in the companion project this is done in [`ModularFeaturesTest.Build.cs`](https://github.com/guidorota/UE5_ModularFeaturesTest/blob/main/Source/ModularFeaturesTest/ModularFeaturesTest.Build.cs#L11)).


### UGameFrameworkComponentManager

`UGameFrameworkComponentManager` implements the _"Extension Handling System"_ used to implement extensibility via Game Features. It's worth noting that this manager also implements support for _"Initialization States"_, but we won't discuss that here since it's not a functionality that's required to implement Modular Gameplay and Game Features.

Key to the Extension Handling System are these 2 complementary entities: _"Receivers"_, and _"Extension Handlers"_.


#### Receivers

Receivers are Actors that register for extension via `UGameFrameworkComponentManager`. Note that only registered Actors are eligible to be extended via Game Features.

Actors register using `AddGameFrameworkComponentReceiver` in `PreInitializeComponents()`, unregister using `RemoveGameFrameworkComponentReceiver` in `EndPlay`, and send events destined for `Extension Handlers` using `SendGameFrameworkComponentExtensionEvent`. An example of this can be seen in [`AModularPawn`](https://github.com/guidorota/UE5_ModularFeaturesTest/blob/main/Source/ModularFeaturesTest/Private/ModularGameplayActorBase/ModularPawn.cpp).

It's worth noting that `ModularPawn` only sends the default `NAME_GameActorReady` event via `SendGameFrameworkComponentExtensionEvent`, but if needed you can send custom events as well. An example of a custom event can be found in Lyra's `ULyraHeroComponent`, which sends `NAME_BindInputsNow` that's later leveraged by `UGameFeatureAction_AddInputBinding`.


#### Extension Handlers (Actions)

Extension Handlers register to `UGameFrameworkComponentManager`, and execute code that extends Receiver Actors. They're commonly referred to as _"GameFeatureActions"_, or _"Actions"_ within the editor's UI. Unreal provide various built-in GameFeatureActions, but you can create your own if you have specific needs.

Registering an Extension Handler can be done in two ways:
* Adding a delegate via `AddExtensionHandler` for running custom logic (see [`UGameFeatureAction_AddNiagara`](https://github.com/guidorota/UE5_ModularFeaturesTest/blob/main/Source/ModularFeaturesTest/Private/GameFeatures/GameFeatureAction_AddNiagara.cpp) or any of Lyra's `UGameFeatureAction_*` classes).
* Using `AddComponentRequest` if you just need to add a Component to an Actor (this is what the built-in `UGameFeatureAction_AddComponents` does).

The companion project implements a custom GameFeatureAction, called [`UGameFeatureAction_AddNiagara`](https://github.com/guidorota/UE5_ModularFeaturesTest/blob/main/Source/ModularFeaturesTest/Private/GameFeatures/GameFeatureAction_AddNiagara.cpp). It spawns a Niagara System, and its basic functionality is implemented as follows:
* It extends `UGameFeatureAction`.
* The property `NiagaraSystemList` of type `FGameFeatureNiagaraSystemEntry` stored the Action's configuration. This configuration is validated via the `IsDataValid()` method.
* `OnGameFeatureActivating` and `OnGameFeatureDeactivating` are used to register and unregister a delegate that is invoked whenever a new GameInstance is started, and to execute on any world that has already been instantiated.
* `AddToWorld` takes care of registering the delegate that will add/remove the Niagara System via the aforementioned `AddExtensionHandler`.

As mentioned before, other GameFeatureActions examples can be found in engine code and in Lyra by searching for classes that start with `UGameFeatureAction_*`. An interesting one is `UGameFeatureAction_AddInputContextMapping`, which also overrides `OnGameFeatureRegistering` and `OnGameFeatureUnregistering`. These overrides are used to add / remove Input Context Mappings to the user settings for all registered Game Features, even those that are not active yet, hence ensuring that all possible bindings are shown in the game's settings.


### Creating a Game Feature

Now let's put in practice what we learnt about Receivers and Extension Handlers by creating a Game Feature.

To create a Game Feature, from the Unreal Editor select `Edit -> Plugins -> Add -> Game Feature`. Note that:
* You can choose between _C++_ and _Content Only_ Game Features.
* Game Features must be located in the `Plugins/GameFeatures` subfolder of your project. This folder is automatically selected when creating a new Game Feature, so don't change it.

There are two main configuration settings for Game Features:
* `Edit -> Plugins -> Game Features -> <Your Game Feature Name> -> Edit`: This allows you to configure different aspects of the Game Feature, but the most important ones are _Initial State_ (self explanatory), and _Dependecies_. Dependencies are noteworthy because by default Game Features are not allowed to access assets and resources from other plugins. If you want to access another plugin's assets and resources, you'll need to add that plugin as an explicit dependency of your Game Feature.
* The _"Game Feature Data Asset"_, which can be opened at `Plugins -> <Your Game Feature Name>Content -> <Your Game Feature Name>` from the Content Browser. From here you can manually toggle the _Current State_ of the feature (useful to test stuff), but also add Game Feature _Actions_ (i.e., Extension Handlers with custom configuration).

Now let's look at a practical example. In the [companion project](https://github.com/guidorota/UE5_ModularFeaturesTest), there's a Game Feature called `SampleGameFeature`.

{% image "./src/posts/2024/2024-11-07-unreal-modular-game-framework/SampleGameFeature_DataAsset.png", "SampleGameFeature Data Asset", "SampleGameFeature Data Asset. Notice the two actions configured for this Game Feature." %}

This Game Feature contains two actions: one that adds a `UStaticMeshComponent` using the built-in `UGameFeatureAction_AddComponent` via a custom PawnComponent (`B_SamplePawnComponent`, [`SamplePawnComponent.cpp`](https://github.com/guidorota/UE5_ModularFeaturesTest/blob/main/Plugins/GameFeatures/SampleGameFeature/Source/SampleGameFeatureRuntime/Private/Components/SamplePawnComponent.cpp)), and another one that spanws a Niagara System through the custom [`UGameFeatureAction_AddNiagara`](https://github.com/guidorota/UE5_ModularFeaturesTest/blob/main/Source/ModularFeaturesTest/Private/GameFeatures/GameFeatureAction_AddNiagara.cpp) that I already described above.

In order to test the this sample Game Feature, open the companion project in the Unreal Editor, start a PIE session, open the Game Feature Data Asset, and toggle the Current State to Active. By doing so, a Sphere static mesh and a Niagara effect will be added to the instance of `B_SamplePawn` present in the level. As you might have already guessed, `B_SamplePawn` is an Actor that's registered with `UGameFrameworkComponentManager` by extending `AModularPawn`.

{% image "./src/posts/2024/2024-11-07-unreal-modular-game-framework/SampleGameFeature_NotActive.png", "Scene before activating the Game Feature", "Scene before activating the Game Feature. B_SamplePawn has no physical representation." %}

{% image "./src/posts/2024/2024-11-07-unreal-modular-game-framework/SampleGameFeature_Active.png", "Scene after activating the Game Feature", "Scene after activating the Game Feature. B_SamplePawn gets a mesh and a Niagara effect from SampleGameFeature." %}

## Conclusions and additional resources

Game Features and Modular Gameplay are not hard to understand once showcased in an example project that focusses on them in isolation.

If you want dig deeper, you can find other information about Game Features and Modular Gameplay plugins here:
* [Game Features and Modular Gameplay @ dev.epicgames.com](https://dev.epicgames.com/documentation/en-us/unreal-engine/game-features-and-modular-gameplay-in-unreal-engine).
* [A video showcasing Modular Gameplay features in Valley of the Ancient and Fortnite](https://www.youtube.com/watch?v=7F28p564kuY&ab_channel=UnrealEngine), worth watching to get inspiration from how Epic is using Modular Gameplay in their own games.
* [References to Modular Gameplay in the Valley of the Ancient Sample documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/valley-of-the-ancient-sample-game-for-unreal-engine#buildingmodulargameplay).