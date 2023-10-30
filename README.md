# NoRestrictions

## Description
Remove most restrictions for items.
So, now
- All items allowed in backpacks, simple containers(like "Medicine case") and secure containers
- All headgear conflicts disabled. So, for example, you can use headphones with Altyn helmet.
- All items can be dropped/picked while in-raid
- No items limit for raid. Take all your 100'000'000 roubles with you!

## Config
All options are configurable now via config/config.json file.
Main categories:
- BACKPACK
- SIMPLE_CONTAINER - items such as "Keytool" or "Medicine case". Might be very disbalance
- MOB_CONTAINER - secure containers such as Alpha
- FACECOVER - Masks and balaclaves
- HEADWEAR - hats and helmets
- HEADPHONES - headsets
- RemoveRestrictionsInRaid - this one is special. Set true to remove limits of you can get with you in raid. (For example, for roubles)

Options:
- enabled - set to false to not change restrictions for category
- rescrictions_to_remove - restrictions that can be removed from items of this category. For each restriction true means remove restriction and false means do nothing.
    - BlocksEarpiece
    - BlocksEyewear
    - BlocksFaceCover
    - BlocksHeadwear
    - CanPutIntoDuringTheRaid
    - CantRemoveFromSlotsDuringRaid
    - ConflictingItems
    - DiscardLimit
    - DiscardingBlock
    - IsUndiscardable
    - IsUngivable
    - IsUnremovable
    - IsUnsaleable
    - itemsFilter

## TODO
- VISORS category