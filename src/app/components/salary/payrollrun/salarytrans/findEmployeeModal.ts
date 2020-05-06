import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import { UniSearchEmployeeConfig, StatisticsService, IEmployee } from '@app/services/services';
import { IUniSearchConfig } from '../../../../../framework/ui/unisearch/index';
import {SalaryHelperMethods} from '../../shared/services/salaryHelperMethods';
import {EmployeeCategory} from '@uni-entities';
import {Observable, forkJoin} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
    selector: 'uni-find-employee-modal',
    template: `
    <section role="dialog" class="uni-modal uni-redesign" style="width: 40vw; font-size: .9rem">
        <header>Finn ansatte</header>
        <article style="overflow: visible">
            <div>
                Søk etter ansatte
            </div>
            <uni-search
                [config]="uniSearchConfig"
                (changeEvent)="employeeSelected($event)">
            </uni-search>
            <small *ngIf="errorMsg" class="bad"> {{ errorMsg }} </small>

            <div *ngIf="newEmployees.length" class="selected-employee-list">
                <h5> Valgte ansatte: </h5>
                <ul>
                    <li *ngFor="let employee of newEmployees">
                        <span> {{ employee.EmployeeNumber }}. {{ employee.Name }} </span>
                        <i class="material-icons" (click)="remove(employee.ID)"> clear </i>
                    </li>
                </ul>
            </div>

        </article>
        <footer class="center">
            <button class="c2a rounded" (click)="select()" [disabled]="!newEmployees.length">Legg til valgte</button>
            <button (click)="close()">Avbryt</button>
        </footer>
    </section>
    `
})

export class UniFindEmployeeModal implements IUniModal {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    uniSearchConfig: IUniSearchConfig;
    employees: IEmployee[] = [];
    newEmployees: IEmployee[] = [];
    errorMsg: string = '';
    latestAddedID: number = 0;

    constructor(
        private uniSearchEmployeeConfig: UniSearchEmployeeConfig,
        private helperMethods: SalaryHelperMethods,
        private statisticsService: StatisticsService, ) {}

    public ngOnInit() {
        this.uniSearchConfig = this.uniSearchEmployeeConfig.generate();
        this.uniSearchConfig.lookupFn = search => this.getEmployeeData(search);
        this.uniSearchConfig.tableHeader = ['Ansattnr', 'Navn'];
        this.uniSearchConfig.rowTemplateFn = item => [
            item.EmployeeNumber,
            item.Name
        ];
        this.uniSearchConfig.externalLookupFn = null;
        this.employees = this.options.data.employees || [];
    }

    private getEmployeeData(search: string): Observable<IEmployee[]> {
        return forkJoin(this.createEmpFilters(this.options.data.categories, search)
                .map(empFilter => `model=Employee&`
                + `expand=BusinessRelationInfo&`
                + `join=${this.createEmpJoin()}&`
                + `select=${this.createEmpSelect()}&`
                + `filter=${empFilter}&`
                + `top=50`)
                .map(query => this.statisticsService.GetAllUnwrapped(query))
            )
            .pipe(
                map((result: IEmployee[][]) => result.reduce((acc, curr) => [...acc, ...curr], []))
            );
    }

    private createEmpSelect() {
        return 'ID as ID,EmployeeNumber as EmployeeNumber,'
        + 'BusinessRelationInfo.Name as Name,'
        + 'BusinessRelationInfo.DefaultBankAccountID as DefaultBankAccountID,'
        + 'SocialSecurityNumber as SocialSecurityNumber,'
        + 'SubEntityID as SubEntityID,'
        + 'count(EmployeeNumber) as count';
    }

    private createEmpJoin() {
        return  `Employee.ID eq EmployeeCategoryLink.EmployeeID as CatLink`;
    }

    private createEmpFilters(cats: EmployeeCategory[], search: string): string[] {
        const catFilter = this.categoryFilter(cats);
        return this.filterOutExistingEmps([...this.employees, ...this.newEmployees].map(emp => emp.ID))
            .map(unSelectedEmpsFilter => {
                let query = this.handleEmpSearch(search) || '';
                if (catFilter) {
                    query = `${(query && `${query} and `)}${catFilter}`;
                }

                if (unSelectedEmpsFilter) {
                    query = `${(query && `${query} and `)}${unSelectedEmpsFilter}`;
                }
                return query;
            });
    }

    private handleEmpSearch(search: string) {
        if (!search) {
            return search;
        }
        return `( contains(BusinessRelationInfo.Name,'${search}') or startswith(EmployeeNumber,'${search}') )`;
    }

    private categoryFilter(cats: EmployeeCategory[]) {
        if (!cats || !cats.length) {
            return '';
        }
        return this.helperMethods.odataFilter(cats.map(cat => cat.ID), 'CatLink.EmployeeCategoryID');
    }

    private filterOutExistingEmps(empIDs: number[]): string[] {
        if (!empIDs || !empIDs.length) {
            return [''];
        }
        return this.helperMethods.odataFilters(empIDs, 'ID', true);
    }

    public employeeSelected(emp) {
        if (this.employees.findIndex(e => e.ID === emp.ID) !== -1) {
            this.errorMsg = 'Denne ansatte er allerede lagt til denne lønnsavregningen.';
            return;
        }

        const newEmployee = <IEmployee>{
            DefaultBankAccountID: emp.BusinessRelationInfo.DefaultBankAccountID,
            EmployeeNumber: emp.EmployeeNumber,
            ID: emp.ID,
            Name: emp.BusinessRelationInfo.Name,
            SocialSecurityNumber: emp.SocialSecurityNumber,
            SubEntityID: emp.SubEntityID,
        };
        this.latestAddedID = emp.ID;
        this.newEmployees.push(newEmployee);
    }

    public select() {
        const obj = {
            id: this.latestAddedID,
            items: this.employees.concat(this.newEmployees)
        };

        this.onClose.emit(obj);
    }

    public remove(id: number) {
        this.newEmployees = this.newEmployees.filter(x => x.ID !== id);
    }

    public close() {
        this.onClose.emit(false);
    }
}
