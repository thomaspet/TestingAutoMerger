import {Component, OnInit} from '@angular/core';
import {Router } from '@angular/router-deprecated';

import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';
import {WageType} from '../../../unientities';
import {TabService} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'wagetypes',
    templateUrl: 'app/components/salary/wagetype/wagetypeList.html',
    directives: [UniTable]
})
export class WagetypeList implements OnInit {

    private wagetypelistConfig: any;

    constructor(private _router: Router, private tabSer: TabService) {
        this.tabSer.addTab({ name: 'Lønnsarter', url: 'salary/wagetypes', moduleID: 13, active: true });
    }

    public ngOnInit() {

        var idCol = new UniTableColumn('WageTypeId', 'Nr', 'number');
        idCol.setWidth('10rem');

        var nameCol = new UniTableColumn('WageTypeName', 'Navn', 'string');

        var descCol = new UniTableColumn('Description', 'Beskrivelse', 'string');

        this.wagetypelistConfig = new UniTableBuilder('wagetypes', false)
            .setSelectCallback((selectedWagetype: WageType) => {

                this._router.navigateByUrl('/salary/wagetypes/' + selectedWagetype.ID);
            })
            .setOrderBy('WageTypeId', 'asc')
            .addColumns(idCol, nameCol, descCol);
    }
    
    public createWageType() {
        this._router.navigateByUrl('/salary/wagetypes/0');
    }
}
