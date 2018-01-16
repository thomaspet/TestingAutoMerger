import {Component, SimpleChanges, ViewChild, Input, OnInit, Output, EventEmitter, OnChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UniView} from '../../../../../framework/core/uniView';
import {
    UniCacheService, ErrorService, SalarybalanceService,
    WageTypeService, EmployeeService, SupplierService, ModulusService
} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Observable} from 'rxjs/Observable';
import {UniFieldLayout, UniForm} from '../../../../../framework/ui/uniform/index';
import {
    SalaryBalance, SalBalType, WageType, Employee, Supplier, StdWageType, SalaryBalanceLine
} from '../../../../unientities';
import {
    ToastService, ToastType, ToastTime
} from '../../../../../framework/uniToast/toastService';
import {UniImage, UniImageSize} from '../../../../../framework/uniImage/uniImage';
import {UniModalService} from '../../../../../framework/uniModal/barrel';
import {ImageModal} from '../../../common/modals/ImageModal';
import {Subscription} from 'rxjs/Subscription';
import {SimpleChange} from '@angular/core/src/change_detection/change_detection_util';

const SAVING_KEY = 'viewSaving';

@Component({
    selector: 'salarybalance-details',
    templateUrl: './salarybalanceDetails.html'
})
export class SalarybalanceDetail extends UniView implements OnChanges {
    private salarybalanceID: number;
    private wagetypes: WageType[];
    private employees: Employee[];
    private suppliers: Supplier[];

    private invalidKID: boolean;
    private cachedSalaryBalance$: ReplaySubject<SalaryBalance> = new ReplaySubject<SalaryBalance>(1);
    private lastChanges$: BehaviorSubject<SimpleChanges> = new BehaviorSubject({});
    private salarybalance$: BehaviorSubject<SalaryBalance> = new BehaviorSubject(new SalaryBalance());
    private subscriptions: Subscription[] = [];

    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public unlinkedFiles: Array<number> = [];
    public collapseSummary: boolean = false;
    public summaryBusy$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    @ViewChild(UniImage) public uniImage: UniImage;
    @ViewChild(UniForm) public form: UniForm;

    @Input() public salarybalance: SalaryBalance;
    @Input() public useExternalChangeDetection: boolean = false;
    @Input() public ignoreFields: string[] = [];
    @Output() private salarybalanceChange: EventEmitter<SalaryBalance> = new EventEmitter<SalaryBalance>();

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
        private modulusService: ModulusService,
        private modalService: UniModalService
    ) {
        super(router.url, cacheService);

        this.route.parent.params
            .do(params => {
                this.subscriptions.forEach(sub => sub.unsubscribe());
                super.updateCacheKey(router.url);
                this.invalidKID = false;
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
                    .switchMap(salarybalance => this.updateFields(salarybalance, this.salarybalanceID !== salarybalance.ID))
                    .do(salarybalance => this.salarybalanceID = salarybalance.ID)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
            })
            .subscribe(salaryBalance => this.salarybalance$.next(salaryBalance));
    }

    public ngOnChanges(changes: SimpleChanges) {
        setTimeout(() => Observable
            .of(changes)
            .filter(change => !!change['salarybalance'] && !!change['salarybalance'].currentValue)
            .map(change => change['salarybalance'])
            .switchMap(salBalChange => !salBalChange.previousValue || salBalChange.previousValue.ID !== salBalChange.currentValue.ID
                ? this.setup(salBalChange.currentValue)
                : Observable.of(salBalChange.currentValue))
            .subscribe(salbal => this.salarybalance$.next(salbal)));
    }

    public change(changes: SimpleChanges) {
        this.salarybalance$
            .asObservable()
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

                return model;
            })
            .do(() => this.lastChanges$.next(changes))
            .subscribe((model: SalaryBalance) => {
                this.updateSalaryBalance(model);
                if (this.useExternalChangeDetection) {
                    if (changes['InstalmentType']) {
                        this.refreshLayout(model)
                            .subscribe();
                    } else {
                        this.updateFormFields(model, changes);
                    }
                }
            });
    }

    private updateSalaryBalance(model: SalaryBalance) {
        this.salarybalanceChange.emit(model);
        if (this.useExternalChangeDetection === false) {
            super.updateState('salarybalance', model, true);
        }
    }

    public onImageClicked(file) {
        if (this.salarybalanceID > 0) {
            const data = {
                entity: 'SalaryBalance',
                entityID: this.salarybalanceID,
                fileIDs: null,
                showFileID: file.ID,
                readonly: true,
                size: UniImageSize.large
            };

            this.modalService.open(ImageModal, {data: data});
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
        return this.refreshLayout(salaryBalance)
            .map(response => this.setWagetype(salaryBalance));
    }

    private refreshLayout(salaryBalance: SalaryBalance): Observable<UniFieldLayout[]> {
        return Observable
            .forkJoin(
            this.wageTypesObs(),
            this.employeesObs(),
            this.suppliersObs())
            .switchMap((result: [WageType[], Employee[], Supplier[]]) => {
                const [wagetypes, employees, suppliers] = result;
                return this.salarybalanceService
                    .layout('SalarybalanceDetails', salaryBalance, wagetypes, employees, suppliers)
                    .map(layout => {
                        layout.Fields = layout.Fields.filter(field => !this.ignoreFields.some(name => name === field.Property));
                        return layout;
                    });
            })
            .do(layout => {
                if (layout.Fields) {
                    this.fields$.next(layout.Fields);
                }
            })
            .map(layout => <UniFieldLayout[]>layout.Fields)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private wageTypesObs(): Observable<WageType[]> {
        return this.wagetypes
            ? Observable.of(this.wagetypes)
            : this.wagetypeService.GetAll('').do(wt => this.wagetypes = wt);
    }

    private employeesObs(): Observable<Employee[]> {
        return this.employees
            ? Observable.of(this.employees)
            : this.employeeService.GetAll('').do(emps => this.employees = emps);
    }

    private suppliersObs(): Observable<Supplier[]> {
        return this.suppliers
            ? Observable.of(this.suppliers)
            : this.supplierService.GetAll('', ['Info', 'Info.DefaultBankAccount']).do(sup => this.suppliers = sup);
    }

    private updateFields(
        salaryBalance: SalaryBalance,
        updateLayout: boolean = false,
        changes: SimpleChanges = null): Observable<SalaryBalance> {
        const changesObs = changes ? Observable.of(changes) : null;
        const obs = changesObs || this.lastChanges$.asObservable();

        return obs
            .take(1)
            .map(change => {
                const keys = Object.keys(change);
                return keys;
            })
            .do((changesKey) => {
                if (!updateLayout && this.form && !changesKey.some(x => x === 'InstalmentType')) {
                    this.updateFormFields(salaryBalance);
                } else {
                    this.refreshLayout(salaryBalance)
                        .subscribe();
                }
            })
            .map(() => salaryBalance);
    }

    private updateFormFields(salaryBalance: SalaryBalance, changes: SimpleChanges = null) {
        if (!this.form) {
            return;
        }
        const fieldFuncs = this.salarybalanceService
        .GetFieldFuncs(salaryBalance);

        if (changes) {
            const changesKeys = Object.keys(changes);
            const update = changesKeys.some(change => fieldFuncs.some(func => func.prop === change));
            if (!update) {
                return;
            }
        }

        fieldFuncs
            .forEach(fieldfunc => this.editFormField(this.form, fieldfunc.prop, fieldfunc.func));
    }

    private editFormField(
        form: UniForm,
        prop: string,
        edit: (field: UniFieldLayout) => UniFieldLayout): UniFieldLayout {
        const field = form ? form.field(prop) : null;
        if (field && field.field) {
            return edit(field.field);
        }
        return null;
    }

    private validateKID(salaryBalance: SalaryBalance) {
        this.invalidKID = !this.salarybalanceService.isHiddenByInstalmentType(salaryBalance)
            && !this.modulusService.isValidKID(salaryBalance.KID);
    }

    private setWagetype(salarybalance: SalaryBalance, wagetypes = this.wagetypes): SalaryBalance {
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

        return salarybalance;
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
