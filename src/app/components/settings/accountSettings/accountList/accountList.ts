import {Component, Output, EventEmitter, ViewChild} from 'angular2/core';
import {Control} from 'angular2/common';
import {TreeListItem} from '../../../../../framework/treeList/treeListItem';
import {TreeList, TREE_LIST_TYPE} from '../../../../../framework/treeList/treeList';
import {UniHttpService} from '../../../../../framework/data/uniHttpService';
import {UniTable, UniTableConfig} from '../../../../../framework/uniTable';
import {DropdownConfig, UniDropdown} from '../../../../../framework/controls/dropdown/dropdown';

enum SETTINGS_ADD_NEW {
    ACCOUNTGROUP,//0
    ACCOUNT,//1
}

declare var jQuery;

@Component({
    selector: 'account-list',
    templateUrl: 'app/components/settings/accountSettings/accountList/accountList.html',
    directives: [TreeList]
})
export class AccountList {
    @Output() uniAccountChange = new EventEmitter<number>();
    @ViewChild(TreeList) treeList: TreeList;
    accountListItems: TreeListItem[] = [];
    accountgroups;
    config;
 
    constructor(private http:UniHttpService) {        
    }
      
    loopAccountGroups(parentgroup, id) {
        this.accountgroups.forEach(accountgroup => {
            if (accountgroup.MainGroupID == id) {
                var group = new TreeListItem(accountgroup.Name)
                .setType(TREE_LIST_TYPE.LIST);
                     
                if (parentgroup == null) {
                    this.accountListItems.push(group);
                } else {
                    parentgroup.addTreeListItem(group);
                }
                
                // insert table
                var tableConfig = new UniTableConfig('http://localhost:27831/api/biz/accounts', false, false)
                    .setOdata({
                        expand: '',
                        filter: 'AccountGroupID eq ' + accountgroup.ID
                    })
                    .setDsModel({
                        id: 'ID',
                        fields: {
                            AccountNumber: {type: 'number'},
                            AccountName: {type: 'text'}
                        }
                    })
                    .setColumns([
                        {field: 'AccountNumber', title: 'Kontonr'},
                        {field: 'AccountName', title: 'Kontonavn'}
                    ])
                    .setOnSelect(account => {
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
        this.http.multipleRequests('GET', [
            { resource: "accountgroups" }
        ]).subscribe(
            (dataset) => {
                this.accountgroups = dataset[0];
                this.loopAccountGroups(null, null); 
            },
            (error) => console.log(error)
        );  
      
      
                      var kendoDropdownConfig = {
            delay: 50,
            dataTextField: 'name',
            dataValueField: 'action',
            dataSource:  [
                { action: SETTINGS_ADD_NEW.ACCOUNTGROUP, name: 'Ny kontogruppe' },
                { action: SETTINGS_ADD_NEW.ACCOUNT, name: 'Ny hovedbokskonto' },
            ],
            optionLabel: {action: -1, name: 'Select action'},
            select: (event: kendo.ui.DropDownListSelectEvent) => {
                var action = (event.sender.dataItem(<any>event.item));
                console.log("ACTION SELECTED");
                console.log(action);
            },
        };
        
//        var element = jQuery('.add_select > select').first().show();
//        element.kendoDropDownList(kendoDropdownConfig);
        
     
        this.config = {
            control: new Control(""),
            kOptions: kendoDropdownConfig, 
            onChange: null
        }

        var element = jQuery('.add_select > uni-dropdown > input').first().show();
        //element.kendoDropDownList(kendoDropdownConfig);

       
    }
    
    ngAfterViewInit()
    {

       
        console.log("AFTER VIEW INIT");
    }
        
    showHide()
    {
        this.treeList.showHideAll();
    }
}