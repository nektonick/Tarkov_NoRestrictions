import { DependencyContainer } from "tsyringe";
// SPT types
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { BaseClasses } from "@spt-aki/models/enums/BaseClasses";
import { Grid, GridFilter, ITemplateItem, Props } from "@spt-aki/models/eft/common/tables/ITemplateItem";


class NoRestrictionsMod implements IPostDBLoadMod {
    private mod: string = "NoRestrictions"
    private logger: null | ILogger = null
    private jsonUtil: null | JsonUtil = null
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
        this.jsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        this.tables = databaseServer.getTables();
        this.logger = container.resolve<ILogger>("WinstonLogger");

        this.processAllItems();
        this.removeInRaidRestrictions();
    }

    private removeInRaidRestrictions() {
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

        if (parent_id === BaseClasses.BACKPACK) {
            this.processBackpack(item);
        }

        if (parent_id === BaseClasses.SIMPLE_CONTAINER) {
            this.processSimpleContainer(item);
        }

        if (parent_id === BaseClasses.MOB_CONTAINER) {
            this.processSecureContainer(item);
        }

        if (parent_id in [BaseClasses.FACECOVER, BaseClasses.HEADWEAR, BaseClasses.HEADPHONES]) {
            this.processHeadgearCover(item);
        }
    }

    private processBackpack(backpack: ITemplateItem) {
        this.removeAllRestrictionsFromProps(backpack._props)
    }

    private processSimpleContainer(container: ITemplateItem) {
        this.removeAllRestrictionsFromProps(container._props)
    }

    private processSecureContainer(secure_container: ITemplateItem) {
        this.removeAllRestrictionsFromProps(secure_container._props)
    }

    private processHeadgearCover(headgear: ITemplateItem) {
        this.removeAllRestrictionsFromProps(headgear._props)
    }

    private removeAllRestrictionsFromProps(props: Props) {
        props.BlocksEarpiece = false;
        props.BlocksEyewear = false;
        props.BlocksFaceCover = false;
        props.BlocksHeadwear = false;

        props.CanPutIntoDuringTheRaid = true;
        // props.CanRequireOnRagfair = true;
        // props.CanSellOnRagfair = true;
        props.CantRemoveFromSlotsDuringRaid = []
        props.ConflictingItems = [] // This might generate errors!
        props.DiscardLimit = -1;
        props.DiscardingBlock = false;
        // props.IsLockedafterEquip = false; // Strange one. Used mostly for player pockets
        // props.IsSpecialSlotOnly = false; // make sense only for item_spec_radiotransmitter
        props.IsUndiscardable = false;
        props.IsUngivable = false;
        props.IsUnremovable = false;
        props.IsUnsaleable = false;
        // props.Unlootable = false; // This probably makes you lose your knife, secured container, spec slotes and armbank
        this.removeFiltersFromGrids(props.Grids);
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