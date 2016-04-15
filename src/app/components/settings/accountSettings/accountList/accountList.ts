import {Component, Output, EventEmitter, ViewChild} from "angular2/core";
import {Control} from "angular2/common";
import {TreeList, TreeListItem, TREE_LIST_TYPE} from "../../../../../framework/treeList";
import {UniTableBuilder, UniTableColumn} from "../../../../../framework/uniTable";
import {UniDropdown} from "../../../../../framework/controls/dropdown/dropdown";
import {Account} from "../../../../unientities";

import {AccountGroupService} from "../../../../services/services";

enum SETTINGS_ADD_NEW {
    ACCOUNTGROUP, // 0
    ACCOUNT
}

declare var _;

@Component({
    selector: "account-list",
    templateUrl: "app/components/settings/accountSettings/accountList/accountList.html",
    directives: [TreeList, UniDropdown],
    providers: [AccountGroupService]
})
export class AccountList {
    @Output()
    uniAccountChange = new EventEmitter<number>();
    @ViewChild(TreeList)
    treeList: TreeList;

    accountListItems: TreeListItem[] = [];
    accountgroups;
    config;
    addDropdownControl = new Control(-1);

    constructor(private accountGroupService: AccountGroupService) {
        
        /*
        KE 13042016: Fjernet midlertidig - har uansett ingen funksjon per i dag, og gjør nå at hele viewet krasjer
        
        var kendoDropdownConfig = {
            delay: 50,
            dataTextField: "name",
            dataValueField: "action",
            dataSource: [
                //     {action: SETTINGS_ADD_NEW.ACCOUNTGROUP, name: "Ny kontogruppe"},
                {action: SETTINGS_ADD_NEW.ACCOUNT, name: "Ny hovedbokskonto"},
            ],
            optionLabel: {action: -1, name: "Select an action"}
        };

        this.config = {
            control: this.addDropdownControl,
            kOptions: kendoDropdownConfig,
            onChange: (event) => {
                var result = (event.sender.dataItem(<any>event.item));
                switch (result.action) {
                    case SETTINGS_ADD_NEW.ACCOUNT:
                        this.uniAccountChange.emit(0);
                        break;
                    default:
                        break;
                }

                event.sender.value("");
            }
            
        };*/
    }

    refresh(account: Account) {
        console.log("DO REFRESH OF TABLE");
        console.log(account);
        // this.treeList.refresh();
    }

    loopAccountGroups(parentgroup: any, id: number|string) {
        
         var accountNumberCol = new UniTableColumn("AccountNumber", "Kontonr", "number")
                    .setWidth("5rem");

        var accountNameCol = new UniTableColumn("AccountName", "Kontonavn", "string");

        var vatTypeCol = new UniTableColumn("VatType", "Mvakode/sats", "string")
            .setTemplate("# if(VatType != null) {# #= VatType.Name# - #= VatType.VatPercent#% #} else {# Ikke definert #}#");

        var lockedCol = new UniTableColumn("", "Synlig/låst", "boolean")
            .setClass("icon-column")
            .setTemplate("#if(Visible) {#<span class='is-visible' role='presentation'>Visible</span>#} " +
                "else {#<span class='is-hidden' role='presentation'>Hidden</span>#}# " +
                "#if(Locked) {#<span class='is-locked' role='presentation'>Locked</span>#} " +
                "else {#<span class='is-unlocked' role='presentation'>Unlocked</span>#}#"
            )
            .setWidth("5rem");
        
        this.accountgroups.forEach((accountgroup: any) => {
            if (accountgroup.MainGroupID === id) {
                var group = new TreeListItem(accountgroup.Name)
                    .setType(TREE_LIST_TYPE.LIST);

                if (parentgroup == null) {
                    this.accountListItems.push(group);
                } else {
                    parentgroup.addTreeListItem(group);
                }               

                var tableConfig = new UniTableBuilder("accounts", false)
                    .setExpand("VatType")
                    .setFilter("AccountGroupID eq " + accountgroup.ID)
                    .setOrderBy('AccountNumber')
                    .setPageSize(100)
                    .setPageable(false)
                    .addColumns(accountNumberCol, accountNameCol, vatTypeCol, lockedCol)
                    .setSelectCallback((account: Account) => {
                        this.uniAccountChange.emit(account.ID);
                    })
                    .setColumnMenuVisible(false);

                var list = new TreeListItem()
                    .setType(TREE_LIST_TYPE.TABLE)
                    .setContent(tableConfig);

                group.addTreeListItem(list);
                this.loopAccountGroups(group, accountgroup.ID);
            }
        });
    }

    ngOnInit() {
        this.accountGroupService
            .GetAll(null)
            .subscribe(
                (dataset: any) => {
                    this.accountgroups = dataset;
                    this.loopAccountGroups(null, null);
                },
                (error: any) => console.log('Error retrieving accountgroups: ', error)
            );
    }

    showHide() {
        this.treeList.showHideAll();
    }
}
