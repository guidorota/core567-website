---
title: 'Rider for Unreal Engine development'
description: 'First thoughts after switching from Visual Studio 2022 to Rider for Unreal Engine development'
date: 2024-10-23
tags:
  - technology
  - 'Unreal Engine'
---

As mentioned in the [my first blog](https://www.core567.com/blog/hello-internet/) I recently started learning Unreal Engine, using Visual Studio 2022 Community Edition (VS2022 later in this post) as IDE.

I was not exactly thrilled to use Visual Studio: my last encounter with this IDE was about 20 years ago, and I didn't have fond memories of it. Despite that, I still had good reasons to use it:
* It has a free community edition
* It simplified my initial ramp up in Unreal Engine, since most docs and tutorials reference Visual Studio
* I was curious to see how much new versions changed since the last time I used it


## A new challenger enters the game

I was more or less happily chugging along with Visual Studio, and then this happened: JetBrains announced that [Rider and WebStorm are free for non-commercial use](https://blog.jetbrains.com/blog/2024/10/24/webstorm-and-rider-are-now-free-for-non-commercial-use/).

As a long-time JetBrains IDE user (I've been regularly using IntelliJ IDEA, DataGrip, and WebStorm in a professional environment for more than 10 years), that news thrilled me. So I downloaded Rider, and switched to it.


## First impressions

Here are my first impressions after using Rider to develop in Unreal Engine for a couple of days:

The good:
* Familiar UX and shortcuts (at least for those who suffer from JetBrains Stockholm syndrome).
* Things just worked without having to mess around with configuration too much (except for having to enable engine plugin indexing). Rider can understand both `.sln` and `.uproject`, however the latter still has some limitations (see <add link>).
* Navigating through code is way easier in Rider. Navigating through a class hierarchy is a breeze compared to VS2022. This is probably Rider's biggest advantage. Blueprints are also indexed and searchable, which greatly simplifies moving from code to editor compared to VS2022.
* Syntax highlighting works better than in VS2022. On multiple times VS2022 IntelliSense and highlighting  bugged out, requiring an editor restart to go back to normal.
* Better support for autocompletion compared to VS2022, especially for Unreal macros and property modifiers.
* Slightly better project explorer view. I was surprised to see that Game Features are classified under a separate folder, something that VS2022 doesn't do.


The bad:
* Indexing of engine plugins is not enabled by default <add steps to enable>
* Classic JetBrains indexing issues (anyone who worked on large code repositories with JetBrains products should know what I'm talking about). 
* Classic JetBrains UX noise. Lots of popups, lots of warnings. Some are useful, some are spam.


## Closing thoughts

For the time being I'll stick to Rider, since the benefits vastly outgrow the issues I've found up until now.

The biggest surprise for me was how much Rider simplifies code navigation in a C++ codebase compared to VS2022. I should not be astonished by this, since it's nothind different from what IDEA or other JetBrains product offer. However going back to being able which parent class declares a method I'm overriding with just the push of a button felt very good nonetheless (VS2022 does this very poorly).

Being able to seamlessly search for code usages in Blueprints is also another big advantage of Rider too. As an Unreal Engine learner, this feature alone is helping me understand Epic's sample projects quicker than I was able to do with VS2022.

I'm still bitter about the lackluster indexing performance. I was positively surprised by how smooth and fast VS2022 indexing is, and moving to Rider was a marked step back. However the additional time spent in indexing pays off by providing a better code navigation experience, and even extends to offer a very good integration between, so at the end of the day the tradeoff is worth it. I'm also not switching between different projects and branches nearly as often as I usually do at work, so indexing slowness shouldn't impact my flow too badly when I develop in Unreal Engine.