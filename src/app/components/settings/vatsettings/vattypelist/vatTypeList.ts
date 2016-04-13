import {Component, ViewChild, Output, EventEmitter} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import "rxjs/add/observable/forkjoin";

import {VatType, VatCodeGroup} from '../../../../unientities';
import {VatTypeService, VatCodeGroupService} from '../../../../services/services';
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {FieldType} from "../../../../unientities";
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
    @Output() uniVatTypeChange = new EventEmitter<VatType>();
    @ViewChild(TreeList) treeList: TreeList;
    vatCodeGroupListItems: TreeListItem[] = [];
    vatcodegroups: VatCodeGroup[];

    constructor(private vatTypeService: VatTypeService, private vatCodeGroupService: VatCodeGroupService) {
    }

    loopGroups() {

        var codeCol = new UniTableColumn('VatCode', 'Kode', 'string').setWidth("15%");
        var aliasCol = new UniTableColumn('Alias', 'Alias', 'string').setWidth("15%");
        var nameCol = new UniTableColumn('Name', 'Navn', 'string').setWidth("50%");
        var percentCol = new UniTableColumn('VatPercent', 'Prosent', 'string').setWidth("15%");
        var copyCol = new UniTableColumn("", "", "boolean")
            .setClass("icon-column")
            .setTemplate("<span label='Venter på bedre rammeverkstøtte for ikonknapper i tabeller' class='is-locked' role='presentation'></span>"
            )
            .setWidth("5%");

        this.vatcodegroups.forEach((vatgroup: VatCodeGroup) => {

            var tableConfig = new UniTableBuilder(this.vatTypeService.GetRelativeUrl(), false)
                .setFilter("VatCodeGroupID eq " + vatgroup.ID)
                .setPageSize(100)
                .setPageable(false)
                .setSearchable(false)
                .addColumns(codeCol, aliasCol, nameCol, percentCol, copyCol)
                .setColumnMenuVisible(false)
                .setSelectCallback((vattype: VatType) => {
                    this.uniVatTypeChange.emit(vattype);
                });

            var list = new TreeListItem(vatgroup.Name)
                .setType(TREE_LIST_TYPE.TABLE)
                .setContent(tableConfig);

            this.vatCodeGroupListItems.push(list);
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
    