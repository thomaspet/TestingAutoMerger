import {Component, SimpleChanges, ViewChild, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UniView} from '../../../../../framework/core/uniView';
import {
    UniCacheService, ErrorService, SalarybalanceService
} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs';
import {ReplaySubject} from 'rxjs';
import {Observable} from 'rxjs';
import {UniForm} from '../../../../../framework/ui/uniform/index';
import {
    SalaryBalance, SalBalType, WageType, StdWageType, SalaryBalanceLine, Supplier, SalaryBalanceTemplate
} from '../../../../unientities';
import {
    ToastService, ToastType, ToastTime
} from '../../../../../framework/uniToast/toastService';
import {UniImage} from '../../../../../framework/uniImage/uniImage';
import {Subscription} from 'rxjs';

const SAVING_KEY = 'viewSaving';

@Component({
    selector: 'salarybalance-details',
    templateUrl: './salarybalanceDetails.html'
})
export class SalarybalanceDetail extends UniView implements OnChanges {
    private salarybalanceID: number;
    private cachedSalaryBalance$: ReplaySubject<SalaryBalance> = new ReplaySubject<SalaryBalance>(1);
    private lastChanges$: BehaviorSubject<SimpleChanges> = new BehaviorSubject({});
    public salarybalance$: BehaviorSubject<SalaryBalance> = new BehaviorSubject(new SalaryBalance());
    private subscriptions: Subscription[] = [];

    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public unlinkedFiles: Array<number> = [];
    public collapseSummary: boolean = false;
    public summaryBusy$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    @ViewChild(UniImage, { static: false }) public uniImage: UniImage;
    @ViewChild(UniForm, { static: true }) public form: UniForm;

    @Input() public salarybalance: SalaryBalance;
    @Input() public useExternalChangeDetection: boolean = false;
    @Input() public ignoreFields: string[] = ['SalarytransactionDescription'];
    @Output() private salarybalanceChange: EventEmitter<SalaryBalance> = new EventEmitter<SalaryBalance>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private salarybalanceService: SalarybalanceService,
        private toastService: ToastService,
        protected cacheService: UniCacheService,
        private errorService: ErrorService,
    ) {
        super(router.url, cacheService);

        this.route.parent.params
            .do(params => {
                this.subscriptions.forEach(sub => sub.unsubscribe());
                super.updateCacheKey(router.url);
                super.getStateSubject(SAVING_KEY)
                    .subscribe(isSaving => this.summaryBusy$.next(isSaving));
            })
            .switchMap(params => this.getStateSubject('salarybalance'))
            .subscribe(salaryBalance => this.cachedSalaryBalance$.next(salaryBalance));

        this.route.params
            .switchMap(params => {
                const employeeID: number = +params['employeeID'] || undefined;
                const type: SalBalType = +params['instalmentType'] || undefined;
                return this.cachedSalaryBalance$
                    .asObservable()
                    .map(salaryBalance => {
                        if (salaryBalance.ID) {
                            return salaryBalance;
                        }
                        if (employeeID) {
                            salaryBalance.EmployeeID = employeeID;
                        }
                        if (type) {
                            salaryBalance.InstalmentType = type;
                        }

                        return salaryBalance;
                    })
                    .switchMap((salarybalance: SalaryBalance) => (salarybalance.ID === this.salarybalanceID)
                        ? Observable.of(salarybalance)
                        : this.setup(salarybalance))
                    .map(salarybalance => {
                        if (!salarybalance.FromDate) {
                            salarybalance.FromDate = new Date();
                        }
                        return salarybalance;
                    })
                    .switchMap(salarybalance => {
                        return salarybalanceService.updateFields(
                            salarybalance,
                            'salarybalance',
                            this.salarybalanceID !== salarybalance.ID,
                            null,
                            this.lastChanges$,
                            this.form,
                            this.fields$,
                            this.ignoreFields,
                            !!salarybalance.SalaryBalanceTemplateID);
                        })
                    .do((salarybalance) => {
                        return this.lastChanges$.subscribe(change => {
                            if (change['InstalmentType']) {
                                this.toggleReadOnly(salarybalance, 'InstalmentType');
                            }
                        });
                    })
                    .do(salarybalance => this.salarybalanceID = salarybalance.ID)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
            })
            .subscribe(salaryBalance => this.salarybalance$.next(salaryBalance));
    }

    public ngOnChanges(changes: SimpleChanges) {
        Observable
            .of(changes)
            .filter(change => !!change['salarybalance'] && !!change['salarybalance'].currentValue)
            .map(change => change['salarybalance'])
            .switchMap(salBalChange => !salBalChange.previousValue || salBalChange.previousValue.ID !== salBalChange.currentValue.ID
                ? this.setup(salBalChange.currentValue)
                : Observable.of(salBalChange.currentValue))
            .subscribe(salbal => this.salarybalance$.next(salbal));
    }

    public change(changes: SimpleChanges) {
        this.salarybalance$
            .asObservable()
            .take(1)
            .filter(() => Object
                .keys(changes)
                .some(key => changes[key].currentValue !== changes[key].previousValue))
            .map(model => {
                if (changes['SalaryBalanceTemplateID']) {
                    this.mapTemplateToSalarybalance(changes['SalaryBalanceTemplateID'].currentValue, model);
                }

                if (changes['InstalmentType']) {
                    this.setWagetype(model);
                    this.setText(model);
                    this.salarybalanceService.resetFields(model);
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
            })
            .do(() => this.lastChanges$.next(changes))
            .subscribe((model: SalaryBalance) => {
                this.updateSalaryBalance(model);
                if (changes['InstalmentType'] || changes['SalaryBalanceTemplateID'] || changes['EmployeeID']) {
                    this.salarybalanceService.refreshLayout(
                        model, this.ignoreFields, 'salarybalance', 'SalarybalanceDetails', !!model.SalaryBalanceTemplateID)
                        .subscribe(result => {
                            this.fields$.next(result);
                        });
                } else {
                    this.salarybalanceService.updateFields(
                        model, 'salarybalance', false, changes, this.lastChanges$,
                        this.form, this.fields$, this.ignoreFields, !!model.SalaryBalanceTemplateID)
                        .subscribe(result => {
                            this.fields$.next(result);
                        });
                }
            });
    }

    private updateSalaryBalance(model: SalaryBalance) {
        this.salarybalanceChange.emit(model);
        if (this.useExternalChangeDetection === false) {
            super.updateState('salarybalance', model, true);
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
        .refreshLayout(salaryBalance, this.ignoreFields, 'salarybalance', 'SalarybalanceDetails', !!salaryBalance.SalaryBalanceTemplateID)
        .do((layout) => this.fields$.next(layout))
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

    private mapTemplateToSalarybalance(salarybalanceTemplateID: number, salarybalance: SalaryBalance) {
        this.salarybalanceService.getTemplates()
        .subscribe((templates: SalaryBalanceTemplate[]) => {
            const template = templates.find(tmp => tmp.ID === salarybalanceTemplateID);
            salarybalance.InstalmentType = !!template ? template.InstalmentType : null;
            salarybalance.Name = !!template ? template.SalarytransactionDescription : null;
            salarybalance.WageTypeNumber = !!template ? template.WageTypeNumber : null;
            salarybalance.Instalment = !!template ? template.Instalment : null;
            salarybalance.InstalmentPercent = !!template ? template.InstalmentPercent : null;
            salarybalance.SupplierID = !!template ? template.SupplierID : null;
            salarybalance.Supplier = !!template ? template.Supplier : null;
            salarybalance.KID = !!template ? template.KID : null;
            salarybalance.CreatePayment = !!template ? template.CreatePayment : null;
            salarybalance.MinAmount = !!template ? template.MinAmount : null;
            salarybalance.MaxAmount = !!template ? template.MaxAmount : null;
        });
    }

    private toggleReadOnly(salarybalance: SalaryBalance, changedField: string): SalaryBalance {
        const fields = this.fields$.getValue();
        if (fields.length > 0) {
            fields.map(field => {
                switch (changedField.toLowerCase()) {
                    case 'salarybalancetemplateid':
                        if (field.Property !== 'SalaryBalanceTemplateID' && field.Property !== 'FromDate' && field.Property !== 'ToDate') {
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
            })
            .map(field => {
                this.fields$.next(field);
            });
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
        const obs = this.useExternalChangeDetection ? this.salarybalance$ : this.cachedSalaryBalance$;
        obs
            .asObservable()
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
