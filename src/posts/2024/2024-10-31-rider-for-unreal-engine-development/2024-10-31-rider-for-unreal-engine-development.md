---
title: 'Rider for Unreal Engine development'
description: 'First thoughts after switching from Visual Studio 2022 to Rider for Unreal Engine development'
date: 2024-10-31
tags:
  - technology
  - 'unreal engine'
---

As mentioned in the [my first blog](https://www.core567.com/blog/hello-internet/) I recently started learning Unreal Engine using Visual Studio 2022 Community Edition (VS2022) as IDE.

To be completely honest, I was not thrilled to use Visual Studio. My last encounter with this IDE was about 20 years ago, and it didn't leave me with good memories. Despite that, I still had good reasons to use it:
* It has a free community edition (alternatives like Rider didn't at the time)
* It simplified my initial ramp up in Unreal Engine, since most docs and tutorials reference Visual Studio
* I was curious to see how much new versions changed since the last time I used it


## A new challenger enters the game

I was more or less chugging along with Visual Studio, and then this happened: JetBrains announced that [Rider and WebStorm are free for non-commercial use](https://blog.jetbrains.com/blog/2024/10/24/webstorm-and-rider-are-now-free-for-non-commercial-use/).

As a long-time JetBrains IDE user that news thrilled me (I've been regularly using IntelliJ IDEA, DataGrip, and WebStorm in a professional environment for more than 10 years). So I promptly downloaded Rider and switched to it.


## First impressions

Here are my first impressions after using Rider to develop in Unreal Engine for a couple of days:

The good:
* Autosave (why VS2022 doesn't implement this feature yet goes beyond my understanding).
* Familiar UX and shortcuts (at least for those who suffer from JetBrains Stockholm syndrome).
* Things just work without having to mess around with configuration too much, whereas VS2022 needs to be configured manually. Rider can understand both `.sln` and `.uproject`, however the latter still has some limitations (e.g., [RIDER-63063](https://youtrack.jetbrains.com/issue/RIDER-63063)).
* Navigating through code is a breeze in Rider. Moving through a class hierarchy is way easier than VS2022. Blueprints are also indexed and searchable, which greatly simplifies moving from code to editor compared to VS2022.
* Syntax highlighting works better than in VS2022. On multiple times VS2022 IntelliSense and highlighting bugged out, requiring an editor restart to go back to normal.
* Better support for autocompletion compared to VS2022, especially for Unreal macros and property modifiers.
* Slightly better project explorer view. I was surprised to see that Game Features are classified under a separate folder, something that VS2022 doesn't do.


The bad:
* Classic JetBrains indexing issues (anyone who worked on large code repositories with JetBrains products should know what I'm talking about). 
* Classic JetBrains UX noise. Lots of popups, lots of warnings. Some are useful, some are spam.
* Indexing of engine plugins is not enabled by default.


## Configuring Rider

Getting started with Rider was way easier than expected. Everything mostly seemed to work out of the box and didn't require me to change any configuration, with the exception of the following things:

* Rider needs to be set as the default IDE in the Unreal Engine editor via `Edit -> Editor Preferences -> Source Code`.
* Indexing of Plugin code is not enabled by default, likely to reduce indexing time. I like to be able to search through code at will, so I enabled this feature in Rider by selecting `File -> Settings -> Languages & Frameworks -> C++ -> Unreal Engine -> Index plugins'`.
* Enabling `File -> Settings -> Tools -> UnrealLink -> Replace 'Build Startup Project' button with 'Build and Reload'` makes Hot Reload behave similarly to UE's "Live coding", which in my limited experience has been quite flaky (i.e., not all changes are always loaded in the editor). Disabling this option made Hot Reload more reliable (haven't had time to fully investigate why that's the case though).


## Closing thoughts

For the time being I'll stick to Rider, since the benefits vastly outgrow the issues I've found up until now.

Trying Rider made it blatantly apparent how limited VS2022 code navigation tools are. For example, finding which parent class declares a method I'm overriding requires just the push of a button in Rider, whereas in VS2022 it seems that the only option is to manually traverse the entire class hierarchy. In hindsight I should be astonished by this, since it's nothing different from the convenience that IDEA or other JetBrains product offer.

Being able to seamlessly search for code usages in Blueprints is also another big advantage of Rider. As an Unreal Engine learner, this feature alone is helping me understand Epic's sample projects quicker than I was able to do with VS2022.

I'm still bitter about the lackluster indexing performance. I was positively surprised by how smooth and fast VS2022 indexing is, and moving to Rider is a marked step back. However the additional time spent in indexing pays off because the overall code/blueprint navigation experience is markedly better, so at the end of the day the tradeoff is worth. I'm also not switching between different projects and branches nearly as often as I usually do at work, so indexing slowness shouldn't impact my development flow too much.