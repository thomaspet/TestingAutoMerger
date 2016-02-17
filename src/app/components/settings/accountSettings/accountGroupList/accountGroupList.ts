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
    tableConfig: UniTableBuilder;

    constructor(private http: UniHttpService) {
        var idCol = new UniTableColumn('ID', 'ID', 'number')
        var nameCol = new UniTableColumn('Name', 'Navn', 'string'); 
        
        var tableConfig = new UniTableBuilder(this.http.baseUrl + "accountgroups", false)
        .setPageSize(5)
        .addColumns(idCol, nameCol);

        /*
        this.tableConfig = new UniTableConfig(this.http.baseUrl + "accountgroups", false, false)
            .setOdata({
                expand: "",
                filter: "AccountID eq " + this.account
            })
            .setDsModel({
                id: "ID",
                fields: {
                    ID: {type: "number"},
                    Name: {type: "text"}
                }
            })
            .setColumns([
                {field: "ID", title: "ID"},
                {field: "Name", title: "Navn"}
            ]);
        */
    }
}
