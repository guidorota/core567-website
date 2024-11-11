---
title: 'Unreal Engine UObjects and garbage collection notes'
description: "A very unstructured post, mainly written to quickly note down some findings about how `UObjects` are managed, and how garbage collection works in Unreal Engine."
date: 2024-11-08
tags:
  - technology
  - 'unreal engine'
---

A very unstructured post, mainly written to quickly note down some findings about how `UObjects` are managed, and how garbage collection works in Unreal Engine.


## Basics

* Basics are documented in the garbage collection section of [this Epic documentation page](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-object-handling-in-unreal-engine).
* Only `UObject`s are managed by Unreal's garbage collection system.


## Testing for reachability

Unsurprisingly, the system works like a classic garbage collector (lol). To determine if an object needs to be garbage collected or not, the engine performs a reachability test starting from a set of root objects. Reachability can only be verified for variables that are visible via the Unreal reflection system (i.e., decorated with `UPROPERTY()`).

As an aside: Rider provides a warning on any non-`UPROPERTY` pointer to notify that the referenced object won't be kept alive through that pointer, but unfortunately this inspection doesn't seem to be working for `TObjectPtr`. It should have been addressed by [RSCPP-33806](https://youtrack.jetbrains.com/issue/RSCPP-33806), but a year later it still looks like it didn't make it into Rider, so I opened [RIDER-119663](https://youtrack.jetbrains.com/issue/RIDER-119663).

`UObject`s can also be explicitly added to the root set by invoking the `AddToRoot()` method. In general this is not necessary for Actors and Actor Components, which are implicitly reachable via the root set by virtue of being in a World.

To recap, the following examples will prevent objects from being garbage collected:

* `UObject` in the root set.
* `UPROPERTY() UObject* Reference;`.
* `UPROPERTY() TObjectPtr<UObject> Reference;`.
* References in containers like `UPROPERTY() TArray<UObject*> ArrayOfUObjects;`.
* Looking at the code in `UObjectBase::UObjectBaseInit()` there also seems to be a way to reserve a permanent object pool. I haven't looked into this too much though as it looks very niche.

Note it's also possible to store weak references that will not prevent the object from being garbage collected:

* Non-`UPROPERTY` pointers and containers like `UObject* Reference`, `TObjectPtr<UObject> Reference`, `TArray<UObject*> ArrayOfUObjects;`. These are essentially unknown to the reflection system, so the garbage collector can't process them.
* Weak pointers using `TWeakObjectPtr`.

Note that as we'll see later, `TWeakObjectPtr` should be preferred, as the other weak pointers have drawbacks when it comes to testing if the pointer is valid or not.


## Verifying if an object has been garbage collected or not

Any `UPROPERTY` pointer that gets garbage collected will automatically become a `nullptr`. This gives us a quick and cheap way to validate whether a pointer can be dereferenced or not, but it can turn into a footgun since non-`UPROPERTY` variables don't enjoy the same benefit.

The Unreal documentation [mentions how this automatic reference update works](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-object-handling-in-unreal-engine), but it's quite brief and specifies it only applies for Actor and Actor Components, whereas my empirical testing shows it works for any `UObject` decorated with `UPROPERTY`. After a brief look at the garbage collection code, Epic's warning that reference updates only works for Actors and Actor components might stem from the fact that there's a delay between marking a UObject for collection, and invalidating its referencing pointers, which might not make it suitable for every situation (conjecture).

Better ways to test for validity of a pointer are:

* C++ pointers / `TObjectPtr`: `IsValid()` for `UPROPERTY` pointers visible to the reflection system, `IsValidLowLevel()` / `IsValidLowLevelFast()` otherwise. Note the `LowLevel` versions are slower.
* `TWeakObjectPtr`: `.IsValid()`, `.IsStale()`, `.IsExplicitlyNull()` methods can be used to determine the status of the pointer.

It's worth noting that `TWeakObjectPtr` will always return `nullptr` when the `UObject` it points to has been garbage collected, even when not decorated with `UPROPERTY`. This is because `TWeakObjectPtr` stores a reference to the item in the Global UObject array instance `GUObjectArray`, and not a direct pointer to the `UObject`.

All in all, looking at the code and other documentation, the best practice is to always store pointers to `UObject`s in a `TObjectPtr` property decorated with `UPROPERTY()`, or in a `TWeakObjectPtr` when a weak reference is preferred.

## GUObjectArray

`GUObjectArray` stores all live objects in the system. It is used by the engine during garbage collection, and also when verifying `UObject` pointers with the methods described above.

Allows for registering `UObject` creation and deletion listeners (`AddUObjectCreateListener` and `AddUObjectDeleteListener`).


## Forcing garbage collection

Forcing garbage collection can be done in different ways. Here's a few I used until now:

* From code via `GEngine->ForceGarbageCollection(bForcePurge);`
* From the editor via `gc.ForceCollectGarbageEveryFrame 1`

These are mainly useful for debugging purposes, usage in production code is a likely smell.