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
import {
    SalaryBalance, SalBalType, WageType, Employee, Supplier, SalBalDrawType, StdWageType
} from '../../../../unientities';
import {
    ToastService, ToastType, ToastTime
} from '../../../../../framework/uniToast/toastService';

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

    private drawTypes: { ID: SalBalDrawType, Name: string }[] = [
        { ID: SalBalDrawType.FixedAmount, Name: 'Fast beløp' },
        { ID: SalBalDrawType.InstalmentWithBalance, Name: 'Fast beløp med balanse' },
        { ID: SalBalDrawType.Balance, Name: 'Trekk hele balansen, f.eks. forskudd' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private salarybalanceService: SalarybalanceService,
        private wagetypeService: WageTypeService,
        private employeeService: EmployeeService,
        private supplierService: SupplierService,
        private toastService: ToastService,
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
                .switchMap((salarybalance: SalaryBalance) => {
                    if (salarybalance.ID !== this.salarybalanceID) {
                        if (!salarybalance.ID) {
                            if (employeeID) {
                                salarybalance.EmployeeID = employeeID;
                            }
                            if (type) {
                                salarybalance.InstalmentType = type;
                            }
                        }
                        return this.setup().map(response => {
                            let wagetypes = response[1];
                            if (salarybalance.InstalmentType === SalBalType.Advance && !salarybalance.WageTypeNumber) {
                                let wagetype = wagetypes
                                    .find(wt => wt.StandardWageTypeFor === StdWageType.AdvancePayment);
                                salarybalance.WageTypeNumber = wagetype ? wagetype.WageTypeNumber : 0;
                            }
                            return salarybalance;
                        });
                    }
                    return Observable.of(salarybalance);
                })
                .subscribe((salarybalance: SalaryBalance) => {
                    this.salarybalance$.next(salarybalance);
                    if (!salarybalance.FromDate) { salarybalance.FromDate = new Date(); }
                    this.salarybalanceID = salarybalance.ID;
                    this.updateFields();
                }, err => this.errorService.handle(err));
        });
    }

    public change(changes: SimpleChanges) {
        let previous = changes['InstalmentType'] ? changes['InstalmentType'].previousValue : null;
        let current = changes['InstalmentType'] ? changes['InstalmentType'].currentValue : null;
        if (!previous || (previous !== current)) {
            this.updateFields();
        }

        let model = this.salarybalance$.getValue();

        if (changes['SupplierID']) {
            model.Supplier = this.suppliers.find(supp => supp.ID === model.SupplierID);
        }

        let previousAmount = changes['Amount'] ? changes['Amount'].previousValue : null;
        let currentAmount = changes['Amount'] ? changes['Amount'].currentValue : null;
        if (previousAmount !== currentAmount) {
            if (currentAmount < 0 && this.salarybalance$.getValue().InstalmentType === SalBalType.Advance) {
                this.toastService.addToast('Feil i beløp',
                    ToastType.warn, ToastTime.medium,
                    'Du prøver å føre et forskudd med et negativt beløp');
            } else if (currentAmount > 0 && this.salarybalance$.getValue().InstalmentType !== SalBalType.Advance) {
                this.toastService.addToast('Feil i beløp',
                    ToastType.warn, ToastTime.medium,
                    'Du prøver å føre et trekk med positivt beløp');
            }
        }

        super.updateState('salarybalance', model, true);
    }

    private setup(): Observable<any> {
        return Observable
            .forkJoin(this.getSources())
            .map((response: any) => {
                let [layout, wagetypes, employees, suppliers] = response;
                if (layout.Fields) {
                    this.fields$.next(layout.Fields);
                }
                this.wagetypes = wagetypes;
                this.employees = employees;
                this.suppliers = suppliers;

                return response;
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
        this.fields$
            .take(1)
            .map(fields => {
                let salaryBalance = this.salarybalance$.getValue();
                this.editField(fields, 'InstalmentType', typeField => {
                    typeField.Options = {
                        source: this.salarybalanceService.getInstalmentTypes(),
                        displayProperty: 'Name',
                        valueProperty: 'ID',
                        debounceTime: 500
                    };
                });
                this.editField(fields, 'Type', drawtypeField => {
                    drawtypeField.Options = {
                        source: this.drawTypes,
                        displayProperty: 'Name',
                        valueProperty: 'ID',
                        debounceTime: 500
                    };
                    drawtypeField.ReadOnly = salaryBalance.ID;
                });
                this.editField(fields, 'WageTypeNumber', wagetypeField => {
                    wagetypeField.Options.source = this.wagetypes;
                    wagetypeField.ReadOnly = salaryBalance.ID;
                });

                this.editField(fields, 'EmployeeID', employeeField => {
                    employeeField.Options.source = this.employees;
                    employeeField.ReadOnly = salaryBalance.ID;
                });

                this.editField(fields, 'Instalment', instalmentField => {
                    instalmentField.ReadOnly = salaryBalance.InstalmentPercent;
                });

                this.editField(fields, 'InstalmentPercent', percentField => {
                    percentField.Hidden = salaryBalance.InstalmentType === SalBalType.Advance;
                    percentField.ReadOnly = salaryBalance.Instalment;
                });

                this.editField(fields, 'SupplierID', supplierField => {
                    supplierField.Options.source = this.suppliers;
                    supplierField.Hidden = (salaryBalance.InstalmentType !== SalBalType.Contribution)
                        && (salaryBalance.InstalmentType !== SalBalType.Outlay);
                });

                this.editField(fields, 'KID', kidField => {
                    kidField.Hidden = !(salaryBalance.InstalmentType === SalBalType.Contribution)
                        && !(salaryBalance.InstalmentType === SalBalType.Outlay);
                });

                this.editField(fields, 'Supplier.Info.DefaultBankAccount.AccountNumber', accountField => {
                    accountField.Hidden = !(salaryBalance.InstalmentType === SalBalType.Contribution)
                        && !(salaryBalance.InstalmentType === SalBalType.Outlay);
                });

                this.editField(fields, 'Amount', amountField => {
                    amountField.Label = salaryBalance.InstalmentType === SalBalType.Advance ? 'Beløp' : 'Saldo';
                    amountField.Hidden = this.salarybalanceID > 0;
                });

                return fields;
            })
            .subscribe(fields => this.fields$.next(fields));
    }

    private editField(fields: any[], prop: string, edit: (field: any) => void): void {
        let field = fields.find(fld => fld.Property === prop);
        if (field) {
            edit(field);
        }
    }
}
