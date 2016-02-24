import {Component, ViewChild, Output, EventEmitter} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import "rxjs/add/observable/forkjoin";

import {IVatType, IVatCodeGroup} from '../../../../../framework/interfaces/interfaces';
import {VatTypeService, VatCodeGroupService} from '../../../../services/services';
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {FieldType} from "../../../../../framework/interfaces/interfaces";
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
    @Output() uniVatTypeChange = new EventEmitter<IVatType>();
    @ViewChild(TreeList) treeList: TreeList;
    vatCodeGroupListItems: TreeListItem[] = [];
    vatcodegroups : IVatCodeGroup[];

    constructor(private vatTypeService: VatTypeService, private vatCodeGroupService: VatCodeGroupService) {}
    
    loopGroups() {
        
        var codeCol = new UniTableColumn('VatCode', 'Kode', 'string').setWidth("15%");;
        var aliasCol = new UniTableColumn('Alias', 'Alias', 'string').setWidth("15%");;
        var nameCol = new UniTableColumn('Name', 'Navn', 'string').setWidth("50%");
        var percentCol = new UniTableColumn('VatPercent', 'Prosent', 'string').setWidth("15%");            
        var copyCol = new UniTableColumn("", "", "boolean")
            .setClass("icon-column")
            .setTemplate("<span label='Venter på bedre rammeverkstøtte for ikonknapper i tabeller' class='is-locked' role='presentation'></span>"
            )
            .setWidth("5%");
            
        this.vatcodegroups.forEach((vatgroup: IVatCodeGroup) => {           
                  
            var group = new TreeListItem(vatgroup.Name)
                .setType(TREE_LIST_TYPE.LIST);
            
            this.vatCodeGroupListItems.push(group);
                       
            var tableConfig = new UniTableBuilder(this.vatTypeService.GetRelativeUrl(), false)
                .setFilter("VatCodeGroupID eq " + vatgroup.ID)
                .setPageSize(100)
                .setPageable(false)
                .setSearchable(false)
                .addColumns(codeCol, aliasCol, nameCol, percentCol, copyCol)
                .setSelectCallback((vattype: IVatType) => {
                    this.uniVatTypeChange.emit(vattype);
                });
       
            var list = new TreeListItem(vatgroup.Name)
                .setType(TREE_LIST_TYPE.TABLE)
                .setContent(tableConfig);
                
            group.addTreeListItem(list);            
        });          
    }
    
    ngOnInit() {
        
        this.vatCodeGroupService.GetAll(null)
            .subscribe(response => {
                this.vatcodegroups = response;                
                this.loopGroups();
            });
    }    
}
    