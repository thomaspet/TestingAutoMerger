import {Component, Input} from "angular2/core";
import {UniHttpService} from "../../../../../framework/data/uniHttpService";
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';

@Component({
    selector: "account-group-list",
    templateUrl: "app/components/settings/accountSettings/accountGroupList/accountGroupList.html",
    directives: [UniTable]
})
export class AccountGroupList {
    @Input() account = 1;
    tableConfig: any;

    constructor(private http: UniHttpService) {}

    ngOnInit() {
        var idCol = new UniTableColumn('ID', 'ID', 'number')
        var nameCol = new UniTableColumn('Name', 'Navn', 'string'); 
        
        var config = new UniTableBuilder("accountgroups", false)
        .setFilter("AccountID eq " + this.account)
        .setPageSize(5)
        .setSearchable(false)
        .addColumns(idCol, nameCol);

        this.tableConfig = config;
    }
}
