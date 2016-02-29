import {Component, Input, OnInit} from "angular2/core";
import {UniTable, UniTableBuilder, UniTableColumn} from "../../../../../framework/uniTable";

@Component({
    selector: "account-group-list",
    templateUrl: "app/components/settings/accountSettings/accountGroupList/accountGroupList.html",
    directives: [UniTable]
})
export class AccountGroupList implements OnInit {
    @Input()
    account = 1;
    tableConfig: any;

    ngOnInit() {
        var idCol = new UniTableColumn("ID", "ID", "number")
        var nameCol = new UniTableColumn("Name", "Navn", "string");

        var config = new UniTableBuilder("accountgroups", false)
            .setFilter("AccountID eq " + this.account)
            .setPageSize(100)
            .setSearchable(false)
            .setPageable(false)
            .addColumns(idCol, nameCol);

        this.tableConfig = config;
    }
}
