import {Component, ViewChild, ChangeDetectorRef} from '@angular/core';
import {UniSelect, ISelectConfig} from 'uniform-ng2/main';

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

        this.initActions();
        this.initObjectives();
        this.initSubscription();

        this.objectiveSelectConfig = {
            //displayProperty: 'id',
            // searchable: false,
            // template: (item) => {
            //     return (item.ID + ' - ' + item.PartName);
            // }
        };

        this.actionSelectConfig = {
            //displayProperty: 'id',
            // searchable: false,
            // template: (item) => {
            //     return (item.ID + ' - ' + item.PartName);
            // }
        };
    }

    public ngAfterViewInit() {
        this.isEnabled = this.company !== undefined && this.company.WebHookSubscriberId !== null;
        this.cdr.detectChanges();
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

    private initActions() {
        this.umhSerivce.getActions().subscribe(
            data => {
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
            },
            err => this.errorService.handle(err)
        );
    }

    private initObjectives() {
        this.umhSerivce.getObjectives().subscribe(
            data => {
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
            },
            err => this.errorService.handle(err)
        );
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
            },
            err => this.errorService.handle(err)
        );
    }

    private initList() {
        if (this.company.WebHookSubscriberId !== null) {
            this.umhSerivce.getSubscriber(this.subscription.SubscriberId).subscribe(
                res => {
                    this.umhSerivce.getSubscriptions(this.subscription.SubscriberId).subscribe(
                        subscriptions => this.subscriptions = subscriptions,
                        err => this.errorService.handle(err)
                    );
                },
                err => {} // nothing to do
            );
        }
    }

    private onSubmit() {
        this.umhSerivce.createSubscription(this.subscription.SubscriberId, this.subscription).subscribe(
            res => {
                this.isDirty = false;
                this.initSubscription();
            },
            err => this.errorService.handle(err)
        );
    }

    private enableWebHooks() {
        this.checkCluster();
        this.assignSubscriberToCompany();
    }

    // create new subscriber and attach to company
    private assignSubscriberToCompany() {
        let newSubscriber: IUmhSubscriber = {
            Name: this.company.Name,
            ClusterIds: [this.company.Key]
        }

        this.umhSerivce.createSubscriber(newSubscriber).subscribe(
            res => {
                this.company.WebHookSubscriberId = res.id;
                this.companyService.AssignToWebHookSubscriber(this.company.ID, this.company.WebHookSubscriberId).subscribe(
                    res2 => {
                        this.initSubscription();
                    },
                    err2 => this.errorService.handle(err2)
                );
            },
            err => this.errorService.handle(err)
        );
    }

    // for backward compatibility reason
    private checkCluster() {
        this.umhSerivce.getCluster(this.company.Key).subscribe(
            res => {
                // nothing to do
            },
            err => {
                this.umhSerivce.createCluster({
                    id: this.company.Key,
                    NativeObjectKey: this.company.Key,
                    Name: this.company.Name
                }).subscribe(
                    res2 => {},
                    err2 => this.errorService.handle(err2));
            } 
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
        this.umhSerivce.deleteSubscription(this.subscription.SubscriberId, subscriptionId).subscribe(
            res => {
                this.initList();
            },
            err => this.errorService.handle(err)
        );
    }

    private updateSubscription(subscription: IUmhSubscription) {
        this.umhSerivce.updateSubscription(this.subscription.SubscriberId, subscription).subscribe(
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