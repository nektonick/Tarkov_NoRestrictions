import { DependencyContainer } from "tsyringe";
// SPT types
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { Item } from "@spt-aki/models/eft/common/tables/IItem";
import { SecuredContainers } from "@spt-aki/models/enums/ContainerTypes"
import ModConfig = require("../config/config.json");
import { ITemplateItem, Slot } from "@spt-aki/models/eft/common/tables/ITemplateItem";


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

    private getLogger(): ILogger {
        if (!this.logger) {
            throw Error(`[${this.mod}]: logger is missing`);
        }
        return this.logger;
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

        // TODO
    }
}

module.exports = { mod: new NoRestrictionsMod() }