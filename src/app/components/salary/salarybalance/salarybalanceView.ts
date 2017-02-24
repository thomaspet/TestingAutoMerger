import { Component, ViewChild } from '@angular/core';
import { UniView } from '../../../../framework/core/uniView';
import { ActivatedRoute, Router } from '@angular/router';
import { IUniSaveAction } from '../../../../framework/save/save';
import { IToolbarConfig } from '../../common/toolbar/toolbar';
import { UniCacheService, ErrorService, SalarybalanceService } from '../../../services/services';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { Observable } from 'rxjs/Observable';
import { SalaryBalance } from '../../../unientities';
import { UniConfirmModal, ConfirmActions } from '../../../../framework/modals/confirm';

@Component({
    selector: 'uni-salarybalance-view',
    templateUrl: 'app/components/salary/salarybalance/salarybalanceView.html'
})
export class SalarybalanceView extends UniView {
    
    private url: string = '/salary/salarybalances/';
    private salarybalanceID: number;
    private salarybalance: SalaryBalance;
    private saveActions: IUniSaveAction[];
    private toolbarConfig: IToolbarConfig;
    private childRoutes: any[];

    public busy: boolean;

    @ViewChild(UniConfirmModal) public confirmModal: UniConfirmModal;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private salarybalanceService: SalarybalanceService,
        private tabService: TabService,
        private errorService: ErrorService,
        protected cacheService: UniCacheService
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

        this.route.params.subscribe((params) => {
            this.salarybalanceID = +params['id'];
            this.updateTabStrip(this.salarybalanceID);

            super.updateCacheKey(this.router.url);

            super.getStateSubject('salarybalance')
                .subscribe((salarybalance: SalaryBalance) => {
                    this.salarybalance = salarybalance;
                    this.toolbarConfig = {
                        title: this.salarybalance.ID ? this.salarybalance.Name : 'Ny saldo',
                        subheads: [{
                            title: this.salarybalance.ID ? 'Saldo nr. ' + this.salarybalance.ID : null
                        }],
                        navigation: {
                            prev: this.previousSalarybalance.bind(this),
                            next: this.nextSalarybalance.bind(this),
                            add: this.newSalarybalance.bind(this)
                        }
                    };

                    this.checkDirty();
                }, err => this.errorService.handle(err));
            
            if (this.salarybalance && this.salarybalance.ID === +params['id']) {
                super.updateState('salarybalance', this.salarybalance, false);
            } else {
                this.salarybalance = undefined;
            }
        });

        this.router.events.subscribe((event: any) => {
            if (event.constructor.name === 'NavigationEnd') {
                if (!this.salarybalance) {
                    this.getSalarybalance();
                }
            }
        });

    }

    public canDeactivate(): Observable<boolean> {
        return Observable
            .of(!super.isDirty())
            .flatMap(result => {
                return result
                    ? Observable.of(result)
                    : Observable
                        .fromPromise(
                        this.confirmModal.confirm(
                            'Du har ulagrede endringer, ønsker du å lagre disse før du fortsetter?',
                            'Lagre endringer?', true, { accept: 'Lagre', reject: 'Forkast' }))
                        .map((response: ConfirmActions) => {
                            if ( response === ConfirmActions.ACCEPT) {
                                this.saveSalarybalance((m) => { });
                                return true;
                            } else {
                                return response === ConfirmActions.REJECT;
                            }
                        });
            })
            .map(canDeactivate => {
                canDeactivate
                    ? this.cacheService.clearPageCache(this.cacheKey)
                    : this.updateTabStrip(this.salarybalanceID);

                return canDeactivate;
            });
    }

    public previousSalarybalance() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.salarybalanceService.getPrevious(this.salarybalance.ID)
                    .subscribe((prev: SalaryBalance) => {
                        if (prev) {
                            this.salarybalance = prev;
                            let childRoute = this.router.url.split('/').pop();
                            this.router.navigateByUrl(this.url + prev.ID + '/' + childRoute);
                        }
                    }, err => this.errorService.handle(err));
            }
        });
    }

    public nextSalarybalance() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.salarybalanceService.getNext(this.salarybalance.ID)
                    .subscribe((next: SalaryBalance) => {
                        if (next) {
                            this.salarybalance = next;
                            let childRoute = this.router.url.split('/').pop();
                            this.router.navigateByUrl(this.url + next.ID + '/' + childRoute);
                        }
                    }, err => this.errorService.handle(err));
            }
        });
    }

    public newSalarybalance() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.salarybalanceService.GetNewEntity().subscribe((response) => {
                    if (response) {
                        this.salarybalance = response;
                        let childRoute = this.router.url.split('/').pop();
                        this.router.navigateByUrl(this.url + response.ID + '/' + childRoute);
                    }
                }, err => this.errorService.handle(err));
            }
        });
    }

    private getSalarybalance() {
        this.salarybalanceService.getSalarybalance(this.salarybalanceID, 
            ['SalaryBalanceLines', 'Employee', 'Employee.BusinessRelationInfo',
            'Supplier', 'Supplier.Info', 'Supplier.Info.DefaultBankAccount'])
            .subscribe((salbal: SalaryBalance) => {
                this.salarybalance = salbal;
                super.updateState('salarybalance', salbal, false);
            }, err => this.errorService.handle(err));
    }

    private saveSalarybalance(done: (message: string) => void) {
        let saver = this.salarybalance.ID
            ? this.salarybalanceService.Put(this.salarybalance.ID, this.salarybalance)
            : this.salarybalanceService.Post(this.salarybalance);
        
        saver.subscribe((salbal: SalaryBalance) => {
            super.updateState('salarybalance', this.salarybalance, false);
            let childRoute = this.router.url.split('/').pop();
            this.router.navigateByUrl(this.url + salbal.ID + '/' + childRoute);
            done('lagring fullført');
            this.saveActions[0].disabled = true;
        },
            (error) => {
                done('Lagring feilet');
                this.errorService.handle(error);
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
}
