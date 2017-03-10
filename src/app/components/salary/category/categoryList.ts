import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {EmployeeCategoryService, ErrorService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
import {EmployeeCategory} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'employeecategories',
    templateUrl: './categoryList.html',
})
export class CategoryList implements OnInit {

    private tableConfig: UniTableConfig;
    private categories$: Observable<EmployeeCategory>;

    constructor(
        private _router: Router,
        private tabSer: TabService,
        private _categoryService: EmployeeCategoryService,
        private errorService: ErrorService
    ) {
        this.tabSer.addTab(
            {
                name: 'Kategorier', url: 'salary/employeecategories', moduleID: UniModules.Categories, active: true
            }
        );
    }

    public ngOnInit() {

        this.categories$ = this._categoryService.GetAll('')
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));

        const idCol = new UniTableColumn('ID', 'Nummer', UniTableColumnType.Number);
        idCol.setWidth('7rem');
        const nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text);

        this.tableConfig = new UniTableConfig(false, true, 15)
            .setColumns([idCol, nameCol])
            .setSearchable(true);
    }

    public rowSelected(event) {
        this._router.navigateByUrl('/salary/employeecategories/' + event.rowModel.ID);
    }

    public createCategory() {
        this._router.navigateByUrl('/salary/employeecategories/0');
    }
}
