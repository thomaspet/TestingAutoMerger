import {Component} from '@angular/core';
import { UniView } from '@uni-framework/core/uniView';
import { BehaviorSubject, Observable } from '../../../../../../node_modules/rxjs';
import { IToolbarSearchConfig, IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { ActivatedRoute, Router, NavigationEnd } from '../../../../../../node_modules/@angular/router';
import { UniCacheService, SalarybalanceTemplateService, ErrorService } from '@app/services/services';
import { IUniSaveAction } from '@uni-framework/save/save';
import { SalaryBalanceTemplate } from '@uni-entities';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';

const URL = '/salary/salarybalancetemplates/';

@Component({
    selector: 'salarybalance-template-view',
    templateUrl: './salarybalanceTemplateView.html'
})
export class SalarybalanceTemplateView extends UniView {
    public busy: boolean;
    private currentTemplate: SalaryBalanceTemplate;
    public searchConfig$: BehaviorSubject<IToolbarSearchConfig> = new BehaviorSubject(null);
    public toolbarConfig: IToolbarConfig;
    public childRoutes: any[];
    public saveActions: IUniSaveAction[];
    private salarybalanceTemplateID: number;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public cacheService: UniCacheService,
        private salarybalanceTemplateService: SalarybalanceTemplateService,
        private errorService: ErrorService,
        private tabService: TabService,
        private modalService: UniModalService
    ) {
        super(router.url, cacheService);

        this.childRoutes = [
            {
                name: 'Detaljer',
                path: 'details'
            }
        ];

        this.saveActions = [
            {
                label: 'Lagre',
                action: this.saveTemplate.bind(this),
                main: true,
                disabled: true
            }
        ];

        this.route.params
            .subscribe((params) => {
                this.salarybalanceTemplateID = +params['id'];
                super.updateCacheKey(this.router.url);
                super.getStateSubject('salarybalancetemplate')
                    .do(salbalTemplate => this.searchConfig$.next(this.setupSearchConfig(salbalTemplate)))
                    .subscribe((salbalTemplate: SalaryBalanceTemplate) => {
                        this.currentTemplate = salbalTemplate;
                        this.toolbarConfig = {
                            navigation: {
                                prev: this.previousTemplate.bind(this),
                                next: this.nextTemplate.bind(this),
                                add: this.newTemplate.bind(this)
                            }
                        };
                        this.updateTab();
                        this.checkDirty();
                    },
                    err => this.errorService.handle(err));
                if (this.currentTemplate && this.currentTemplate.ID === +params['id']) {
                    super.updateState('salarybalancetemplate', this.currentTemplate, false);
                } else {
                    this.currentTemplate = undefined;
                }
            });

        this.router.events
            .subscribe((event: any) => {
                if (event instanceof NavigationEnd) {
                    if (!this.currentTemplate) {
                        this.getTemplate();
                    }
                }
            });
    }

    public canDeactivate(): Observable<boolean> {
        return Observable
            .of(super.isDirty())
            .switchMap(dirty => dirty
                ? this.modalService.openUnsavedChangesModal().onClose
                : Observable.of(ConfirmActions.REJECT))
            .map(result => {
                if (result === ConfirmActions.ACCEPT) {
                    this.saveTemplate(m => {}, false);
                }
                return result !== ConfirmActions.CANCEL;
            })
            .map(allowed => {
                if (allowed) {
                    this.cacheService.clearPageCache(this.cacheKey);
                }
                return allowed;
            });

    }

    public previousTemplate() {
        this.canDeactivate()
            .filter(canDeactivate => canDeactivate)
            .switchMap(() => {
                return this.salarybalanceTemplateService.getPrevious(this.currentTemplate.ID);
            })
            .subscribe((prev: SalaryBalanceTemplate) => {
                if (prev) {
                    this.currentTemplate = prev;
                    const childRoute = this.router.url.split('/').pop();
                    this.router.navigateByUrl(URL + prev.ID + '/' + childRoute);
                }
            }, err => this.errorService.handle(err));
    }

    public nextTemplate() {
        this.canDeactivate()
            .filter(canDeactivate => canDeactivate)
            .switchMap(() => {
                    return this.salarybalanceTemplateService.getNext(this.currentTemplate.ID);
            })
            .subscribe((next: SalaryBalanceTemplate) => {
                if (next) {
                    this.currentTemplate = next;
                    const childRoute = this.router.url.split('/').pop();
                    this.router.navigateByUrl(URL + next.ID + '/' + childRoute);
                }
            }, err => this.errorService.handle(err));
    }

    public newTemplate() {
        this.canDeactivate()
            .filter(canDeactivate => canDeactivate)
            .switchMap(() => {
                return this.salarybalanceTemplateService.GetNewEntity([''], 'salarybalancetemplate');
            })
            .subscribe(response => {
                if (response) {
                    this.currentTemplate = response;
                    const childRoute = this.router.url.split('/').pop();
                    this.router.navigateByUrl(URL + response.ID + '/' + childRoute);
                }
            }, err => this.errorService.handle(err));
    }

    private updateTab() {
        if (this.currentTemplate && this.currentTemplate.ID) {
            this.tabService.addTab({
                name: 'Trekkmal nr. ' + this.currentTemplate.ID,
                url: URL + this.currentTemplate.ID,
                moduleID: UniModules.SalarybalanceTemplates,
                active: true
            });
        } else {
            this.tabService.addTab({
                name: 'Ny trekkmal',
                url: URL + this.salarybalanceTemplateID,
                moduleID: UniModules.SalarybalanceTemplates,
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

    private getTemplate() {
        this.salarybalanceTemplateService
            .getTemplate(this.salarybalanceTemplateID)
            .subscribe((salbalTemplate: SalaryBalanceTemplate) => {
                this.currentTemplate = salbalTemplate;
                super.updateState('salarybalancetemplate', salbalTemplate, false);
            },
        err => this.errorService.handle(err));
    }

    private setupSearchConfig(salbalTemplate: SalaryBalanceTemplate): IToolbarSearchConfig {
        return {
            lookupFunction: (query) => this.salarybalanceTemplateService.GetAll(
                `filter=ID ne ${salbalTemplate.ID} and (startswith(ID, '${query}') `
                + `or contains(Name, '${query}'))`
                + `&top=50&hateoas=false`
            ).catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            itemTemplate: (item: SalaryBalanceTemplate) => `${item.ID} - `
                + `${item.Name}`,
            initValue: (!salbalTemplate || !salbalTemplate.Name)
                ? 'Ny trekkmal'
                : `${salbalTemplate.ID} - ${salbalTemplate.Name || 'Trekkmal'}`,
            onSelect: selected => this.router.navigate([URL + selected.ID])
        };
    }

    private saveTemplate(done: (message: string) => void, updateView = true) {
        const saver = this.currentTemplate.ID
            ? this.salarybalanceTemplateService.Put(this.currentTemplate.ID, this.currentTemplate)
            : this.salarybalanceTemplateService.Post(this.currentTemplate);

        saver.subscribe((salbalTemplate: SalaryBalanceTemplate) => {
            if (updateView) {
                super.updateState('salarybalancetemplate', this.currentTemplate, false);
                const childRoute = this.router.url.split('/').pop();
                this.router.navigateByUrl(URL + salbalTemplate.ID + '/' + childRoute);
                done('lagring fullført');
                this.saveActions[0].disabled = true;
            }
        },
            (error) => {
                done('Lagring feilet');
                this.errorService.handle(error);
            });
    }
}
