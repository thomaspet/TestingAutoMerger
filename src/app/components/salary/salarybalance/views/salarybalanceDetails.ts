import { Component, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UniView } from '../../../../../framework/core/uniView';
import {
    UniCacheService, ErrorService, SalarybalanceService, WageTypeService, EmployeeService, SupplierService
} from '../../../../services/services';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { UniFieldLayout } from 'uniform-ng2/main';
import { SalaryBalance, SalBalType, WageType, Employee, Supplier } from '../../../../unientities';

@Component({
    selector: 'salarybalance-details',
    templateUrl: './salarybalanceDetails.html'
})
export class SalarybalanceDetail extends UniView {
    private salarybalanceID: number;
    private wagetypes: WageType[];
    private employees: Employee[];
    private suppliers: Supplier[];
    private cachedSalaryBalance$: ReplaySubject<SalaryBalance> = new ReplaySubject<SalaryBalance>(1);
    private salarybalance$: BehaviorSubject<SalaryBalance> = new BehaviorSubject(new SalaryBalance());
    public config$: BehaviorSubject<any> = new BehaviorSubject({ autofocus: true });
    public fields$: BehaviorSubject<any> = new BehaviorSubject([]);

    private instalmentTypes: { ID: SalBalType, Name: string }[] = [
        { ID: SalBalType.Advance, Name: 'Forskudd' },
        { ID: SalBalType.Contribution, Name: 'Bidragstrekk' },
        { ID: SalBalType.Outlay, Name: 'Utleggstrekk' },
        { ID: SalBalType.Garnishment, Name: 'Påleggstrekk' },
        { ID: SalBalType.Other, Name: 'Andre' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private salarybalanceService: SalarybalanceService,
        private wagetypeService: WageTypeService,
        private employeeService: EmployeeService,
        private supplierService: SupplierService,
        public cacheService: UniCacheService,
        private errorService: ErrorService
    ) {
        super(router.url, cacheService);

        this.route.parent.params.subscribe(params => {
            super.updateCacheKey(router.url);
            super.getStateSubject('salarybalance').subscribe(salaryBalance => {
                this.cachedSalaryBalance$.next(salaryBalance);
            });
        });

        this.route.params.subscribe(params => {
            let employeeID: number = +params['employeeID'] || undefined;
            let type: SalBalType = +params['instalmentType'] || undefined;

            this.cachedSalaryBalance$
                .subscribe((salarybalance: SalaryBalance) => {
                    if (salarybalance.ID !== this.salarybalanceID) {

                        this.salarybalance$.next(salarybalance);
                        this.salarybalanceID = salarybalance.ID;

                        if (!salarybalance.ID) {
                            if (employeeID) {
                                salarybalance.EmployeeID = employeeID;
                            }
                            if (type) {
                                salarybalance.InstalmentType = type;
                            }

                            if (employeeID || type) {
                                super.updateState('salarybalance', salarybalance, true);
                            }
                        }

                        this.setup();
                    }
                }, err => this.errorService.handle(err));
        });
    }

    public change(changes: SimpleChanges) {
        let previous = changes['InstalmentType'] ? changes['InstalmentType'].previousValue : null;
        let current = changes['InstalmentType'] ? changes['InstalmentType'].currentValue : null;
        if (!previous || (previous !== current)) {
            this.updateFields();
        }

        const model = this.salarybalance$.getValue();
        super.updateState('salarybalance', model, true);
    }

    private setup() {
        Observable.forkJoin(this.getSources())
            .subscribe((response: any) => {
                let [layout, wagetypes, employees, suppliers] = response;
                if (layout.Fields) {
                    this.fields$.next(layout.Fields);
                }
                this.wagetypes = wagetypes;
                this.employees = employees;
                this.suppliers = suppliers;

                this.updateFields();
            }, err => this.errorService.handle(err));
    }

    private getSources() {
        return [
            this.salarybalanceService.layout('SalarybalanceDetails'),
            this.wagetypeService.GetAll(null),
            this.employeeService.GetAll(null),
            this.supplierService.GetAll(null, ['Info', 'Info.DefaultBankAccount'])
        ];
    }

    private updateFields() {
        let typeField: UniFieldLayout = this.findByPropertyName('InstalmentType');
        typeField.Options = {
            source: this.instalmentTypes,
            displayProperty: 'Name',
            valueProperty: 'ID',
            debounceTime: 500
        };

        let wagetypeField: UniFieldLayout = this.findByPropertyName('WagetypeID');
        wagetypeField.Options.source = this.wagetypes;

        let employeeField: UniFieldLayout = this.findByPropertyName('EmployeeID');
        employeeField.Options.source = this.employees;

        let amountField: UniFieldLayout = this.findByPropertyName('Balance');
        amountField.Label = this.salarybalance$.getValue().InstalmentType === SalBalType.Advance ? 'Beløp' : 'Saldo';

        let instalmentField: UniFieldLayout = this.findByPropertyName('Instalment');
        instalmentField.ReadOnly = this.salarybalance$.getValue().InstalmentPercent !== null
            ? (this.salarybalance$.getValue().InstalmentPercent ? true : false) : false;

        let percentField: UniFieldLayout = this.findByPropertyName('InstalmentPercent');
        percentField.Hidden = this.salarybalance$.getValue().InstalmentType === SalBalType.Advance;
        percentField.ReadOnly = this.salarybalance$.getValue().Instalment !== null ? true : false;

        let supplierField: UniFieldLayout = this.findByPropertyName('SupplierID');
        supplierField.Options.source = this.suppliers;
        supplierField.Hidden = !(this.salarybalance$.getValue().InstalmentType === SalBalType.Contribution)
            && !(this.salarybalance$.getValue().InstalmentType === SalBalType.Outlay);

        let kidField: UniFieldLayout = this.findByPropertyName('KID');
        kidField.Hidden = !(this.salarybalance$.getValue().InstalmentType === SalBalType.Contribution)
            && !(this.salarybalance$.getValue().InstalmentType === SalBalType.Outlay);

        let accountField: UniFieldLayout = this.findByPropertyName('Supplier.Info.DefaultBankAccount.AccountNumber');
        accountField.Hidden = !(this.salarybalance$.getValue().InstalmentType === SalBalType.Contribution)
            && !(this.salarybalance$.getValue().InstalmentType === SalBalType.Outlay);

        this.fields$.next(this.fields$.getValue());
    }

    private findByPropertyName(name) {
        return this.fields$.getValue().find((fld) => fld.Property === name);
    }
}
