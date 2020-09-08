import { Component, OnChanges, SimpleChanges, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SalaryBalance, SalBalType, Supplier, SalaryBalanceTemplate, WageType, StdWageType, SalaryBalanceLine } from '@uni-entities';
import { UniImage } from '@uni-framework/uniImage/uniImage';
import { UniForm, UniFieldLayout } from '@uni-framework/ui/uniform';
import { SalarybalanceService, UniCacheService} from '@app/services/services';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { tap, switchMap, filter, take, map } from 'rxjs/operators';

@Component({
  selector: 'uni-salary-balance-details',
  templateUrl: './salary-balance-details.component.html',
  styleUrls: ['./salary-balance-details.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SalaryBalanceDetailsComponent implements OnChanges {
        private lastChanges$: BehaviorSubject<SimpleChanges> = new BehaviorSubject({});
        public salarybalance$: BehaviorSubject<SalaryBalance> = new BehaviorSubject(new SalaryBalance());

        public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
        public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
        public unlinkedFiles: Array<number> = [];
        public collapseSummary: boolean = false;
        public summaryBusy$: BehaviorSubject<boolean> = new BehaviorSubject(false);

        @ViewChild(UniImage) public uniImage: UniImage;
        @ViewChild(UniForm, { static: true }) public form: UniForm;

        @Input() public salarybalance: SalaryBalance;
        @Input() public ignoreFields: string[] = ['SalarytransactionDescription'];
        @Input() busy: boolean;
        @Output() private salarybalanceChange: EventEmitter<SalaryBalance> = new EventEmitter<SalaryBalance>();

        constructor(
            private salarybalanceService: SalarybalanceService,
            private toastService: ToastService,
            protected cacheService: UniCacheService,
        ) { }

        public ngOnChanges(changes: SimpleChanges) {
            Observable
                .of(changes)
                .filter(change => !!change['salarybalance'] && !!change['salarybalance'].currentValue )
                .map(change => change['salarybalance'])
                .switchMap(salBalChange => !salBalChange.previousValue || salBalChange.previousValue.ID !== salBalChange.currentValue.ID
                    ? this.setup(salBalChange.currentValue)
                    : Observable.of(salBalChange.currentValue))
                .subscribe(salbal => this.salarybalance$.next(salbal));
        }

        public change(changes: SimpleChanges) {
            this.salarybalance$
                .pipe(
                    take(1),
                    filter(() => Object
                        .keys(changes)
                        .some(key => changes[key].currentValue !== changes[key].previousValue)),
                    switchMap(model => {
                        const instalmentTypeOrEmployeeChange = (changes['InstalmentType'] || changes['EmployeeID'])
                            && !model.SalaryBalanceTemplateID;
                        return changes['SalaryBalanceTemplateID'] || instalmentTypeOrEmployeeChange
                            ? this.salarybalanceService.fill(model)
                            : of(model);
                    }),
                    map(model => {

                        if (changes['InstalmentType']) {
                            this.salarybalanceService.resetFields(model);
                            this.toggleReadOnly(model, 'InstalmentType');
                        }

                        if (changes['SupplierID']) {
                            this.salarybalanceService.getSuppliers()
                            .subscribe((suppliers: Supplier[]) => {
                                model.Supplier = suppliers.find(supp => supp.ID === model.SupplierID);
                            });
                            if (!model.SupplierID) {
                                this.salarybalanceService.resetCreatePayment(model);
                            }
                        }

                        if (changes['Amount']) {
                            if (changes['Amount'].currentValue < 0) {
                                let message = '';
                                switch (model.InstalmentType) {
                                    case SalBalType.Advance:
                                        message = 'Du prøver å føre et forskudd med et negativt beløp';
                                        break;
                                    default:
                                        message = 'Du prøver å føre et trekk med negativ saldo';
                                }
                                if (message) {
                                    this.toastService.addToast('Feil i beløp',
                                        ToastType.warn, ToastTime.medium,
                                        message);
                                }
                            }
                        }

                        if (changes['CreatePayment']) {
                            this.salarybalanceService.validateCreatePaymentChange(model);
                        }

                        return model;
                    }),
                    tap(() => this.lastChanges$.next(changes))
                )
                .subscribe((model: SalaryBalance) => {
                    this.updateSalaryBalance(model);
                    if (changes['InstalmentType'] || changes['SalaryBalanceTemplateID'] || changes['EmployeeID']) {
                        this.salarybalanceService.refreshLayout(
                            model, this.ignoreFields, 'salarybalance', 'SalarybalanceDetails', !!model.SalaryBalanceTemplateID)
                            .subscribe((result: UniFieldLayout[]) => {
                                this.fields$.next(result);
                            });
                    } else {
                        this.salarybalanceService.updateFields(
                            model, 'salarybalance', false, changes, this.lastChanges$,
                            this.form, this.fields$, this.ignoreFields, !!model.SalaryBalanceTemplateID)
                            .subscribe();
                    }
                });
        }

        private updateSalaryBalance(model: SalaryBalance) {
            this.salarybalanceChange.emit(model);
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
            const firstFile = files[0];
            const current = this.salarybalance$.getValue();
            if (!current.ID) {
                if (this.unlinkedFiles.findIndex(x => x === firstFile.ID) < 0) {
                    this.unlinkedFiles.push(firstFile.ID);
                }
            }
            current['_newFiles'] = this.unlinkedFiles;
            this.salarybalance$.next(current);
        }

        private setup(salaryBalance: SalaryBalance): Observable<SalaryBalance> {
            return this.salarybalanceService
            .refreshLayout(salaryBalance, this.ignoreFields,
                'salarybalance', 'SalarybalanceDetails', !!salaryBalance.SalaryBalanceTemplateID)
            .do((layout: UniFieldLayout[]) => {
                this.fields$.next(layout);
            })
            .do(() => {
                this.salarybalanceService.getTemplates()
                .subscribe((templates: SalaryBalanceTemplate[]) => {
                    const template = templates.find(tmp => tmp.ID === salaryBalance.SalaryBalanceTemplateID);
                    if (!!template) {
                        salaryBalance.Name = template.SalarytransactionDescription;
                    }
                });
            })
            .map(response => this.setWagetype(salaryBalance))
            .map(response => this.setText(salaryBalance));
        }

        private toggleReadOnly(salarybalance: SalaryBalance, changedField: string): SalaryBalance {
            let fields = this.fields$.getValue();
            if (fields.length > 0) {
                fields = fields.map((field: UniFieldLayout) => {
                    switch (changedField.toLowerCase()) {
                        case 'salarybalancetemplateid':
                            if (field.Property !== 'SalaryBalanceTemplateID'
                                && field.Property !== 'FromDate' && field.Property !== 'ToDate') {
                                field.ReadOnly = salarybalance.SalaryBalanceTemplateID > 0 ? true : false;
                            }
                            break;
                        case 'instalmenttype':
                            if (field.Property === 'SalaryBalanceTemplateID') {
                                field.ReadOnly = salarybalance.InstalmentType !== null ? true : false;
                            }
                            break;
                        default:
                            break;
                    }
                    return field;
                });
                this.fields$.next(fields);
            }
            return salarybalance;
        }

        private setWagetype(salarybalance: SalaryBalance) {
            this.salarybalanceService.getWagetypes()
            .subscribe((wagetypes: WageType[]) => {
                let wagetype: WageType;
                if (!salarybalance.ID && wagetypes) {
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
            });
        }

        private setText(salaryBalance: SalaryBalance): SalaryBalance {
            if (salaryBalance.ID > 0) {
                return salaryBalance;
            }
            if (!salaryBalance.InstalmentType) { return salaryBalance; }
            salaryBalance.Name = this.salarybalanceService.getInstalmentTypes().find(type => type.ID === salaryBalance.InstalmentType).Name;
            return salaryBalance;
        }

        public onSummaryChanges(salaryBalanceLines: SalaryBalanceLine[]) {
            const obs = this.salarybalance$;
            obs
                .take(1)
                .map(salaryBalance => {
                    salaryBalance.Transactions = salaryBalance.Transactions || [];
                    salaryBalance.Transactions = [
                        ...salaryBalance.Transactions.filter(line => !!line.ID),
                        ...salaryBalanceLines, ];

                    return salaryBalance;
                })
                .subscribe(salaryBalance => this.updateSalaryBalance(salaryBalance));
        }
    }
