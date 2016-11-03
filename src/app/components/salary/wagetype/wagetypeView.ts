import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WageType, ValidationLevel } from '../../../unientities';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { WageTypeService, UniCacheService } from '../../../services/services';
import { ToastService, ToastType } from '../../../../framework/uniToast/toastService';
import { UniSave, IUniSaveAction } from '../../../../framework/save/save';
import { IToolbarConfig } from '../../common/toolbar/toolbar';

import { UniView } from '../../../../framework/core/uniView';
declare var _; // lodash

@Component({
    selector: 'uni-wagetype-view',
    templateUrl: 'app/components/salary/wagetype/wageTypeView.html'
})
export class WageTypeView extends UniView {
    @ViewChild(UniSave)
    private saveComponent: UniSave;

    public busy: boolean;
    private url: string = '/salary/wagetypes/';

    private wagetypeID: number;
    private wageType: WageType;
    private saveActions: IUniSaveAction[];
    private toolbarConfig: IToolbarConfig;
    
    private childRoutes: any[];

    constructor(
        private route: ActivatedRoute,
        private wageTypeService: WageTypeService,
        private toastService: ToastService,
        private router: Router,
        private tabService: TabService,
        public cacheService: UniCacheService) {

        super(router.url, cacheService);

        this.childRoutes = [
            {name: 'Detaljer', path: 'details'},
            {name: 'Spesialinnstillinger', path: 'spesial-settings'},
            {name: 'Grenseverdier', path: 'limit-values'}
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

                if (this.wageType.WageTypeNumber) {
                    this.tabService.addTab({
                        name: 'Lønnsartnr. ' + this.wageType.WageTypeNumber,
                        url: this.url + this.wageType.WageTypeNumber,
                        moduleID: UniModules.Wagetypes,
                        active: true
                    });
                } else {
                    this.tabService.addTab({
                        name: 'Ny lønnsart',
                        url: this.url + this.wagetypeID,
                        moduleID: UniModules.Wagetypes,
                        active: true
                    });
                }

                this.checkDirty();
            });
            if (this.wageType && this.wageType.ID === +params['id']) {
                super.updateState('wagetype', this.wageType, false);
            } else {
                this.wageType = undefined;
            }

            
        });

        this.router.events.subscribe((event: any) => {
            if (event.constructor.name === 'NavigationEnd') {
                if (!this.wageType) {
                    this.getWageType();
                }
            }
        });

    }

    private saveWageType(done?: (message: string) => void) {
        let saver = (this.wageType.ID > 0)
            ? this.wageTypeService.Put(this.wageType.ID, this.wageType)
            : this.wageTypeService.Post(this.wageType);

        saver.subscribe((wageType: WageType) => {
            super.updateState('wagetype', this.wageType, false);
            let childRoute = this.router.url.split('/').pop();
            this.router.navigateByUrl(this.url + wageType.ID + '/' + childRoute);
            if (done) {
                done('lagring fullført');
            } else {
                this.saveComponent.manualSaveComplete('Lagring fullført');
            }
            this.saveActions[0].disabled = true;
        },
            (error) => {
                if (done) {
                    done('Lagring feilet');
                } else {
                    this.saveComponent.manualSaveComplete('Lagring feilet');
                }
                let toastHeader = 'Noe gikk galt ved lagring av lønnsart';
                if (error.json().Messages) {
                    error.json().Messages.forEach(validationMessage => {
                        let toastType = !validationMessage || validationMessage.Level === ValidationLevel.Error
                            ? ToastType.bad
                            : validationMessage.Level === ValidationLevel.Error
                                ? ToastType.warn
                                : ToastType.good;
                        this.toastService.addToast(toastHeader, toastType, 20, validationMessage.Message);
                    });
                } else {
                    this.toastService.addToast(toastHeader, ToastType.bad, 0, error);
                }
            });
    }

    private checkDirty() {
        if (super.isDirty()) {
            this.saveActions[0].disabled = false;
        }
    }

    private getWageType() {
        this.wageTypeService.getWageType(this.wagetypeID).subscribe((wageType: WageType) => {
            this.wageType = wageType;
            super.updateState('wagetype', wageType, false);
        });
    }

    public previousWagetype() {
        if (!super.canDeactivate()) {
            return;
        }

        this.wageTypeService.getPrevious(this.wageType.ID)
            .subscribe((prev: WageType) => {
                if (prev) {
                    this.wageType = prev;
                    let childRoute = this.router.url.split('/').pop();
                    this.router.navigateByUrl(this.url + prev.ID + '/' + childRoute);
                }
            });
    }

    public nextWagetype() {
        if (!super.canDeactivate()) {
            return;
        }

        this.wageTypeService.getNext(this.wageType.ID)
            .subscribe((next: WageType) => {
                if (next) {
                    this.wageType = next;
                    let childRoute = this.router.url.split('/').pop();
                    this.router.navigateByUrl(this.url + next.ID + '/' + childRoute);
                }
            });
    }

    public newWagetype() {
        if (!super.canDeactivate()) {
            return;
        }

        this.wageTypeService.GetNewEntity().subscribe((response) => {
            if (response) {
                this.wageType = response;
                let childRoute = this.router.url.split('/').pop();
                this.router.navigateByUrl(this.url + response.ID + '/' + childRoute);
            }
        });
    }
}
