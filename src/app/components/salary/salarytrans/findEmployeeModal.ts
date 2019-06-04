import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import { UniSearchEmployeeConfig } from '@app/services/services';
import { IUniSearchConfig } from '../../../../framework/ui/unisearch/index';
import { allResolved } from 'q';
import {IEmployee} from './salarytransactionSelectionList';

@Component({
    selector: 'uni-find-employee-modal',
    template: `
    <section role="dialog" class="uni-modal uni-redesign" style="width: 40vw; font-size: .9rem">
        <header>
            <h1>Finn ansatte</h1>
        </header>
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
                        <i class="material-icons"> clear </i>
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

    constructor(private uniSearchEmployeeConfig: UniSearchEmployeeConfig) {}

    public ngOnInit() {
        this.uniSearchConfig = this.uniSearchEmployeeConfig.generate();
        this.employees = this.options.data.employees || [];
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

    public close() {
        this.onClose.emit(false);
    }
}
