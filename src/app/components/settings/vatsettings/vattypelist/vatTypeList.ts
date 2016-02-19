import {Component, ViewChild} from 'angular2/core';
import {IVatType} from '../../../../../framework/interfaces/interfaces';
import {VatTypeService} from '../../../../services/services';
import {UNI_CONTROL_DIRECTIVES} from '../../../../../framework/controls';
import {UNI_CONTROL_TYPES} from '../../../../../framework/controls/types';
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder, UniComboFieldBuilder, UniSectionBuilder} from '../../../../../framework/forms';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {TreeList, TreeListItem, TREE_LIST_TYPE} from "../../../../../framework/treeList";

@Component({
    selector: 'vattype-list',
    templateUrl: 'app/components/settings/vatSettings/vattypelist/vattypelist.html',
    providers: [VatTypeService]
})
export class VatTypeList {
    @ViewChild(TreeList) treeList: TreeList;
    vatListItems: TreeListItem[] = [];
    vatgroups;

    constructor(private vatTypeService: VatTypeService) {}
    
    loopGroups() {
        this.vatgroups.forEach((vatgroup: any) => {           
            console.log(vatgroup);
            
            var nameCol = new UniTableColumn('Name', 'Navn', 'string'); 
                        
            var tableConfig = new UniTableBuilder("vattype", false)
            .setPageSize(10)
            .addColumns(nameCol)
       
            var list = new TreeListItem(vatgroup.Name)
                .setType(TREE_LIST_TYPE.TABLE)
                .setContent(tableConfig);
                
            this.vatListItems.push(list);
        });
    }

    
    ngOnInit() {
        console.log('vatlist initializing');   
        
        this.vatgroups = [
            {ID: 1, No: 1, Name: "Innenlands omsetning og uttak" },
            {ID: 2, No: 2, Name: "Utførsel" }
        ];
        
        this.loopGroups();
        //var vattype = this.vatTypeService.Get(XX);    
        
                 
    }    
}
    