import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeCategoryService } from '../../../../services/services';
import { UniForm } from 'uniform-ng2/main';
import { EmployeeCategory } from '../../../../unientities';
import { Observable } from 'rxjs/Observable';
import { UniTableConfig, UniTableColumnType, UniTableColumn } from 'unitable-ng2/main';

import { UniView } from '../../../../../framework/core/uniView';
import { UniCacheService, ErrorService} from '../../../../services/services';

declare var _; // lodash

@Component({
    selector: 'category-details',
    templateUrl: 'app/components/salary/category/views/categoryDetails.html'
})
export class CategoryDetail extends UniView {
    private currentCategory: EmployeeCategory;
    private categoryID: number;
    private categoriesUsedInEmployeesConfig: UniTableConfig;
    private categoriesUsedInPayrollrunConfig: UniTableConfig;
    private categoriesUsedInEmployees: any[] = [];
    private categoriesUsedInPayrollruns: any[] = [];

    public config: any = {
        autofocus: true,
        submitText: '',
        sections: {
            '1': { isOpen: true },
            '2': { isOpen: true }
        }
    };
    public fields: any[] = [];

    @ViewChild(UniForm) public uniform: UniForm;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private categoryService: EmployeeCategoryService,
        public cacheService: UniCacheService,
        private errorService: ErrorService
    ) {

        super(router.url, cacheService);

        this.route.parent.params.subscribe(params => {
            super.updateCacheKey(router.url);
            super.getStateSubject('employeecategory').subscribe((category: EmployeeCategory) => {
                if (category.ID !== this.categoryID) {
                    this.currentCategory = category;
                    this.categoryID = category.ID;
                    this.setup();
                }
            }, err => this.errorService.handle(err));
        });
    }

    private setup() {
        Observable.forkJoin(
            this.categoryService.layout('CategoryDetails'),
            this.categoryService.getEmployeesInCategory(this.categoryID),
            this.categoryService.getPayrollrunsInCategory(this.categoryID)
        ).subscribe(
            (response: any) => {
                let [layout, catOnEmps, catOnPayrolls] = response;
                
                this.fields = layout.Fields;
                this.categoriesUsedInEmployees = catOnEmps;
                this.categoriesUsedInPayrollruns = catOnPayrolls;

                this.setupEmployeesInCategoryConfig();
                this.setupPayrollrunsInCategoryConfig();
            },
            err => this.errorService.handle(err)
        );
    }
    
    private setupEmployeesInCategoryConfig() {
        let numberCol = new UniTableColumn('EmployeeNumber', 'Ansattnr', UniTableColumnType.Number);
        numberCol.setWidth('7rem');
        let nameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text);

        this.categoriesUsedInEmployeesConfig = new UniTableConfig(false, true, 15)
            .setColumns([numberCol, nameCol])
            .setAutoAddNewRow(false);
    }

    private setupPayrollrunsInCategoryConfig() {
        let numberCol = new UniTableColumn('ID', 'Nummer', UniTableColumnType.Number);
        numberCol.setWidth('7rem');
        let descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text);

        this.categoriesUsedInPayrollrunConfig = new UniTableConfig(false, true, 15)
            .setColumns([numberCol, descriptionCol])
            .setAutoAddNewRow(false);
    }

    public change(model) {
        super.updateState('employeecategory', model, true);
    }

    public toggle(section) {
        
    }
}
