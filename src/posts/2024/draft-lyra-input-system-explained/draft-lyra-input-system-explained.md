---
title: 'Lyra input system explained'
description: "A primer on input management in the Lyra sample project."
date: 2024-11-13
tags:
  - technology
  - 'unreal engine'
---

Going through the Lyra sample project is equal parts exciting and frustrating. Exciting because it offers valuable insights into how Unreal Engine works, and how Epic Games builds software. Frustrating because to really understand how Lyra works, one needs to be familiar (or acquire familiarity) with multiple Unreal Engine systems and frameworks. Epic provides [some documentation](https://dev.epicgames.com/community/learning/paths/Z4/lyra-starter-game) for this sample project, but it's far from comprehensive.

In this post I'll go through how Lyra interacts with the Unreal Engine Enhanced Input System, primarily from a configuration perspective. Note that familiarity with Game Features and Modular Gameplay is required to get a complete understanding of the Lyra input system; if you need a refresher, read [Unreal Engine Game Features and Modular Gameplay](https://www.core567.com/blog/unreal-engine-game-features-and-modular-gameplay/).


## Overview

The Lyra input system can be largely split in two different parts: Native input actions, and Ability input actions.

Native input actions are mainly reserved for basic character movement: directional move, look via mouse and joystick, crouch, run. As we will see later, bindings for these actions is implemented in a fairly standard way.

Ability input actions are used for activating Gameplay Abilities. Binding of ability input actions is implemented through Lyra-specific code, and heavily relies on the use of Gameplay Tags.

Given that Lyra relies on the Enhanced Input System, it shouldn't be a surprise that `InputAction`s and `InputMappingContext`s are at the basis of how user input is bound to game actions. If you want to look at some examples, you can simply search for blueprint assets that start with `IMC_` (e.g., `IMC_Default`) and `IA_` (e.g., `IA_Crouch` or `IA_Weapon_Fire`).


## Configuring `InputMappingContext`

Let's start with `InputMappingContext`. These mappings are configured using the _"Add Input Mapping"_ Game Feature Action (`UGameFeatureAction_AddInputContextMapping`). The `ShooterCore` Game Feature provides a good example of how these are configured.

Looking at `UGameFeatureAction_AddInputContextMapping` reveals that Lyra's `InputMappingContext`s are registered at two different points in the lifecycle of a Game Feature:
* First, when the Game Feature is registered, i.e., the Game Feature is known to the engine but it's not active yet. In this state Lyra only makes the key bindings in the `InputMappingContext` known to the `UEnhancedInputUserSettings` so that they can be edited in the user preferences.
* Then, when the Game Feature is active. In this state the `InputMappingContext` is actually registered via `UEnhancedInputLocalPlayerSubsystem::AddMappingContext()`, hence making the mapping active.


## Configuring `InputActions` and activating abilities

The configuration for input actions is a bit more convoluted. Configuration for these objects is stored in `ULyraInputConfig`. This allows Lyra game developers to specify if an input action is native or based on an ability, and which Gameplay Tag is associated with an input action.

Take for example `InputData_Hero`: this configuration specifies move, look, run, and crouch as native actions, and jump, reload, heal, dash, and fire as ability-based input actions.

`ULyraInputConfig` are loaded when the Game Mode loads an experience (`ULyraExperienceDefinition` -> `ULyraPawnData` -> `ULyraInputConfig`). Going a bit more in detail, `ALyraGameMode` loads a `ULyraExperienceDefinition`, and then sets the `ULyraPawnData` on the `ULyraPawnExtensionComponent` when spawning the player's pawn. Another component, of class `ULyraHeroComponent`, then reads `ULyraInputConfig` from `ULyraPawnExtensionComponent` to initialize the input action mappings.

The method where this initialization takes place is `ULyraHeroComponent::InitializePlayerInput()`. Looking at the source code, we can see that native input actions are found by searching for hardcoded Gameplay Tags (`InputTag.Move`, `InputTag.Look.Mouse`, etc.), and each is bound to a very specific method. These bindings are very similar to what's taught in various Enhanced Input System tutorials.

Ability input actions are instead more interesting. Each ability input action is bound to a Gameplay Tag via bindings installed in `ULyraInputComponent::BindAbilityActions`. These bindings, which leverage the `ULyraHeroComponent::Input_AbilityInputTagPressed` and `ULyraHeroComponent::Input_AbilityInputTagReleased` are only tasked with informing the `ULyraAbilitySystemComponent` that a Gameplay Tag was activated. In a nutshell, when the user presses a button corresponding to an Ability input action, a Gameplay Tag is passed on `ULyraAbilitySystemComponent`. This is pretty nifty for two reasons:
* Gameplay Tags are used to separate concerns and domains: the ability system only needs to know about abilities and tags, and it's not corrupted by lower-level input management concerns.
* Gameplay designers can freely associated inputs to abilities without having to make changes to C++ code.

We now know how the Gameplay Tag associated to an Input Action is made known to the ability system. But how does the ability system trigger an actual ability? Well, this is done in `ULyraAbilitySystemComponent::ProcessAbilityInput`. This function, which is invoked by `ALyraPlayerController::PostProcessInput` (essentially every tick), goes through the list of all active abilities, and takes care of activating / deactivating those that correspond to the Gameplay Tags which had their input pressed.


## Notes and thoughts

Some final notes and thoughts on this setup:

* `UAbilitySystemComponent` already has some built-in support for mapping Abilities with inputs, but it's largely based on Unreal's previous input management system (now deprecated). Lyra reuses some of the underlying methods, but largely extends on it by integrating with the new Enhanced Input System.
* Native input actions also make use of Gameplay Tags but they're completely hardcoded, which means that adding or modifying native actions requires changes in C++. I'm still not completely sure why Epic decided to lookup native actions via Gameplay Tags, and my only guess is that it slighly reduces the amount of boilerplate C++ code.
* Lyra Gameplay Tags are stored in configuration files, specifically `Config/DefaultGameplayTags.ini` and `GameFeatures/<GameFeatureName>/Config/Tags/<GameFeatureName>Tags.ini`. As indicated in the last comment of [this thread](https://forums.unrealengine.com/t/trouble-using-an-ini-file-for-gameplay-tags/753690/4), there are still some quirks about the format to be used in these files.
