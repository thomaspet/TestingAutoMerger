import {Component, ChangeDetectorRef} from '@angular/core';
import {Observable} from 'rxjs';
import {SettingsService} from '../settings-service';
import {ISelectConfig} from '../../../../framework/ui/uniform/index';
import {AuthService} from '../../../authService';
import {UniModalService} from '../../../../framework/uni-modal';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {CompanyService, ErrorService} from '../../../services/services';
import {Company} from '../../../unientities';
import {IUniSaveAction} from '../../../../framework/save/save';
import {
    UmhService,
    IUmhAction,
    IUmhObjective,
    IUmhSubscription,
    SubscriptionState
} from '../../../services/common/UmhService';

@Component({
    selector: 'webhook-settings',
    templateUrl: './webHookSettings.html',
})
export class WebHookSettings {
    private noFilter: string = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

    public actionSelectConfig: ISelectConfig;
    public objectiveSelectConfig: ISelectConfig;

    public objectives: Array<IUmhObjective> = [];
    public actions: Array<IUmhAction> = [];

    public subscription: IUmhSubscription = {};
    public subscriptions: Array<IUmhSubscription> = [];

    private company: Company;
    public isEnabled: boolean = false;
    public isPermitted: boolean = false;
    public isBusy: boolean = true;

    private saveaction: IUniSaveAction = {
        label: 'Lagre',
        action: (done) => this.save(done),
        main: true,
        disabled: true
    };

    public constructor(
        private settingsService: SettingsService,
        private umhSerivce: UmhService,
        private companyService: CompanyService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private toastService: ToastService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) {}

    public ngOnInit() {
        this.settingsService.setSaveActions([this.saveaction]);

        this.objectiveSelectConfig = {
            displayProperty: 'Name',
            placeholder: 'Velg objektiv',
            searchable: true,
            hideDeleteButton: true
        };

        this.actionSelectConfig = {
            displayProperty: 'Name',
            placeholder: 'Velg handling',
            searchable: false,
            hideDeleteButton: true
        };

        this.umhSerivce.isPermitted(true).subscribe(
            isPermitted => {
                this.isPermitted = isPermitted;

                if (isPermitted) {
                    this.companyService.invalidateCache();
                    this.companyService.Get(this.authService.activeCompany.ID).subscribe(
                        company => {
                            this.company = company;
                            this.isEnabled = this.company !== undefined && this.company.WebHookSubscriberId !== null;

                            if (this.company.WebHookSubscriberId !== null) {
                                this.gatherData();
                            } else {
                                this.isBusy = false;
                            }
                        },
                        err => this.errorService.handle(err)
                    );
                } else {
                    this.isBusy = false;
                }
            },
            err => this.errorService.handle(err)
        );
    }

    public ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    private setSaveActionDisabled(disabled: boolean) {
        this.saveaction.disabled = disabled;
        this.settingsService.setSaveActions([this.saveaction]);
    }

    private gatherData() {
        Observable.forkJoin(
            this.umhSerivce.getActions(),
            this.umhSerivce.getObjectives()
        ).subscribe(
            res => {
                this.initActions(res[0]);
                this.initObjectives(res[1]);
                this.initSubscription();
                this.initList();
            },
            err => this.errorService.handle(err)
        );
    }

    public canDeactivate(): boolean | Observable<boolean> {
        if (this.saveaction.disabled) {
           return true;
        }

        return this.modalService.deprecated_openUnsavedChangesModal().onClose;
    }

    private initActions(data: any) {
        const actions = [];
        const action: IUmhAction = {
            id: this.noFilter,
            Name: 'All'
        };
        actions.push(action);

        for (let i = 0; i < data.length; ++i) {
            actions.push(data[i]);
        }
        this.actions = actions;
    }

    private initObjectives(data: any) {
        const objectives = [];
        const objective: IUmhObjective = {
            id: this.noFilter,
            Name: 'All'
        };
        objectives.push(objective);

        for (let i = 0; i < data.length; ++i) {
            objectives.push(data[i]);
        }
        this.objectives = objectives;
    }

    private initSubscription() {
        this.subscription = {
            AppModuleId: this.noFilter,
            Enabled: true,
            ObjectiveId: this.noFilter,
            ActionId: this.noFilter,
            Url: 'https://',
            Name: '',
            State: SubscriptionState.New,
            SubscriberId: this.company.WebHookSubscriberId,
            ClusterId: this.company.Key
        };
    }

    private initList() {
        if (this.company.WebHookSubscriberId !== null) {
            this.umhSerivce.getSubscriptions().subscribe(
                subscriptions => {
                    const length = subscriptions.length;

                    for (let i = 0; i < length; ++i) {
                        subscriptions[i].State = SubscriptionState.Unchanged;
                    }
                    this.subscriptions = subscriptions;
                    this.isBusy = false;
                    this.setSaveActionDisabled(true);
                },
                err => this.errorService.handle(err)
            );
        }
    }

    public onSubmit() {
        this.subscriptions.push(this.subscription);
        this.initSubscription();
        this.setSaveActionDisabled(false);
    }

    public enableWebHooks() {
        this.isBusy = true;

        this.umhSerivce.enableWebhooks().subscribe(
            res => {
                this.ngOnInit();
            },
            err2 => this.errorService.handle(err2)
        );
    }

    public urlChange(event) {

    }

    public descriptionChange(event) {

    }

    public onObjectiveSelectForNewSubscription(event: IUmhObjective) {
        if (event !== undefined) {
            this.subscription.ObjectiveId = event.id;
         } else {
            this.subscription.ObjectiveId = this.noFilter;
        }
    }

    public onActionSelectForNewSubscription(event: IUmhAction) {
        if (event !== undefined) {
            this.subscription.ActionId = event.id;
         } else {
            this.subscription.ActionId = this.noFilter;
        }
    }

    public onObjectiveSelectForExistingSubscription(subscription: IUmhSubscription, event: IUmhObjective) {
        if (event !== undefined) {
            subscription.ObjectiveId = event.id;
         } else {
            subscription.ObjectiveId = this.noFilter;
        }

        this.updateSubscription(subscription);
    }

    public onActionSelectForExistingSubscription(subscription: IUmhSubscription, event: IUmhAction) {
        if (event !== undefined) {
            subscription.ActionId = event.id;
         } else {
            subscription.ActionId = this.noFilter;
        }

        this.updateSubscription(subscription);
    }


    public onToggle(subscription: IUmhSubscription, event) {
        subscription.Enabled = event.checked;
        this.updateSubscription(subscription);
    }

    public onDeleteSubscription(subscription: IUmhSubscription) {
        if (subscription.State === SubscriptionState.New) {
            const idx = this.subscriptions.indexOf(subscription);

            if (idx > -1) {
                this.subscriptions.splice(idx, 1);
                this.isBusy = false;
            }
        } else {
            subscription.State = SubscriptionState.Deleted;
        }

        this.setSaveActionDisabled(false);
    }

    private updateSubscription(subscription: IUmhSubscription) {
        this.setSaveActionDisabled(false);

        if (subscription.State !== SubscriptionState.New) {
            subscription.State = SubscriptionState.Changed;
        }
    }

    public isSubmitDisabled(): boolean {
        return this.subscription.Url === ''
                || this.subscription.Name === '';
    }

    public getObjectiveName(id: string): string {
        if (this.objectives !== undefined) {
            const objective =  this.objectives.find(o => o.id === id);

            return objective !== undefined ? objective.Name : '';
        } else {
            return 'All';
        }
    }

    public getActionName(id: string): string {
        if (this.actions !== undefined) {
            const action = this.actions.find(o => o.id === id);

            return action !== undefined ? action.Name : null;
        } else {
            return 'All';
        }
    }

    private save(done: any) {
        const length = this.subscriptions.length;
        const subscriptions = [];

        for (let i = 0; i < length; ++i) {
            if (this.subscriptions[i].State !== SubscriptionState.Unchanged) {
                subscriptions.push(this.subscriptions[i]);
            }
        }

        if (subscriptions.length > 0) {
            this.isBusy = true;

            this.umhSerivce.save(subscriptions).subscribe(
                res => {
                    this.toastService.addToast('Innstillinger lagret', ToastType.good, 3);
                    done('Webhook instillinger lagret');

                    this.initSubscription();
                    this.initList();
                },
                err => {
                    this.errorService.handle(err);
                    this.isBusy = false;
                    done('Webhook innstillinger feilet i lagring');
                }
            );
        } else {
            done();
        }

        this.setSaveActionDisabled(true);
   }
}
