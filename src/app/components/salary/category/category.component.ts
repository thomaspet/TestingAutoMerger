import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '@uni-framework/ui/unitable';
import {ErrorService} from '@app/services/services';
import {EmployeeCategory} from '@uni-entities';
import { EmployeeCategoryService } from '@app/components/salary/shared/services/category/employee-category.service';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';

@Component({
    selector: 'employeecategories',
    templateUrl: './category.component.html',
})
export class CategoryListComponent implements OnInit {
    tableConfig: UniTableConfig;
    categories: EmployeeCategory[];

    public toolbarActions = [{
        label: 'Ny kategori',
        action: this.createCategory.bind(this),
        main: true,
        disabled: false
    }];

    constructor(
        private router: Router,
        private tabService: TabService,
        private categoryService: EmployeeCategoryService,
        private errorService: ErrorService
    ) {
        this.tabService.addTab({
            name: 'Kategorier', url: 'salary/employeecategories', moduleID: UniModules.Categories, active: true
        });
    }

    public ngOnInit() {
        this.categoryService.GetAll().subscribe(
            res => this.categories = res,
            err => this.errorService.handle(err)
        );

        this.tableConfig = new UniTableConfig('salary.category.categoryList', false, true, 15)
            .setSearchable(true)
            .setColumns([
                new UniTableColumn('ID', 'Nummer', UniTableColumnType.Number)
                    .setWidth('7rem')
                    .setResizeable(false),
                new UniTableColumn('Name', 'Navn')
            ]);
    }

    public rowSelected(row) {
        this.router.navigateByUrl('/salary/employeecategories/' + row.ID);
    }

    public createCategory() {
        this.router.navigateByUrl('/salary/employeecategories/0');
    }
}
