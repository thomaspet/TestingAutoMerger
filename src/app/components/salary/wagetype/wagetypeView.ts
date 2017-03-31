import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import {
    WageType, SpecialAgaRule, SpecialTaxAndContributionsRule,
    TaxType, StdWageType, GetRateFrom 
} from '../../../unientities';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { WageTypeService, UniCacheService, ErrorService, YearService } from '../../../services/services';
import { ToastService } from '../../../../framework/uniToast/toastService';
import { IUniSaveAction } from '../../../../framework/save/save';
import { IToolbarConfig } from '../../common/toolbar/toolbar';

import { UniView } from '../../../../framework/core/uniView';
import { UniConfirmModal, ConfirmActions } from '../../../../framework/modals/confirm';

import { Observable } from 'rxjs/Observable';


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
    @ViewChild(UniConfirmModal) public confirmModal: UniConfirmModal;

    constructor(
        private route: ActivatedRoute,
        private wageTypeService: WageTypeService,
        private toastService: ToastService,
        private router: Router,
        private tabService: TabService,
        public cacheService: UniCacheService,
        private errorService: ErrorService,
        private yearService: YearService
    ) {

        super(router.url, cacheService);

        this.childRoutes = [
            { name: 'Detaljer', path: 'details' },
            { name: 'Spesialinnstillinger', path: 'spesial-settings' },
            { name: 'Grenseverdier', path: 'limit-values' }
        ];

        this.saveActions = [{
            label: 'Lagre',
            action: this.saveWageType.bind(this),
            main: true,
            disabled: true
        }];

        this.route.params.subscribe((params) => {
            this.wagetypeID = +params['id'];

            super.updateCacheKey(this.router.url);

            super.getStateSubject('wagetype').subscribe((wageType: WageType) => {
                this.wageType = wageType;
                this.toolbarConfig = {
                    title: this.wageType.ID ? this.wageType.WageTypeName : 'Ny lønnsart',
                    subheads: [{
                        title: this.wageType.ID ? 'Lønnsartnr. ' + this.wageType.WageTypeNumber : null
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
            .switchMap(result => {
                return result
                    ? Observable.of(result)
                    : Observable
                        .fromPromise(
                        this.confirmModal.confirm('Du har ulagrede endringer, ønsker du å forkaste disse?'))
                        .map((response: ConfirmActions) => response === ConfirmActions.ACCEPT);
            })
            .map(canDeactivate => {
                canDeactivate
                    ? this.cacheService.clearPageCache(this.cacheKey)
                    : this.updateTabStrip(this.wagetypeID, this.wageType);

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

    private saveWageType(done: (message: string) => void) {

        if (this.wageType.WageTypeNumber === null) {
            this.wageType.WageTypeNumber = 0;
        }

        this.checkValidYearAndCreateNew();

        this.wageType.SupplementaryInformations.forEach(supplement => {
            if (supplement['_setDelete']) {
                supplement['Deleted'] = true;
            }
        });

        let saver = (this.wageType.ID > 0)
            ? this.wageTypeService.Put(this.wageType.ID, this.wageType)
            : this.wageTypeService.Post(this.wageType);

        saver.subscribe((wageType: WageType) => {
            super.updateState('wagetype', this.wageType, false);
            let childRoute = this.router.url.split('/').pop();
            this.router.navigateByUrl(this.url + wageType.ID + '/' + childRoute);
            done('lagring fullført');
            this.saveActions[0].disabled = true;
        },
            (error) => {
                done('Lagring feilet');
                this.errorService.handle(error);
            });
    }

    private checkValidYearAndCreateNew() {
        this.yearService.selectedYear$.subscribe( (year: number) => {
            if ( this.wageType.ValidYear !== year) {
                console.log("newyear");
                this.wageType.ID = 0;
                this.wageType.ValidYear = year;

                this.wageType.SupplementaryInformations.forEach(supplement => {
                    supplement.ID = 0;
                    supplement.WageTypeID = 0;
                });
            }
        }        
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
