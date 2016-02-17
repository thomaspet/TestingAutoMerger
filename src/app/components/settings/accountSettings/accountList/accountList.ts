import {Component, Output, EventEmitter, ViewChild} from "angular2/core";
import {Control} from "angular2/common";
import {TreeListItem} from "../../../../../framework/treeList/treeListItem";
import {TreeList, TREE_LIST_TYPE} from "../../../../../framework/treeList/treeList";
import {UniHttpService} from "../../../../../framework/data/uniHttpService";
import {UniTableConfig} from "../../../../../framework/uniTable";
import {UniDropdown} from "../../../../../framework/controls/dropdown/dropdown";
import {IAccount} from "../../../../../framework/interfaces/interfaces";

enum SETTINGS_ADD_NEW {
    ACCOUNTGROUP, // 0
    ACCOUNT
}

declare var _;

@Component({
    selector: "account-list",
    templateUrl: "app/components/settings/accountSettings/accountList/accountList.html",
    directives: [TreeList, UniDropdown]
})
export class AccountList {
    @Output() uniAccountChange = new EventEmitter<number>();
    @ViewChild(TreeList) treeList: TreeList;
    @ViewChild(UniDropdown) dropdown: UniDropdown;
    accountListItems: TreeListItem[] = [];
    accountgroups;
    config;
    addDropdownControl = new Control(-1);

    constructor(private http: UniHttpService) {
        var kendoDropdownConfig = {
            delay: 50,
            dataTextField: "name",
            dataValueField: "action",
            dataSource: [
                {action: SETTINGS_ADD_NEW.ACCOUNTGROUP, name: "Ny kontogruppe"},
                {action: SETTINGS_ADD_NEW.ACCOUNT, name: "Ny hovedbokskonto"},
            ],
            optionLabel: {action: -1, name: "Select an action"},
            select: (event: kendo.ui.DropDownListSelectEvent) => {
                var result = (event.sender.dataItem(<any>event.item));
                switch (result.action) {
                    case SETTINGS_ADD_NEW.ACCOUNT:
                        this.uniAccountChange.emit(0);
                        break;
                    default:
                        break;
                }
            },
        };

        this.config = {
            control: this.addDropdownControl,
            kOptions: kendoDropdownConfig
        };
    }

    loopAccountGroups(parentgroup: any, id: number|string) {
        this.accountgroups.forEach((accountgroup: any) => {
            if (accountgroup.MainGroupID === id) {
                var group = new TreeListItem(accountgroup.Name)
                    .setType(TREE_LIST_TYPE.LIST);

                if (parentgroup == null) {
                    this.accountListItems.push(group);
                } else {
                    parentgroup.addTreeListItem(group);
                }

                // insert table
                var tableConfig = new UniTableConfig(this.http.baseUrl + "accounts", false, false)
                    .setOdata({
                        expand: "",
                        filter: "AccountGroupID eq " + accountgroup.ID
                    })
                    .setDsModel({
                        id: "ID",
                        fields: {
                            AccountNumber: {type: "number"},
                            AccountName: {type: "text"},
                            Locked: {type: "boolean"}
                        }
                    })
                    .setColumns([
                        {field: "AccountNumber", title: "Kontonr"},
                        {field: "AccountName", title: "Kontonavn"},
                        {
                            field: null,
                            title: "",
                            attributes: {"class": "icon-column"},
                            template: "#if(!Visible) {#<span class='is-visible' role='presentation'>Visible</span>#} " +
                            "else {#<span class='is-hidden' role='presentation'>Hidden</span>#}# " +
                            "#if(!Locked) {#<span class='is-locked' role='presentation'>Locked</span>#} " +
                            "else {#<span class='is-unlocked' role='presentation'>Unlocked</span>#}#"
                        }
                    ])
                    .setOnSelect((account: IAccount) => {
                        console.log(account);
                        this.uniAccountChange.emit(account.ID);
                    });

                var list = new TreeListItem()
                    .setType(TREE_LIST_TYPE.TABLE)
                    .setContent(tableConfig);

                group.addTreeListItem(list);
                this.loopAccountGroups(group, accountgroup.ID);
            }
        });
    }

    ngOnInit() {
        this.http.multipleRequests("GET", [
            {resource: "accountgroups"}
        ]).subscribe(
            (dataset: any) => {
                this.accountgroups = dataset[0];
                this.loopAccountGroups(null, null);
            },
            (error: any) => console.log(error)
        );
    }

    showHide() {
        this.treeList.showHideAll();
    }
}
