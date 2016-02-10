import {Component, Output, EventEmitter, ViewChild} from 'angular2/core';
import {TreeListItem} from '../../../../../framework/treeList/treeListItem';
import {TreeList, TREE_LIST_TYPE} from '../../../../../framework/treeList/treeList';
import {UniHttpService} from '../../../../../framework/data/uniHttpService';

@Component({
    selector: 'account-list',
    templateUrl: 'app/components/settings/accountSettings/accountList/accountList.html',
    directives: [TreeList]
})
export class AccountList {
    accountListItems: TreeListItem[] = [];
    accountgroups;
    @Output() uniAccountChange = new EventEmitter<number>();
    @ViewChild(TreeList) treeList: TreeList;
 
    constructor(private http:UniHttpService) {
    }
      
    loopAccountGroups(parentgroup, id) {
        this.accountgroups.forEach(accountgroup => {
            if (accountgroup.MainGroupID == id) {
               var group = new TreeListItem(accountgroup.Name)
                .setType(TREE_LIST_TYPE.LIST)
                //.setContent('Kontogruppe med ID = ' + accountgroup.ID);
            
                console.log("Gruppe " + accountgroup.ID + " MainGroupID " + accountgroup.MainGroupID + " = " + accountgroup.Name);
            
                if (parentgroup == null) {
                    this.accountListItems.push(group);
                } else {
                    console.log("add to parent " + id + " is " + accountgroup.ID);
                    parentgroup.addTreeListItem(group)
                }
                
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
        )  
    }
    
    test()
    {
        //this.uniAccountChange.emit(11);
        this.treeList.showHideAll();
    }
}