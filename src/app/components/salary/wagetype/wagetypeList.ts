import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {WageTypeService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';

import {WageType} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'wagetypes',
    templateUrl: 'app/components/salary/wagetype/wagetypeList.html',
})
export class WagetypeList implements OnInit {

    private tableConfig: UniTableConfig;
    private wageTypes$: Observable<WageType>;

    constructor(private _router: Router, private tabSer: TabService, private _wageTypeService: WageTypeService) {
        this.tabSer.addTab({ name: 'Lønnsarter', url: 'salary/wagetypes', moduleID: UniModules.Wagetypes, active: true });
    }

    public ngOnInit() {

        this.wageTypes$ = this._wageTypeService.GetAll('WageTypeId ASC');

        let idCol = new UniTableColumn('WageTypeNumber', 'Nr', UniTableColumnType.Number);
        idCol.setWidth('10rem');

        var nameCol = new UniTableColumn('WageTypeName', 'Navn', UniTableColumnType.Text);

        var descCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text);

        this.tableConfig = new UniTableConfig()
            .setColumns([idCol, nameCol, descCol])
            .setEditable(false)
            .setPageSize(15);
    }

    public rowSelected(event) {
        this._router.navigateByUrl('/salary/wagetypes/' + event.rowModel.ID);
    }

    public createWageType() {
        this._router.navigateByUrl('/salary/wagetypes/0');
    }
}
