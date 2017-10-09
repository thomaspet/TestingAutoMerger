import {Component, ViewChild} from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {
    WageType, SpecialAgaRule, SpecialTaxAndContributionsRule,
    TaxType, StdWageType, GetRateFrom
} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {WageTypeService, UniCacheService, ErrorService, YearService} from '../../../services/services';
import {ToastService} from '../../../../framework/uniToast/toastService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {IToolbarConfig} from '../../common/toolbar/toolbar';

import {UniView} from '../../../../framework/core/uniView';
import {UniModalService, ConfirmActions} from '../../../../framework/uniModal/barrel';
import {IContextMenuItem} from '../../../../framework/ui/unitable/index';

import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';


@Component({
    selector: 'uni-wagetype-view',
    templateUrl: './wageTypeView.html'
})
export class WageTypeView extends UniView {
    public busy: boolean;
    private url: string = '/salary/wagetypes/';

    private wagetypeID: number;
    private wageType: WageType;
    private saveActions: IUniSaveAction[];
    private toolbarConfig: IToolbarConfig;

    private childRoutes: any[];
    private contextMenuItems$: ReplaySubject<IContextMenuItem[]> = new ReplaySubject<IContextMenuItem[]>(1);

    constructor(
        private route: ActivatedRoute,
        private wageTypeService: WageTypeService,
        private toastService: ToastService,
        private router: Router,
        private tabService: TabService,
        public cacheService: UniCacheService,
        private errorService: ErrorService,
        private yearService: YearService,
        private modalService: UniModalService
    ) {

        super(router.url, cacheService);

        this.childRoutes = [
            {name: 'Lønnsart', path: 'details'},
            {name: 'Innstillinger', path: 'spesial-settings'}
        ];

        this.saveActions = [{
            label: 'Lagre',
            action: this.saveWageType.bind(this),
            main: true,
            disabled: true
        }];

        this.route.params.subscribe((params) => {
            this.wagetypeID = +params['id'];
            this.contextMenuItems$.next([{
                label: 'Slett lønnsart',
                action: () => this.handleDelete(this.wagetypeID),
                disabled: () => !this.wagetypeID
            }]);

            super.updateCacheKey(this.router.url);

            super.getStateSubject('wagetype').subscribe((wageType: WageType) => {
                this.wageType = wageType;
                this.toolbarConfig = {
                    title: this.wageType.ID ? this.wageType.WageTypeName : 'Ny lønnsart',
                    subheads: [{
                        title: this.wageType.ID
                            ? 'Lønnsartnr. '
                            + this.wageType.WageTypeNumber
                            + (this.wageType.ValidYear ? ` - ${this.wageType.ValidYear}` : '')
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

        });

        this.router.events.subscribe((event: any) => {
            if (event instanceof NavigationEnd) {
                if (!this.wageType) {
                    this.getWageType();
                }
            }
        });

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
                        .map((action: ConfirmActions) => {
                            if (action === ConfirmActions.ACCEPT) {
                                this.saveWageType((m) => {}, false);
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

    private updateTabStrip(wagetypeID, wageType: WageType) {
        if (wageType.WageTypeNumber) {
            this.tabService.addTab({
                name: 'Lønnsartnr. ' + wageType.WageTypeNumber,
                url: this.url + wageType.ID,
                moduleID: UniModules.Wagetypes,
                active: true
            });
        } else {
            this.tabService.addTab({
                name: 'Ny lønnsart',
                url: this.url + wagetypeID,
                moduleID: UniModules.Wagetypes,
                active: true
            });
        }
    }

    private saveWageType(done: (message: string) => void, updateView: boolean = true) {
        super.getStateSubject('wagetype')
            .take(1)
            .map(wt => this.wageTypeService.washWageType(wt))
            .switchMap(wt => this.checkValidYearAndCreateNew(wt))
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
            .switchMap(wageType => (wageType.ID > 0)
                ? this.wageTypeService.Put(wageType.ID, wageType)
                : this.wageTypeService.Post(wageType))
            .subscribe((wageType: WageType) => {
                if (updateView) {
                    super.updateState('wagetype', wageType, false);
                    let childRoute = this.router.url.split('/').pop();
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

    private checkValidYearAndCreateNew(wageType: WageType): Observable<WageType> {
        return this.yearService
            .selectedYear$
            .asObservable()
            .take(1)
            .map((year: number) => {
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
            });
    }

    private checkDirty() {
        if (super.isDirty()) {
            this.saveActions[0].disabled = false;
        } else {
            this.saveActions[0].disabled = true;
        }
    }

    private getWageType() {
        this.wageTypeService.getWageType(this.wagetypeID).subscribe((wageType: WageType) => {
            this.wageType = wageType;
            if (this.wageType.ID === 0) {
                this.setDefaultValues();
            }
            super.updateState('wagetype', wageType, false);
        }, err => this.errorService.handle(err));
    }

    private setDefaultValues() {
        this.wageType.WageTypeNumber = null;
        this.wageType.SpecialAgaRule = SpecialAgaRule.Regular;
        this.wageType.AccountNumber = 5000;
        this.wageType.Base_Payment = true;
        this.wageType.SpecialTaxAndContributionsRule = SpecialTaxAndContributionsRule.Standard;
        this.wageType.taxtype = TaxType.Tax_None;
        this.wageType.StandardWageTypeFor = StdWageType.None;
        this.wageType.GetRateFrom = GetRateFrom.WageType;
    }

    private handleDelete(id: number): void {
        this.wageTypeService
            .deleteWageType(id)
            .subscribe(res => this.router.navigateByUrl(this.url + 0));
    }

    public previousWagetype() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                // TODO: should use BizHttp.getPreviousID() instead
                this.wageTypeService.getPrevious(this.wageType.WageTypeNumber)
                    .subscribe((prev: WageType) => {
                        if (prev) {
                            this.wageType = prev;
                            let childRoute = this.router.url.split('/').pop();
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
                            let childRoute = this.router.url.split('/').pop();
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
                            this.setDefaultValues();
                        }
                        let childRoute = this.router.url.split('/').pop();
                        this.router.navigateByUrl(this.url + response.ID + '/' + childRoute);
                    }
                }, err => this.errorService.handle(err));
            }
        });
    }
}
