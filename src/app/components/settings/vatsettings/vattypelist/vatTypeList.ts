import {Component, ViewChild, Output, EventEmitter} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import "rxjs/add/observable/forkjoin";

import {IVatType, IVatCodeGroup} from '../../../../../framework/interfaces/interfaces';
import {VatTypeService, VatCodeGroupService} from '../../../../services/services';
import {UNI_CONTROL_DIRECTIVES} from '../../../../../framework/controls';
import {UNI_CONTROL_TYPES} from '../../../../../framework/controls/types';
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder, UniComboFieldBuilder, UniSectionBuilder} from '../../../../../framework/forms';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {TreeList, TreeListItem, TREE_LIST_TYPE} from "../../../../../framework/treeList";


@Component({
    selector: 'vattype-list',
    templateUrl: 'app/components/settings/vatSettings/vattypelist/vattypelist.html',
    providers: [VatTypeService, VatCodeGroupService],
     directives: [TreeList]
})
export class VatTypeList {
    @Output()
    uniVatTypeChange = new EventEmitter<number>();
   @ViewChild(TreeList) treeList: TreeList;
    vatCodeGroupListItems: TreeListItem[] = [];
    vatcodegroups : IVatCodeGroup[];

    constructor(private vatTypeService: VatTypeService, private vatCodeGroupService: VatCodeGroupService) {}
    
    loopGroups() {
        this.vatcodegroups.forEach((vatgroup: IVatCodeGroup) => {           
            console.log(vatgroup); 
                  
            var group = new TreeListItem(vatgroup.Name)
                .setType(TREE_LIST_TYPE.LIST);
            
            this.vatCodeGroupListItems.push(group);
                       
            var nameCol = new UniTableColumn('Name', 'Navn', 'string');
            
            var tableConfig = new UniTableBuilder(this.vatTypeService.GetRelativeUrl(), false)
                .setFilter("VatCodeGroupId eq " + vatgroup.ID)
                .setPageSize(100)
                .setPageable(false)
                .addColumns(nameCol)
                .setSelectCallback((vattype: IVatType) => {
                    this.uniVatTypeChange.emit(vattype.ID);
                });
       
            var list = new TreeListItem(vatgroup.Name)
                .setType(TREE_LIST_TYPE.TABLE)
                .setContent(tableConfig);
                
            group.addTreeListItem(list);            
        });
        
            
       console.log('this.vatCodeGroupListItems.length: ' + this.vatCodeGroupListItems.length);         
    }

    
    ngOnInit() {
        console.log('vatlist initializing');   
        
        Observable.forkJoin(
                this.vatCodeGroupService.GetAll(null)
        ).subscribe(response => {
            var [vatcodegroups] = response;
            this.vatcodegroups = vatcodegroups;
            
            this.loopGroups();            
            //this.buildForm();                
        });
                         
    }    
}
    