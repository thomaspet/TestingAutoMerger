import { Component, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UniView } from '../../../../../framework/core/uniView';
import {
    UniCacheService, ErrorService, SalarybalanceService,
    WageTypeService, EmployeeService, SupplierService, ModulusService
} from '../../../../services/services';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { UniFieldLayout } from 'uniform-ng2/main';
import {
    SalaryBalance, SalBalType, WageType, Employee, Supplier, SalBalDrawType, StdWageType, CompanySalary
} from '../../../../unientities';
import {
    ToastService, ToastType, ToastTime
} from '../../../../../framework/uniToast/toastService';
import { UniImage, UniImageSize } from '../../../../../framework/uniImage/uniImage';
import { ImageModal } from '../../../common/modals/ImageModal';

@Component({
    selector: 'salarybalance-details',
    templateUrl: './salarybalanceDetails.html'
})
export class SalarybalanceDetail extends UniView {
    private salarybalanceID: number;
    private wagetypes: WageType[];
    private employees: Employee[];
    private suppliers: Supplier[];
    private invalidKID: boolean;
    private cachedSalaryBalance$: ReplaySubject<SalaryBalance> = new ReplaySubject<SalaryBalance>(1);
    private salarybalance$: BehaviorSubject<SalaryBalance> = new BehaviorSubject(new SalaryBalance());
    
    public config$: BehaviorSubject<any> = new BehaviorSubject({ autofocus: true });
    public fields$: BehaviorSubject<any> = new BehaviorSubject([]);
    public unlinkedFiles: Array<number> = [];

    @ViewChild(UniImage) public uniImage: UniImage;
    @ViewChild(ImageModal) public imageModal: ImageModal;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private salarybalanceService: SalarybalanceService,
        private wagetypeService: WageTypeService,
        private employeeService: EmployeeService,
        private supplierService: SupplierService,
        private toastService: ToastService,
        protected cacheService: UniCacheService,
        private errorService: ErrorService,
        private modulusService: ModulusService
    ) {
        super(router.url, cacheService);

        this.route.parent.params.subscribe(params => {
            super.updateCacheKey(router.url);
            super.getStateSubject('salarybalance').subscribe(salaryBalance => {
                this.cachedSalaryBalance$.next(salaryBalance);
            });
            this.invalidKID = false;
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
                            this.setWagetype(salarybalance, response[1]);
                            return salarybalance;
                        });
                    }
                    return Observable.of(salarybalance);
                })
                .subscribe((salarybalance: SalaryBalance) => {
                    this.salarybalance$.next(salarybalance);
                    if (!salarybalance.FromDate) { salarybalance.FromDate = new Date(); }
                    this.salarybalanceID = salarybalance.ID;
                    this.updateFields(salarybalance);
                }, err => this.errorService.handle(err));

            Observable
                .combineLatest(this.cachedSalaryBalance$, super.getStateSubject('CompanySalary'))
                .subscribe((result: [SalaryBalance, CompanySalary]) => {
                    let [salaryBalance, companySalary] = result;
                    if (!salaryBalance.ID) {
                        salaryBalance.CreatePayment = companySalary.RemitRegularTraits;
                    }
                    this.updateFields(salaryBalance);
                });
        });
    }

    public change(changes: SimpleChanges) {
        this.salarybalance$
            .take(1)
            .filter(() => Object
                .keys(changes)
                .some(key => changes[key].currentValue !== changes[key].previousValue))
            .map(model => {
                if (changes['InstalmentType']) {
                    this.setWagetype(model);
                }

                if (changes['KID'] || changes['Instalment']) {
                    this.validateKID(model);
                }
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
                    } else if (currentAmount > 0
                        && this.salarybalance$.getValue().InstalmentType !== SalBalType.Advance) {
                        this.toastService.addToast('Feil i beløp',
                            ToastType.warn, ToastTime.medium,
                            'Du prøver å føre et trekk med positivt beløp');
                    }
                }
                return model;
            })
            .do(model => this.updateFields(model, changes))
            .subscribe(model => super.updateState('salarybalance', model, true));
    }

    public onImageClicked(file) {
        if (this.salarybalanceID > 0) {
            this.imageModal.openReadOnly('SalaryBalance', this.salarybalanceID, file.ID, UniImageSize.large);
        }
    }

    public onFileListReady(files: Array<any>) {
        if (files && files.length) {
            this.checkNewFiles(files);
        }
    }

    private checkNewFiles(files: Array<any>) {

        if ((!files) || files.length === 0) {
            return;
        }
        let firstFile = files[0];
        const current = this.salarybalance$.getValue();
        if (!current.ID) {
            if (this.unlinkedFiles.findIndex(x => x === firstFile.ID) < 0) {
                this.unlinkedFiles.push(firstFile.ID);
            }
        }
        current['_newFiles'] = this.unlinkedFiles;
        this.salarybalance$.next(current);
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

    private updateFields(salaryBalance: SalaryBalance, changes: SimpleChanges = null) {
        this.fields$
            .take(1)
            .map(fields => {
                this.editField(fields, 'InstalmentType', typeField => {
                    typeField.Options = {
                        source: this.salarybalanceService.getInstalmentTypes(),
                        displayProperty: 'Name',
                        valueProperty: 'ID',
                        debounceTime: 500
                    };
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
                    supplierField.Hidden = this.isHiddenByInstalmentType(salaryBalance);
                });
                this.editField(fields, 'KID', kidField => {
                    kidField.Options = {};
                    kidField.Hidden = this.isHiddenByInstalmentType(salaryBalance);
                });
                this.editField(fields, 'Supplier.Info.DefaultBankAccount.AccountNumber', accountField => {
                    accountField.Options = {};
                    accountField.Hidden = this.isHiddenByInstalmentType(salaryBalance);
                });
                this.editField(fields, 'Amount', amountField => {
                    amountField.Options = {};
                    amountField.Label = salaryBalance.InstalmentType === SalBalType.Advance ? 'Beløp' : 'Saldo';
                    amountField.Hidden = this.salarybalanceID > 0
                        || salaryBalance.InstalmentType === SalBalType.Contribution;
                });
                this.editField(fields, 'CreatePayment', createPayment => {
                    createPayment.Hidden = this.isHiddenByInstalmentType(salaryBalance);
                });
                return fields;
            })
            .subscribe(fields => this.fields$.next(fields));
    }

    private isHiddenByInstalmentType(salaryBalance: SalaryBalance) {
        return (salaryBalance.InstalmentType !== SalBalType.Contribution)
            && (salaryBalance.InstalmentType !== SalBalType.Outlay)
            && (salaryBalance.InstalmentType !== SalBalType.Other);
    }

    private editField(fields: any[], prop: string, edit: (field: any) => void): void {
        let field = fields.find(fld => fld.Property === prop);
        if (field) {
            edit(field);
        }
    }

    private validateKID(salaryBalance: SalaryBalance) {
        this.invalidKID = !this.isHiddenByInstalmentType(salaryBalance)
            && !this.modulusService.isValidKID(salaryBalance.KID);
    }

    private setWagetype(salarybalance: SalaryBalance, wagetypes = null) {
        let wagetype: WageType;
        wagetypes = wagetypes || this.wagetypes;

        if (!salarybalance.WageTypeNumber && wagetypes) {
            switch (salarybalance.InstalmentType) {
                case SalBalType.Advance:
                    wagetype = wagetypes.find(wt => wt.StandardWageTypeFor === StdWageType.AdvancePayment);
                    break;
                case SalBalType.Contribution:
                    wagetype = wagetypes.find(wt => wt.StandardWageTypeFor === StdWageType.Contribution);
                    break;
                case SalBalType.Garnishment:
                    wagetype = wagetypes.find(wt => wt.StandardWageTypeFor === StdWageType.Garnishment);
                    break;
                case SalBalType.Outlay:
                    wagetype = wagetypes.find(wt => wt.StandardWageTypeFor === StdWageType.Outlay);
                    break;
            }
            salarybalance.WageTypeNumber = wagetype ? wagetype.WageTypeNumber : 0;
        }
    }
}
