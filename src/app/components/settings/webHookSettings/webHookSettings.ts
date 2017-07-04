import {Component, ViewChild, ChangeDetectorRef} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {UniSelect, ISelectConfig} from '../../../../framework/ui/uniform/index';

import {UmhService, IUmhAction, IUmhObjective, IUmhSubscription, IUmhSubscriber} from '../../../services/common/UmhService';
import {AuthService} from '../../../../framework/core/authService';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';
import {CompanyService, ErrorService} from '../../../services/services';
import {Company} from '../../../unientities';

@Component({
    selector: 'webhook-settings',
    templateUrl: './webHookSettings.html',
})

export class WebHookSettings {
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    @ViewChild(UniSelect)

    private actionSelectConfig: ISelectConfig;
    private objectiveSelectConfig: ISelectConfig;
    private objectives: Array<IUmhObjective> = [];
    private actions: Array<IUmhAction> = [];
    private noFilter: string;

    private subscription: IUmhSubscription;
    private subscriptions: Array<IUmhSubscription>;

    public objectiveNames: string[] = [];
    public actionNames: string[] = [];
    public isDirty: boolean = false;

    private company: Company;
    private isEnabled: boolean = false;
    private isPermitted: boolean = false;
    private isBusy: boolean = true;

    public constructor(
        private umhSerivce: UmhService,
        private companyService: CompanyService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private errorService: ErrorService
        ) {
    }

    public ngOnInit() {
        this.noFilter = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

        this.umhSerivce.isPermitted(true).subscribe(
            isPermitted => { 
                this.isPermitted = isPermitted;

                if (isPermitted) {
                    this.gatherData();
                } else {
                    this.isBusy = false;
                }
            },
            err => this.errorService.handle(err)
        )
    }

    public ngAfterViewInit() {
        this.isEnabled = this.company !== undefined && this.company.WebHookSubscriberId !== null;
        this.cdr.detectChanges();
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
            },
            err => this.errorService.handle(err)
        );

        this.objectiveSelectConfig = {};
        this.actionSelectConfig = {};
    }

    public canDeactivate(): boolean|Promise<boolean> {
        if (!this.isDirty) {
           return true;
        }

        return new Promise<boolean>((resolve, reject) => {
            this.confirmModal.confirm(
                'Du har endringer som ikke er lagret - disse vil forkastes hvis du fortsetter?',
                'Vennligst bekreft',
                false,
                {accept: 'Fortsett uten å lagre', reject: 'Avbryt'}
            ).then((confirmDialogResponse) => {
               if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                    resolve(true);
               } else {
                    resolve(false);
                }
            });
        });
    }

    private initActions(data: any) {
        this.actionNames.push('All');

        const action: IUmhAction = {
                id: this.noFilter,
                Name: 'All'
        };
        this.actions.push(action);

        for (var i = 0; i < data.length; ++i) {
            this.actionNames.push(data[i].Name);
            this.actions.push(data[i]);
        }
    }

    private initObjectives(data: any) {
        this.objectiveNames.push('All');

        const objective: IUmhObjective = {
            id: this.noFilter,
            Name : 'All'
        }
        this.objectives.push(objective);

        for (var i = 0; i < data.length; ++i) {
            this.objectiveNames.push(data[i].Name);
            this.objectives.push(data[i]);
        }
    }

    private initSubscription() {
        this.subscription = {
            AppModuleId: this.noFilter,
            Enabled: true,
            ObjectiveId: this.noFilter,
            ActionId: this.noFilter,
            Url: '',
            Name: ''
        };

        this.companyService.Get(this.authService.activeCompany.ID).subscribe(
            company => {
                this.subscription.SubscriberId = company.WebHookSubscriberId;
                this.subscription.ClusterId = company.Key;
                this.company = company;

                // get list of subscriptions
                this.initList();

                this.ngAfterViewInit();
                this.isBusy = false;
            },
            err => this.errorService.handle(err)
        );
    }

    private initList() {
        if (this.company.WebHookSubscriberId !== null) {
            this.umhSerivce.getSubscriptions().subscribe(
                subscriptions => this.subscriptions = subscriptions,
                err => this.errorService.handle(err)
            );
        }
    }

    private onSubmit() {
        this.umhSerivce.createSubscription(this.subscription).subscribe(
            res => {
                this.isDirty = false;
                this.initSubscription();
            },
            err => this.errorService.handle(err)
        );
    }

    private enableWebHooks() {
        let newSubscriber: IUmhSubscriber = {
            Name: this.company.Name,
            ClusterIds: [this.company.Key]
        };
        
        this.umhSerivce.enableWebhooks().subscribe(
            res => {
                this.company.WebHookSubscriberId = res.id;
                this.initSubscription();
            },
            err2 => this.errorService.handle(err2)
        );
    }

    private urlChange(event) {
        this.isDirty = true;
    }

    private descriptionChange(event) {
        this.isDirty = true;
    }

    private onObjectiveSelectForNewSubscription(event) {
        this.isDirty = true;
        var objective = this.objectives.find(o => o.Name === event);

        if (objective !== undefined) {
            this.subscription.ObjectiveId = objective.id;
         } else {
            this.subscription.ObjectiveId = this.noFilter;
        }
    }

    private onActionSelectForNewSubscription(event) {
        this.isDirty = true;
        var action = this.actions.find(o => o.Name === event);

        if (action !== undefined) {
            this.subscription.ActionId = action.id;
         } else {
            this.subscription.ActionId = this.noFilter;
        }
    }

    private onObjectiveSelectForExistingSubscription(subscription: IUmhSubscription, event: string) {
        this.isDirty = true;
        var objective = this.objectives.find(o => o.Name === event);

        if (objective !== undefined) {
            subscription.ObjectiveId = objective.id;
         } else {
            subscription.ObjectiveId = this.noFilter;
        }

        this.updateSubscription(subscription);
    }

    private onActionSelectForExistingSubscription(subscription: IUmhSubscription, event: string) {
        this.isDirty = true;
        var action = this.actions.find(o => o.Name === event);

        if (action !== undefined) {
            subscription.ActionId = action.id;
         } else {
            subscription.ActionId = this.noFilter;
        }

        this.updateSubscription(subscription);
    }


    private onToggle(item: IUmhSubscription) {
        this.isDirty = true;
        item.Enabled = !item.Enabled;
        this.updateSubscription(item);
    }

    private onDeleteSubscription(subscriptionId: string) {
        this.umhSerivce.deleteSubscription(subscriptionId).subscribe(
            res => {
                this.initList();
            },
            err => this.errorService.handle(err)
        );
    }

    private updateSubscription(subscription: IUmhSubscription) {
        this.umhSerivce.updateSubscription(subscription).subscribe(
            res => {},
            err => this.errorService.handle(err)
        );
    }

    private isSubmitDisabled() {
        return this.subscription.Url === ''
                || this.subscription.Name === '';
    }

    private getObjectiveName(id) {
        if (this.objectives !== undefined) {
            return this.objectives.find(o => o.id === id).Name;
        } else {
            return 'All';
        }
    }

    private getActionName(id) {
        if (this.actions !== undefined) {
            return this.actions.find(o => o.id === id).Name;
        } else {
            return 'All';
        }
    }
}