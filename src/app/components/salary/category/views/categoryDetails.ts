import {Component, ViewChild, SimpleChanges, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EmployeeCategoryService, EmployeeService, FinancialYearService} from '../../../../services/services';
import {UniForm} from '../../../../../framework/ui/uniform/index';
import {EmployeeCategory, PayrollRun, Employee, EmployeeCategoryLink} from '../../../../unientities';
import {Subject, BehaviorSubject} from 'rxjs';
import {UniTableConfig, UniTableColumnType, UniTableColumn, UniTableColumnSortMode} from '../../../../../framework/ui/unitable/index';

import {UniView} from '../../../../../framework/core/uniView';
import {UniCacheService, ErrorService} from '../../../../services/services';

import * as _ from 'lodash';
import {catchError, map} from 'rxjs/operators';

const EMP_CAT_LINKS_KEY = 'employeeCategoryLinks';
const EMP_CAT_KEY = 'employeecategory';

@Component({
    selector: 'category-details',
    templateUrl: './categoryDetails.html'
})
export class CategoryDetail extends UniView implements OnDestroy {
    public currentCategory$: BehaviorSubject<EmployeeCategory> = new BehaviorSubject(new EmployeeCategory());
    private destroy$: Subject<void> = new Subject<void>();
    private categoryID: number;
    public categoriesUsedInEmployeesConfig: UniTableConfig;
    public categoriesUsedInPayrollrunConfig: UniTableConfig;
    public categoriesUsedInEmployees: EmployeeCategoryLink[] = [];
    public categoriesUsedInPayrollruns: PayrollRun[] = [];

    public config$: BehaviorSubject<any> = new BehaviorSubject({
        autofocus: true,
        submitText: '',
        sections: {
            '1': { isOpen: true },
            '2': { isOpen: true }
        }
    });
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    @ViewChild(UniForm, { static: true }) public uniform: UniForm;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private categoryService: EmployeeCategoryService,
        protected cacheService: UniCacheService,
        private errorService: ErrorService,
        private employeeService: EmployeeService,
        private yearService: FinancialYearService,
    ) {

        super(router.url, cacheService);

        this.route.parent.params.subscribe(params => {
            super.updateCacheKey(router.url);
            super.getStateSubject(EMP_CAT_KEY)
                .takeUntil(this.destroy$)
                .subscribe((category: EmployeeCategory) => {
                if (category.ID !== this.categoryID) {
                    this.currentCategory$.next(category);
                    this.categoryID = category.ID;
                    this.setup();
                }
            }, err => this.errorService.handle(err));

            super.getStateSubject(EMP_CAT_LINKS_KEY)
                .takeUntil(this.destroy$)
                .subscribe(empLinks => this.categoriesUsedInEmployees = empLinks);
        });
    }

    public ngOnDestroy() {
        this.destroy$.next();
    }

    private setup() {
        this.setupData();
        this.setupConfigs();
    }

    private setupData() {

        this.categoryService
            .getPayrollrunsInCategory(this.categoryID)
            .pipe(
                map(runs => runs.map(x => {
                    x.PayDate = new Date(x.PayDate);
                    return x;
                })),
                map(runs => runs.filter(run => run.PayDate.getFullYear() === this.yearService.getActiveYear())),
                map(runs => runs.sort((run1, run2) => run1.PayDate > run2.PayDate ? -1 : 1)),
                catchError((err, obs) => this.errorService.handleRxCatch(err, obs))
            )
            .subscribe( catOnPayrolls => this.categoriesUsedInPayrollruns = catOnPayrolls);
    }

    private setupConfigs() {
        this.setupEmployeesInCategoryConfig();
        this.setupPayrollrunsInCategoryConfig();
        this.categoryService.layout('CategoryDetails').subscribe(layout => this.fields$.next(layout.Fields));
    }

    private setupEmployeesInCategoryConfig() {
        const numberCol = new UniTableColumn('Employee', 'Ansattnr', UniTableColumnType.Lookup, (row) => !row.ID)
            .setDisplayField('Employee.EmployeeNumber')
            .setOptions({
                itemTemplate: (selectedItem: Employee) => !!selectedItem
                    ? `${selectedItem.EmployeeNumber} - ${selectedItem.BusinessRelationInfo.Name}`
                    : '',
                lookupFunction: (query: string) => !!query
                ? this.employeeService
                    .GetAll(
                        `filter=startswith(EmployeeNumber,'${query}') or contains(BusinessRelationInfo.Name,'${query}')&top=50`,
                        ['BusinessRelationInfo'])
                : []
            });
        numberCol.setAlignment('right').setWidth(10);
        const nameCol = new UniTableColumn('Employee.BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text, false);

        const configStoreKey = 'salary.category.details.employees';
        this.categoriesUsedInEmployeesConfig = new UniTableConfig(configStoreKey, true, false)
            .setColumns([numberCol, nameCol])
            .setSearchable(true)
            .setDeleteButton(true);
    }

    private setupPayrollrunsInCategoryConfig() {
        const numberCol = new UniTableColumn('ID', 'Nummer', UniTableColumnType.Number).setWidth(10);
        const descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text);

        const configStoreKey = 'salary.category.details.payrollRuns';
        this.categoriesUsedInPayrollrunConfig = new UniTableConfig(configStoreKey, false, true, 15)
            .setColumns([numberCol, descriptionCol])
            .setAutoAddNewRow(false)
            .setDefaultOrderBy('PayDate', -1);
    }

    public formChange(change: SimpleChanges) {
        const model = this.currentCategory$.getValue();
        super.updateState(EMP_CAT_KEY, model, true);
    }

    public employeeResourceChange() {
        const isDirty = this.categoriesUsedInEmployees
            .filter(link => !link['_isEmpty'])
            .some(link => !link.ID || link.Deleted);
        super.updateState(EMP_CAT_LINKS_KEY, this.categoriesUsedInEmployees, isDirty);
    }
}
