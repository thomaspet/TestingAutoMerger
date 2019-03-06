import {Component, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {
    WageType, SpecialAgaRule, SpecialTaxAndContributionsRule,
    TaxType, StdWageType, GetRateFrom
} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {WageTypeService, UniCacheService, ErrorService, FinancialYearService} from '../../../services/services';
import {WageTypeViewService} from './services/wageTypeViewService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {IToolbarConfig, IToolbarSearchConfig} from '../../common/toolbar/toolbar';

import {UniView} from '../../../../framework/core/uniView';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';
import {IContextMenuItem} from '../../../../framework/ui/unitable/index';

import {Observable} from 'rxjs';
import {ReplaySubject} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {Subscription} from 'rxjs';

const WAGETYPE_KEY = 'wagetype';

@Component({
    selector: 'uni-wagetype-view',
    templateUrl: './wageTypeView.html'
})
export class WageTypeView extends UniView implements OnDestroy {
    public busy: boolean;
    private url: string = '/salary/wagetypes/';
    private subs: Subscription[] = [];

    private wagetypeID: number;
    private wageType: WageType;
    public saveActions: IUniSaveAction[];
    public toolbarConfig: IToolbarConfig;
    public searchConfig$: BehaviorSubject<IToolbarSearchConfig> = new BehaviorSubject(null);

    public childRoutes: any[];
    public contextMenuItems$: ReplaySubject<IContextMenuItem[]> = new ReplaySubject<IContextMenuItem[]>(1);

    constructor(
        private route: ActivatedRoute,
        private wageTypeService: WageTypeService,
        private router: Router,
        private tabService: TabService,
        public cacheService: UniCacheService,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService,
        private modalService: UniModalService,
        private wageTypeViewService: WageTypeViewService
    ) {

        super(router.url, cacheService);

        this.childRoutes = [
            {name: 'Lønnsart', path: 'details'},
            {name: 'Innstillinger', path: 'spesial-settings'}
        ];

        this.saveActions = [{
            label: 'Lagre',
            action: this.askAndSaveWageType.bind(this),
            main: true,
            disabled: true
        }];

        this.subs = [
            ...this.subs,
            this.route.params.subscribe((params) => {
            this.wagetypeID = +params['id'];
            this.contextMenuItems$.next([{
                label: 'Slett lønnsart',
                action: () => this.wageTypeViewService.deleteWageType(this.wageType),
                disabled: () => !this.wagetypeID
            }]);

            super.updateCacheKey(this.router.url);

            super.getStateSubject(WAGETYPE_KEY)
                .do(wt => this.searchConfig$.next(this.wageTypeViewService.setupSearchConfig(wt)))
                .subscribe((wageType: WageType) => {
                this.wageType = wageType;
                this.toolbarConfig = {
                    title: this.wageType.ID ? this.wageType.WageTypeNumber + ' - ' + this.wageType.WageTypeName : 'Ny lønnsart',
                    subheads: [{
                        title: this.wageType.ID
                            ? (this.wageType.ValidYear ? ` - ${this.wageType.ValidYear}` : '')
                            : ''
                    }],
                    navigation: {
                        prev: this.previousWagetype.bind(this),
                        next: this.nextWagetype.bind(this),
                        add: this.newWagetype.bind(this)
                    }
                };

                this.updateTabStrip(this.wagetypeID, this.wageType);

                this.checkDirty();
            }, err => this.errorService.handle(err));
            if (this.wageType && this.wageType.ID === +params['id']) {
                super.updateState('wagetype', this.wageType, false);
            } else {
                this.wageType = undefined;
            }

        }),

        this.router.events.subscribe((event: any) => {
            if (event instanceof NavigationEnd) {
                if (!this.wageType) {
                    this.getWageType();
                }
            }
        })
    ];

    }

    public ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    public canDeactivate(): Observable<boolean> {
        return Observable
            .of(!super.isDirty())
            .switchMap(isSaved =>
                isSaved
                    ? Observable.of(true)
                    : this.modalService
                        .openUnsavedChangesModal()
                        .onClose
                        .switchMap(result => {
                            if (result !== ConfirmActions.ACCEPT) {
                                return Observable.of(result);
                            }
                            return this.promptUserAboutSaving(() => {});
                        })
                        .map((action: ConfirmActions) => {
                            if (action === ConfirmActions.ACCEPT) {
                                this.saveWageTypeObs(false).subscribe();
                                return true;
                            } else {
                                return action === ConfirmActions.REJECT;
                            }
                        }))
            .map(canDeactivate => {
                if (canDeactivate) {
                    this.cacheService.clearPageCache(this.cacheKey);
                }

                return canDeactivate;
            });
    }

    private updateTabStrip(wagetypeID, wageType: WageType, active: boolean = true) {
        if (wageType.WageTypeNumber) {
            this.tabService.addTab({
                name: 'Lønnsartnr. ' + wageType.WageTypeNumber,
                url: this.url + wageType.ID,
                moduleID: UniModules.Wagetypes,
                active: active
            });
        } else {
            this.tabService.addTab({
                name: 'Ny lønnsart',
                url: this.url + wagetypeID,
                moduleID: UniModules.Wagetypes,
                active: active
            });
        }
    }

    private askAndSaveWageType(done: (message: string) => void, updateView: boolean = true) {
        this.promptUserAboutSaving(done)
            .filter(result => result === ConfirmActions.ACCEPT)
            .switchMap(() => this.saveWageTypeObs(updateView))
            .subscribe((wageType: WageType) => {
                if (updateView) {
                    super.updateState('wagetype', wageType, false);
                    const childRoute = this.router.url.split('/').pop();
                    this.router.navigateByUrl(this.url + wageType.ID + '/' + childRoute);
                    done('lagring fullført');
                    this.saveActions[0].disabled = true;
                }
            },
            (error) => {
                done('Lagring feilet');
                this.errorService.handle(error);
            });
    }

    private promptUserAboutSaving(done: (message: string) => void): Observable<ConfirmActions> {
        return super.getStateSubject(WAGETYPE_KEY)
            .take(1)
            .map((wt: WageType) => {
                return !wt.ID && !wt.WageTypeNumber;
            })
            .switchMap(dontAsk => {
                if (dontAsk) {
                    return Observable.of(ConfirmActions.ACCEPT);
                }

                return this.modalService.confirm({
                    header: 'Bekreft lagring',
                    message: 'Åpne lønnsposter tilknyttet denne lønnsarten vil oppdateres. Ønsker du å lagre?',
                    buttonLabels: {
                        accept: 'Lagre',
                        cancel: 'Avbryt'
                    }
                })
                .onClose;
            })
            .do(result => {
            if (result === ConfirmActions.ACCEPT) {
                return;
            }
            done('Lagring avbrutt');
        });
    }

    private saveWageTypeObs(updateView: boolean): Observable<WageType> {
        return super.getStateSubject(WAGETYPE_KEY)
        .take(1)
        .map(wt => this.wageTypeService.washWageType(wt))
        .map(wt => this.checkValidYearAndCreateNew(wt))
        .map(wageType => {
            if (wageType.WageTypeNumber === null) {
                wageType.WageTypeNumber = 0;
            }

            if (wageType.SupplementaryInformations) {
                wageType.SupplementaryInformations.forEach(supplement => {
                    if (supplement['_setDelete']) {
                        supplement['Deleted'] = true;
                    }
                });
            }

            return wageType;
        })
        .switchMap(wageType => this.wageTypeService.save(wageType))
        .do((wt: WageType) => {
            if (updateView) {
                return;
            }

            this.tabService
                .activeTab$
                .take(1)
                .subscribe(tab => {
                    this.updateTabStrip(wt.ID, wt, false);
                    this.tabService.addTab(tab);
                });
        });
    }

    private checkValidYearAndCreateNew(wageType: WageType): WageType {
        const year = this.financialYearService.getActiveYear();

        if (wageType.ValidYear !== year) {
            wageType.ID = 0;
            wageType.ValidYear = year;
            if (wageType.SupplementaryInformations) {
                wageType.SupplementaryInformations.forEach(supplement => {
                    supplement.ID = 0;
                    supplement.WageTypeID = 0;
                });
            }
        }

        return wageType;
    }

    private checkDirty() {
        if (super.isDirty()) {
            this.saveActions[0].disabled = false;
        } else {
            this.saveActions[0].disabled = true;
        }
    }

    private getWageType() {
        this.wageTypeService
            .getWageType(this.wagetypeID)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe((wageType: WageType) =>
                super.updateState(
                    WAGETYPE_KEY,
                    wageType.ID ? wageType : this.setDefaultValues(wageType), false));
    }

    private setDefaultValues(wageType: WageType): WageType {
        wageType.WageTypeNumber = null;
        wageType.SpecialAgaRule = SpecialAgaRule.Regular;
        wageType.AccountNumber = 5000;
        wageType.Base_Payment = true;
        wageType.SpecialTaxAndContributionsRule = SpecialTaxAndContributionsRule.Standard;
        wageType.taxtype = TaxType.Tax_Table;
        wageType.StandardWageTypeFor = StdWageType.None;
        wageType.GetRateFrom = GetRateFrom.WageType;
        wageType.Base_Vacation = true;
        wageType.Base_EmploymentTax = true;
        return wageType;
    }

    public previousWagetype() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                // TODO: should use BizHttp.getPreviousID() instead
                this.wageTypeService.getPrevious(this.wageType.WageTypeNumber)
                    .subscribe((prev: WageType) => {
                        if (prev) {
                            this.wageType = prev;
                            const childRoute = this.router.url.split('/').pop();
                            this.router.navigateByUrl(this.url + prev.ID + '/' + childRoute);
                        }
                    }, err => this.errorService.handle(err));
            }
        });
    }

    public nextWagetype() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                // TODO: should use BizHttp.getNextID() instead
                this.wageTypeService.getNext(this.wageType.WageTypeNumber)
                    .subscribe((next: WageType) => {
                        if (next) {
                            this.wageType = next;
                            const childRoute = this.router.url.split('/').pop();
                            this.router.navigateByUrl(this.url + next.ID + '/' + childRoute);
                        }
                    }, err => this.errorService.handle(err));
            }
        });
    }

    public newWagetype() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.wageTypeService.GetNewEntity().subscribe((response) => {
                    if (response) {
                        this.wageType = response;
                        if (this.wageType.ID === 0) {
                            this.setDefaultValues(this.wageType);
                        }
                        const childRoute = this.router.url.split('/').pop();
                        this.router.navigateByUrl(this.url + response.ID + '/' + childRoute);
                    }
                }, err => this.errorService.handle(err));
            }
        });
    }
}
