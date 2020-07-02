import { Component, OnDestroy, OnInit } from '@angular/core';
import { UniView } from '@uni-framework/core/uniView';
import { SalaryBalance } from '@uni-entities';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IToolbarConfig, IContextMenuItem, IToolbarSearchConfig } from '@app/components/common/toolbar/toolbar';
import { BehaviorSubject, Subscription, Observable, of } from 'rxjs';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { SalarybalanceService, ErrorService, UniCacheService, ReportDefinitionService } from '@app/services/services';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { UniModalService, ConfirmActions, UniPreviewModal } from '@uni-framework/uni-modal';
import { SalaryBalanceViewService } from '@app/components/salary/shared/services/salary-balance/salary-balance-view.service';
import { SalaryBalanceLineModalComponent } from '@app/components/salary/balance/salary-balance-line-modal/salary-balance-line-modal.component';
import { switchMap, map, filter, take, tap } from 'rxjs/operators';

const SALARY_BALANCE_KEY = 'salarybalance';
const SAVING_KEY = 'viewSaving';

@Component({
  selector: 'uni-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.sass']
})
export class BalanceComponent extends UniView implements OnDestroy, OnInit {
        private url: string = '/salary/salarybalances/';
        private salarybalanceID: number;
        private salarybalance: SalaryBalance;
        public saveActions: IUniSaveAction[];
        public toolbarConfig: IToolbarConfig;
        public childRoutes: any[];
        public contextMenuItems: IContextMenuItem[] = [];
        public searchConfig$: BehaviorSubject<IToolbarSearchConfig> = new BehaviorSubject(null);
        private subscriptions: Subscription[] = [];

        public busy: boolean;

        constructor(
            private route: ActivatedRoute,
            private router: Router,
            private salarybalanceService: SalarybalanceService,
            private tabService: TabService,
            private errorService: ErrorService,
            protected cacheService: UniCacheService,
            private reportDefinitionService: ReportDefinitionService,
            private modalService: UniModalService,
            private salaryBalanceViewService: SalaryBalanceViewService,
        ) {
            super(router.url, cacheService);

            this.childRoutes = [
                {name: 'Detaljer', path: 'details'}
            ];

            this.saveActions = [{
                label: 'Lagre',
                action: this.saveSalarybalance.bind(this),
                main: true,
                disabled: true
            }];
        }

        public ngOnInit() {
            this.route
                .params
                .pipe(
                    tap(params => {
                        this.subscriptions.forEach(sub => sub.unsubscribe());
                        this.salarybalanceID = +params['id'];
                        this.updateTabStrip(this.salarybalanceID);
                        this.contextMenuItems = [];
                        this.setupCache(this.salarybalanceID);
                    }),
                    switchMap(() => this.route.queryParams),
                    map(queryParams => {
                        if (this.salarybalance && this.salarybalance.ID === this.salarybalanceID) {
                            super.updateState(SALARY_BALANCE_KEY, this.salarybalance, false);
                            return {balance: this.salarybalance, queryParams};
                        }
                        return {balance: undefined, queryParams};
                    }),
                    filter(info => !info.balance),
                )
                .subscribe(info => this.getSalarybalance(info.queryParams));
        }

        public ngOnDestroy() {
            this.subscriptions.forEach(sub => sub.unsubscribe());
        }

        public canDeactivate(): Observable<boolean> {

            const obs = !super.isDirty(SALARY_BALANCE_KEY)
                ? Observable.of(ConfirmActions.REJECT)
                : this.modalService.openUnsavedChangesModal().onClose;
            return obs
                .map((result: ConfirmActions) => {
                    if (result === ConfirmActions.ACCEPT) {
                        this.saveSalarybalance(m => {}, false);
                    }

                    return result !== ConfirmActions.CANCEL;
                })
                .map(canDeactivate => {
                    if (canDeactivate) {
                        this.cacheService.clearPageCache(this.cacheKey);
                        if (!this.salarybalanceID) {
                            this.salarybalanceService.invalidateCache();
                        }
                    }

                    return canDeactivate;
                });
        }

        private setupCache(salarybalanceID: number) {
            super.updateCacheKey(this.router.url);

            const sub = super.getStateSubject(SALARY_BALANCE_KEY)
                .do(salaryBalance => {
                    if (this.contextMenuItems.length) {
                        return;
                    }

                    this.contextMenuItems = [
                        {
                            label: 'Legg til manuell post',
                            action: () => this.openSalarybalancelineModal(),
                            disabled: () => salarybalanceID < 1 || !salaryBalance
                        },
                        {
                            label: 'Vis forskuddskvittering',
                            action: () => this.showAdvanceReport(salarybalanceID),
                            disabled: () => !salarybalanceID
                                || !this.salarybalanceService.hasBalance(salaryBalance)
                        },
                        {
                            label: 'Slett forskudd/trekk',
                            action: () => this.salaryBalanceViewService.delete(salarybalanceID),
                            disabled: () => !salarybalanceID
                        }
                    ];

                    this.searchConfig$.next(this.salaryBalanceViewService.setupSearchConfig(salaryBalance));
                })
                .do((salbal) => this.salarybalance = salbal)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .do((salarybalance: SalaryBalance) => {
                    this.toolbarConfig = {
                        navigation: {
                            prev: this.previousSalarybalance.bind(this),
                            next: this.nextSalarybalance.bind(this),
                            add: this.newSalarybalance.bind(this)
                        }
                    };
                })
                .subscribe((salarybalance: SalaryBalance) => this.checkDirty());

            this.subscriptions.push(sub);
        }

        public previousSalarybalance() {
            this.handleSalaryBalanceRoute(
                this.salarybalanceService
                    .getPrevious(this.salarybalance.ID)
            );
        }

        public nextSalarybalance() {
            this.handleSalaryBalanceRoute(
                this.salarybalanceService
                    .getNext(this.salarybalance.ID)
            );
        }

        public newSalarybalance() {
            this.handleSalaryBalanceRoute(of(null));
        }

        private handleSalaryBalanceRoute(salBal$: Observable<SalaryBalance>) {
            this.canDeactivate()
                .pipe(
                    take(1),
                    filter(canDeactivate => !!canDeactivate),
                    switchMap(() => salBal$)
                )
                .subscribe(
                    salBal => {
                        this.salarybalance = salBal;
                        this.router.navigate([this.url, salBal?.ID || 0]);
                    },
                    err => this.errorService.handle(err)
                );
        }

        public openSalarybalancelineModal() {
            this.modalService
                .open(
                SalaryBalanceLineModalComponent,
                {
                    data: this.salarybalance
                })
                .onClose
                .subscribe(needsUpdate => {
                    if (needsUpdate) {
                        this.getSalarybalance();
                    }
                });
        }

        private getSalarybalance(queryParams?: Params) {
            this.salarybalanceService.getSalarybalance(this.salarybalanceID,
                ['Transactions', 'Employee', 'Employee.BusinessRelationInfo',
                    'Supplier', 'Supplier.Info', 'Supplier.Info.DefaultBankAccount'])
                .pipe(
                    map(salaryBalance => salaryBalance.ID
                        ? salaryBalance
                        : {
                            ...salaryBalance,
                            EmployeeID: +queryParams['employeeID'] || undefined,
                            InstalmentType: +queryParams['instalmentType'] || undefined,
                            FromDate: salaryBalance.FromDate || new Date(),
                        })
                )
                .subscribe(
                    (salbal: SalaryBalance) => super.updateState(SALARY_BALANCE_KEY, salbal, false),
                    err => this.errorService.handle(err),
                );
        }

        private saveSalarybalance(done: (message: string) => void, updateView = true) {
            super.updateState(SAVING_KEY, true, false);
            super.getStateSubject(SALARY_BALANCE_KEY)
                .take(1)
                .switchMap(salaryBalance => {
                    return this.salaryBalanceViewService.save(salaryBalance);
                })
                .finally(() => super.updateState(SAVING_KEY, false, false))
                .subscribe((salbal: SalaryBalance) => {
                    this.saveActions[0].disabled = true;
                    if (!salbal.ID || !salbal.EmployeeID || !salbal.WageTypeNumber || !salbal.InstalmentType) {
                        return done('Lagring avbrutt');
                    }

                    if (updateView) {
                        super.updateState(SALARY_BALANCE_KEY, salbal, false);
                        this.router.navigate([this.url, salbal.ID]);
                        done('Lagring fullført');
                    }
                }, err => {
                    this.errorService.handle(err);
                    done('Lagring feilet');
                });
        }

        private updateTabStrip(salarybalanceID: number) {
            if (salarybalanceID) {
                this.tabService.addTab({
                    name: 'Saldonr. ' + salarybalanceID,
                    url: this.url + salarybalanceID,
                    moduleID: UniModules.Salarybalances,
                    active: true
                });
            } else {
                this.tabService.addTab({
                    name: 'Ny saldo',
                    url: this.url + salarybalanceID,
                    moduleID: UniModules.Salarybalances,
                    active: true
                });
            }
        }

        private checkDirty() {
            if (super.isDirty()) {
                this.saveActions[0].disabled = false;
            } else {
                this.saveActions[0].disabled = true;
            }
        }

        private showAdvanceReport(id: number) {
            this.reportDefinitionService
                .getReportByName('Forskuddskvittering')
                .subscribe(report => {
                    report.parameters = [{Name: 'SalaryBalanceID', value: id}];
                    this.modalService.open(UniPreviewModal, {
                        data: report
                    });
                });
        }
    }

