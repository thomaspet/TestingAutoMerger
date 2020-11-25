import {Component, OnInit} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {PeriodFilter, PeriodFilterHelper} from '../periodFilter/periodFilter';
import {ISelectConfig, UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';
import {
    Project,
    Department
} from '../../../../unientities';
import {
    ProjectService,
    DepartmentService,
    FinancialYearService
} from '../../../../services/services';

declare var _;

@Component({
    selector: 'accounting-balance-report',
    templateUrl: './balancereport.html',
})
export class BalanceReport implements OnInit {
    public filterVisible: boolean = false;

    public periodFilter1: PeriodFilter;
    public periodFilter2: PeriodFilter;
    public filter: any;
    public yearSelectConfig: ISelectConfig;
    public yearItems: any[];

    public filter$: BehaviorSubject<any> = new BehaviorSubject({
        ShowPreviousAccountYear: false,
        Decimals: 0,
        ShowPercent: true
    });
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    private projects: Project[];
    private departments: Department[];

    constructor(
        private tabService: TabService,
        private projectService: ProjectService,
        private departmentService: DepartmentService,
        private periodFilterHelper: PeriodFilterHelper,
        private financialYearService: FinancialYearService
    ) {
        this.tabService.addTab({
            name: 'Balanse - oversikt',
            url: '/accounting/accountingreports/balance',
            moduleID: UniModules.AccountingReports,
            active: true
        });
    }

    public ngOnInit() {
        let financialYear;
        financialYear = this.financialYearService.getActiveYear();

        // get default period filters
        this.periodFilter1 = this.periodFilterHelper.getFilter(1, null, financialYear);
        this.periodFilter2 = this.periodFilterHelper.getFilter(2, this.periodFilter1);
        this.filter = this.filter$.getValue();

        this.yearItems = this.getYearComboSelection(this.periodFilter1.year);

        this.yearSelectConfig = {
            template: (item) => typeof item === 'number' ? item.toString() : item,
            searchable: false,
            placeholder: 'År'
        };

        // get filter data
        Observable.forkJoin(
            this.projectService.GetAll(null),
            this.departmentService.GetAll(null)
        ).subscribe((response: Array<any>) => {
            this.projects = response[0];
            this.departments = response[1];

            this.projects.unshift(null);
            this.departments.unshift(null);

            this.setupFilterForm();
        });
    }

    private getYearComboSelection(curYear): string[]     {
        if (typeof curYear === 'string') { curYear = parseInt(curYear, 10); }
        return [
            curYear - 1,
            curYear + 1];
    }

    public onYearSelect(year) {
        const periodFilter1 = _.cloneDeep(this.periodFilter1);
        periodFilter1.year = year.toString();
        periodFilter1.name = this.periodFilterHelper.getFilterName(periodFilter1);
        this.onPeriodFilter1Changed(periodFilter1);

        const periodFilter2 = _.cloneDeep(this.periodFilter2);
        periodFilter2.year = (year - 1).toString();
        periodFilter2.name = this.periodFilterHelper.getFilterName(periodFilter2);
        this.onPeriodFilter2Changed(periodFilter2);

        this.yearItems = this.getYearComboSelection(year);
    }

    public toggleFilter() {
        if (this.filterVisible) {
            this.hideFilter();
        } else {
            this.showFilter();
        }
    }

    private hideFilter() {
        this.filterVisible = false;
    }

    private showFilter() {
        this.filterVisible = true;
    }

    public onPeriodFilter1Changed(event) {
        this.periodFilter1 = event;
        this.periodFilterHelper.saveFilterSettings(1, this.periodFilter1);
    }

    public onPeriodFilter2Changed(event) {
        this.periodFilter2 = event;
        this.periodFilterHelper.saveFilterSettings(2, this.periodFilter2);
    }

    //
    // Project/Department filter
    //

    private setupFilterForm() {
        // Dimension filters
        const project = new UniFieldLayout();
        project.Property = 'ProjectID';
        project.FieldType = FieldType.DROPDOWN;
        project.Label = 'Prosjekt';
        project.FeaturePermission = 'ui.dimensions';
        project.Legend = 'Filter';
        project.FieldSet = 1;
        project.Placeholder = 'Projekt';
        project.Options = {
            source: this.projects,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.ProjectNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        const department = new UniFieldLayout();
        department.Property = 'DepartmentID';
        department.FieldType = FieldType.DROPDOWN;
        department.Label = 'Avdeling';
        department.FeaturePermission = 'ui.dimensions';
        department.Legend = 'Filter';
        department.FieldSet = 1;
        department.Options = {
            source: this.departments,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.DepartmentNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        // Numbers
        const decimals = new UniFieldLayout();
        decimals.Property = 'Decimals';
        decimals.FieldType = FieldType.DROPDOWN;
        decimals.Label = 'Antall desimaler';
        decimals.Legend = 'Visning';
        decimals.FieldSet = 2;
        decimals.Options = {
            source: [{Decimals: 0}, {Decimals: 2}],
            valueProperty: 'Decimals',
            template: (item) => {
                return item.Decimals.toString();
            },
            debounceTime: 200
        };

        const showprevyear = new UniFieldLayout();
        showprevyear.Property = 'ShowPreviousAccountYear';
        showprevyear.FieldType = FieldType.CHECKBOX;
        showprevyear.Label = 'Vis foregående år';
        showprevyear.Legend = 'Visning';
        showprevyear.FieldSet = 2;

        this.fields$.next([project, department, decimals, showprevyear]);
    }

    public onFilterChange(event) {
        this.filter = _.cloneDeep(this.filter$.getValue());
    }
}
