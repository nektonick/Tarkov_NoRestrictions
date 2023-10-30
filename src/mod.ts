import { DependencyContainer } from "tsyringe";
// SPT types
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { BaseClasses } from "@spt-aki/models/enums/BaseClasses";
import { Grid, GridFilter, ITemplateItem, Props } from "@spt-aki/models/eft/common/tables/ITemplateItem";

import ConfigJson from "../config/config.json"


type RemoveRestrictionsOptions = {
    BlocksEarpiece?: boolean
    BlocksEyewear?: boolean
    BlocksFaceCover?: boolean
    BlocksHeadwear?: boolean

    CanPutIntoDuringTheRaid?: boolean
    CantRemoveFromSlotsDuringRaid?: boolean
    ConflictingItems?: boolean
    DiscardLimit?: boolean
    DiscardingBlock?: boolean
    
    IsUndiscardable?: boolean
    IsUngivable?: boolean
    IsUnremovable?: boolean
    IsUnsaleable?: boolean
    itemsFilter?: boolean
}

class NoRestrictionsMod implements IPostDBLoadMod {
    private mod: string = "NoRestrictions"
    private tables: null | IDatabaseTables = null

    private getTables(): IDatabaseTables {
        if (!this.tables) {
            throw Error(`[${this.mod}]: tables is missing`);
        }
        return this.tables;
    }

    private getItemTamplates() {
        const templates = this.getTables().templates;
        if (!templates) {
            throw Error(`[${this.mod}]: templates is missing`);
        }
        return templates;
    }

    private getItems(): Record<string, ITemplateItem> {
        const items = this.getItemTamplates().items;
        if (!items) {
            throw Error(`[${this.mod}]: items is missing`);
        }
        return items;
    }

    /**
     * Majority of trader-related work occurs after the aki database has been loaded but prior to SPT code being run
     * @param container Dependency container
     */
    public postDBLoad(container: DependencyContainer): void {
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        this.tables = databaseServer.getTables();

        this.processAllItems();
        this.removeInRaidRestrictions();
    }

    private removeInRaidRestrictions() {
        if (!(ConfigJson.RemoveRestrictionsInRaid === true)) {
            return;
        }

        const config = this.getTables().globals?.config;
        if (!config) {
            return;
        }
        config.RestrictionsInRaid = []
    }

    private processAllItems() {
        const items = this.getItems();
        for (const item_id in items) {
            const item = items[item_id];
            this.processSingleItem(item)
        }
    }

    private processSingleItem(item: ITemplateItem) {
        const parent_id = item._parent

        if (parent_id === BaseClasses.BACKPACK && ConfigJson.BACKPACK.enabled === true) {
            this.processBackpack(item);
        }

        if (parent_id === BaseClasses.SIMPLE_CONTAINER && ConfigJson.SIMPLE_CONTAINER.enabled === true) {
            this.processSimpleContainer(item);
        }

        if (parent_id === BaseClasses.MOB_CONTAINER && ConfigJson.MOB_CONTAINER.enabled === true) {
            this.processSecureContainer(item);
        }

        if (parent_id == BaseClasses.FACECOVER && ConfigJson.FACECOVER.enabled === true) {
            this.processFaceCover(item);
        }

        if (parent_id == BaseClasses.HEADWEAR && ConfigJson.HEADWEAR.enabled === true) {
            this.processHeadwear(item);
        }

        if (parent_id == BaseClasses.HEADPHONES && ConfigJson.HEADPHONES.enabled === true) {
            this.processHeadphones(item);
        }
    }

    private processBackpack(backpack: ITemplateItem) {
        const options = ConfigJson.BACKPACK.rescrictions_to_remove;
        this.removeAllRestrictionsFromProps(backpack._props, options)
    }

    private processSimpleContainer(container: ITemplateItem) {
        const options = ConfigJson.SIMPLE_CONTAINER.rescrictions_to_remove;
        this.removeAllRestrictionsFromProps(container._props, options)
    }

    private processSecureContainer(secure_container: ITemplateItem) {
        const options = ConfigJson.MOB_CONTAINER.rescrictions_to_remove;
        this.removeAllRestrictionsFromProps(secure_container._props, options)
    }

    private processFaceCover(headgear: ITemplateItem) {
        const options = ConfigJson.FACECOVER.rescrictions_to_remove;
        this.removeAllRestrictionsFromProps(headgear._props, options)
        
        if (options.ConflictingItems === true) {
            this.removeItemFromConflicts(headgear)
        }
    }

    private processHeadwear(headgear: ITemplateItem) {
        const options = ConfigJson.HEADWEAR.rescrictions_to_remove;
        this.removeAllRestrictionsFromProps(headgear._props, options)
        if (options.ConflictingItems === true) {
            this.removeItemFromConflicts(headgear)
        }
    }

    private processHeadphones(headgear: ITemplateItem) {
        const options = ConfigJson.HEADPHONES.rescrictions_to_remove;
        this.removeAllRestrictionsFromProps(headgear._props, options)
        if (options.ConflictingItems === true) {
            this.removeItemFromConflicts(headgear)
        }
    }

    private removeAllRestrictionsFromProps(props: Props, options: RemoveRestrictionsOptions) {
        if (options.BlocksEarpiece === true) {
            props.BlocksEarpiece = false;
        }
        if (options.BlocksEyewear === true) {
            props.BlocksEarpiece = false;
        }
        if (options.BlocksFaceCover === true) {
            props.BlocksEarpiece = false;
        }
        if (options.BlocksHeadwear === true) {
            props.BlocksEarpiece = false;
        }
        if (options.CanPutIntoDuringTheRaid === true) {
            props.CanPutIntoDuringTheRaid = true;
        }

        // props.CanRequireOnRagfair = true;
        // props.CanSellOnRagfair = true;
        
        if (options.CantRemoveFromSlotsDuringRaid === true) {
            props.CantRemoveFromSlotsDuringRaid = []
        }
        if (options.ConflictingItems === true) {
            props.ConflictingItems = [] // This might generate errors!
        }
        if (options.DiscardLimit === true) {
            props.DiscardLimit = -1;
        }
        if (options.DiscardingBlock === true) {
            props.DiscardingBlock = false;
        }

        // props.IsLockedafterEquip = false; // Strange one. Used mostly for player pockets
        // props.IsSpecialSlotOnly = false; // make sense only for item_spec_radiotransmitter
        
        if (options.IsUndiscardable === true) {
            props.IsUndiscardable = false;
        }
        if (options.IsUngivable === true) {
            props.IsUngivable = false;
        }
        if (options.IsUnremovable === true) {
            props.IsUnremovable = false;
        }
        if (options.IsUnsaleable === true) {
            props.IsUnsaleable = false;
        }

        // props.Unlootable = false; // This probably makes you lose your knife, secured container, spec slotes and armbank

        if (options.itemsFilter === true) {
            this.removeFiltersFromGrids(props.Grids);
        }
    }

    private removeItemFromConflicts(item_to_remove_from_conflicts: ITemplateItem) {
        const items = this.getItems();
        for (const item_id in items) {
            const item = items[item_id];
            const props = item._props
            if (!props.ConflictingItems) {
                continue;
            }

            props.ConflictingItems = props.ConflictingItems.filter(item => item !== item_to_remove_from_conflicts._id)
        }
    }

    private removeFiltersFromGrids(grids: Grid[] | undefined) {
        if (!grids) {
            return;
        }
        for (const grid of grids) {
            grid._props.filters = [this.getGridFilterWithAllItemsAllowed()]
        }
    }

    private getGridFilterWithAllItemsAllowed(): GridFilter {
        return {
            Filter: [BaseClasses.ITEM],
            ExcludedFilter: []
        }
    }
}

module.exports = { mod: new NoRestrictionsMod() }