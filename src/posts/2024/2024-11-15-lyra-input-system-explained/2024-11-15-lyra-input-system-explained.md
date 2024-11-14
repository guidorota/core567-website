---
title: 'Lyra input system explained'
description: "A primer on input management in the Lyra sample project."
date: 2024-11-13
tags:
  - technology
  - 'unreal engine'
---

Going through the Lyra sample project is equal parts excitement and frustration. Excitement because it offers valuable insights into how Unreal Engine works, and how Epic Games builds software. Frustration because to really understand how Lyra works, one needs to be familiar (or acquire familiarity) with multiple Unreal Engine systems and frameworks. Epic provides [some documentation](https://dev.epicgames.com/community/learning/paths/Z4/lyra-starter-game) for this sample project, but it's far from being comprehensive.

In this post I'll go through how Lyra interacts with the Unreal Engine Enhanced Input System, primarily from a configuration perspective. Note that familiarity with Game Features and Modular Gameplay is required to get a complete understanding of the Lyra input system; if you need a refresher, read [Unreal Engine Game Features and Modular Gameplay](https://www.core567.com/blog/unreal-engine-game-features-and-modular-gameplay/).


## Overview

The Lyra input system can be largely split in two parts: Native and Ability `InputAction`s.

Native actions are mainly reserved for basic character movement: directional move, look via mouse and joystick, crouch, run. As we will see later, bindings for these actions is implemented in a fairly standard way.

Ability actions are used for activating Gameplay Abilities. Binding of ability input actions is implemented through Lyra-specific code, and heavily relies on the use of Gameplay Tags.

Given that Lyra relies on the Enhanced Input System, it shouldn't be a surprise that `InputAction`s and `InputMappingContext`s are at the basis of how user input is bound to the game. If you want to look at some examples, you can simply search for assets that start with `IMC_` (e.g., `IMC_Default`) and `IA_` (e.g., `IA_Crouch` or `IA_Weapon_Fire`).


## InputMappingContext configuration

Let's start with `InputMappingContext`. These mappings are configured using the _"Add Input Mapping"_ Game Feature Action (`UGameFeatureAction_AddInputContextMapping`). The `ShooterCore` Game Feature provides a good example of how these are configured:

{% image "./src/posts/2024/2024-11-15-lyra-input-system-explained/shootercore-gamefeature-dataasset.png", "ShooterCore Game Feature Data Asset.", "InputContextMapping via actions in the ShooterCore Game Feature Data Asset." %}

Looking at `UGameFeatureAction_AddInputContextMapping` reveals that Lyra's `InputMappingContext`s are registered at two different points in the lifecycle of a Game Feature:
* First, when the Game Feature is registered, i.e., the Game Feature is known to the engine but it's not active yet. In this state Lyra only adds `InputMappingContext` to the `UEnhancedInputUserSettings` to allow all potential key bindings to be editable in the user preferences of the game.
* Then, when the Game Feature is active. It is in this state that the `InputMappingContext` is actually registered via `UEnhancedInputLocalPlayerSubsystem::AddMappingContext()`, hence making the mappings active.


## Configuring InputActions and activating abilities

The setup for `InputAction`s in Lyra is somewhat difficult to understand due to the various layers of indirection used by this sample project. Configuration for input actions is stored in `ULyraInputConfig`. This allows Lyra game developers to specify if an input action is native or based on a gameplay ability, but also to select a Gameplay Tag that will be associated to the user's input.

Take for example `InputData_Hero`: this configuration specifies move, look, run, and crouch as native actions, and jump, reload, heal, dash, and fire as ability-based input actions.

{% image "./src/posts/2024/2024-11-15-lyra-input-system-explained/shootercore-gamefeature-inputdata_hero.png", "ShooterCore InputData_Hero asset.", "The InputData_Hero asset in the ShooterCore Game Feature contains the Input Action configuration for the pawn possessed by the user." %}

`ULyraInputConfig` data assets are loaded when the Game Mode loads an experience (`ULyraExperienceDefinition` -> `ULyraPawnData` -> `ULyraInputConfig`). Going a bit more in detail, `ALyraGameMode` loads a `ULyraExperienceDefinition`, and then sets the `ULyraPawnData` on the `ULyraPawnExtensionComponent` when spawning the player's pawn. Another component, of class `ULyraHeroComponent`, then reads `ULyraInputConfig` from `ULyraPawnExtensionComponent` to initialize the input action mappings.

The method where this initialization takes place is `ULyraHeroComponent::InitializePlayerInput()`. Looking at its source code, we can see that native input actions are managed using hardcoded Gameplay Tags (`InputTag.Move`, `InputTag.Look.Mouse`, etc.), each of which is bound to a very specific method. Apart from the indirection via Gameplay Tags, these bindings are very similar to what's taught in various Enhanced Input System tutorials.

Ability input actions are instead more interesting. Each ability input action is bound to a Gameplay Tag via callback methods bound in `ULyraInputComponent::BindAbilityActions`. These bindings, which leverage the `ULyraHeroComponent::Input_AbilityInputTagPressed` and `ULyraHeroComponent::Input_AbilityInputTagReleased` methods, are only tasked with informing the `ULyraAbilitySystemComponent` that a Gameplay Tag was pressed or released.

In a nutshell, when the user presses a button corresponding to an Ability input action, a Gameplay Tag is passed on to `ULyraAbilitySystemComponent`. This is pretty nifty for the following reasons:
* Gameplay Tags are used to separate concerns and domains: the ability system only needs to know about abilities and tags, and it's not corrupted by lower-level input management concerns.
* Gameplay designers can freely associated inputs to abilities without having to make changes to C++ code.
* Game Features can dynamically register new abilities and input mappings that are not even known by the base game.

We now know how the Gameplay Tag associated to an Input Action is made known to the ability system. But how does the ability system trigger an actual ability?

Well, this is done in `ULyraAbilitySystemComponent::ProcessAbilityInput`. This function, which is invoked by `ALyraPlayerController::PostProcessInput` (essentially every tick), goes through the list of all abilities registered with the component, and takes care of activating / deactivating those that correspond to the Gameplay Tags which had their input pressed. Abilities 


## Notes and thoughts

Some final notes and thoughts on this setup:

* `UAbilitySystemComponent` already has some built-in support for mapping Abilities with inputs, but it's largely based on Unreal's previous input management system (now deprecated). Lyra reuses some of the underlying methods, but largely extends on it by integrating with the new Enhanced Input System.
* Native input actions also make use of Gameplay Tags but they're completely hardcoded, which means that adding or modifying native actions requires changes in C++. I'm still not completely sure why Epic decided to lookup native actions via Gameplay Tags, and my only guess is that it slighly reduces the amount of boilerplate C++ code.
* Lyra Gameplay Tags are stored in configuration files, specifically `Config/DefaultGameplayTags.ini` and `GameFeatures/<GameFeatureName>/Config/Tags/<GameFeatureName>Tags.ini`. As indicated in the last comment of [this thread](https://forums.unrealengine.com/t/trouble-using-an-ini-file-for-gameplay-tags/753690/4), there are still some quirks about the format to be used in these files.
