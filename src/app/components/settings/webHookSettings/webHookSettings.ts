import {Component, ViewChild} from '@angular/core';

import {UniSelect, ISelectConfig} from 'uniform-ng2/main';

import {UmhService, IUmhAction, IUmhObjective, IUmhSubscription} from '../../../services/common/umhService';
import {CompanyService} from '../../../services/common/CompanyService';
import {AuthService} from '../../../../framework/core/authService';

@Component({
    selector: 'webhook-settings',
    templateUrl: 'app/components/settings/webHookSettings/webHookSettings.html',
})

export class WebHookSettings {
    //@ViewChild(UniForm) public form: UniForm;
    @ViewChild(UniSelect)
    
    private actionSelectConfig: ISelectConfig;
    private objectiveSelectConfig: ISelectConfig;
    private objectives: Array<IUmhObjective>;
    private actions: Array<IUmhAction>;
    private noFilter: string;

    private subscription: IUmhSubscription;
    private subscriptions: Array<IUmhSubscription>;

    public objectiveNames: string[];
    public actionNames: string[];

    public constructor(
        private umhSerivce: UmhService,
        private companyService: CompanyService,
        private authService: AuthService) {

        this.noFilter = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

        this.initSubscription();

        this.umhSerivce.getActions().subscribe(
            data => {
                    this.actionNames = [];
                    this.actions = [];

                    const action: IUmhAction = {
                         id: this.noFilter,
                         Name: 'All'
                    };
                    this.actionNames.push('All');
                    
                    action.id = this.noFilter;
                    action.Name = 'All';
                    this.actions.push(action);

                    for (var i = 0; i < data.length; ++i) {
                        this.actionNames.push(data[i].Name);
                        this.actions.push(data[i]);
                    }
               },
                err => console.log(err)
        );

        this.umhSerivce.getObjectives().subscribe(
            data => {
                    this.objectiveNames = [];
                    this.objectives = [];

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
            err => console.log(err)
        );

        this.objectiveSelectConfig = {
            displayProperty: 'id',
            // searchable: false,
            // template: (item) => {
            //     return (item.ID + ' - ' + item.PartName);
            // }
        };

        this.actionSelectConfig = {
            displayProperty: 'PartName',
            // searchable: false,
            // template: (item) => {
            //     return (item.ID + ' - ' + item.PartName);
            // }
        };
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

                // get list of subscriptions
                this.initList();
            },
            err => console.log(err)
        );
    }

    private initList() {
        this.umhSerivce.getSubscriptions(this.subscription.SubscriberId).subscribe(
            subscriptions => this.subscriptions = subscriptions,
            err => console.log(err)
        );
    }

    private onSubmit() {
        this.umhSerivce.createSubscription(this.subscription.SubscriberId, this.subscription).subscribe(
            res => {
                this.initSubscription();
                console.log(res);
            },
            err => {
                // @TODO: remove this line after ret value is fixed in UmhAction
                this.initSubscription();
                err => console.error("@TODO check umh return value");
            }
        );
    }
    
    private onObjectiveSelectForNewSubscription(event) {
        var objective = this.objectives.find(o => o.Name === event);

        if (objective !== undefined) {
            this.subscription.ObjectiveId = objective.id;
         } else {
            this.subscription.ObjectiveId = this.noFilter;
        }
    }

    private onActionSelectForNewSubscription(event) {
        var action = this.actions.find(o => o.Name === event);

        if (action !== undefined) {
            this.subscription.ActionId = action.id;
         } else {
            this.subscription.ActionId = this.noFilter;
        }
    }

    private onObjectiveSelectForExistingSubscription(subscription: IUmhSubscription, event: string) {
        var objective = this.objectives.find(o => o.Name === event);

        if (objective !== undefined) {
            subscription.ObjectiveId = objective.id;
         } else {
            subscription.ObjectiveId = this.noFilter;
        }

        this.updateSubscription(subscription);
    }

    private onActionSelectForExistingSubscription(subscription: IUmhSubscription, event: string) {
        var action = this.actions.find(o => o.Name === event);

        if (action !== undefined) {
            subscription.ActionId = action.id;
         } else {
            subscription.ActionId = this.noFilter;
        }

        this.updateSubscription(subscription);
    }


    private onToggle(item: IUmhSubscription) {
        item.Enabled = !item.Enabled;
        this.updateSubscription(item);
    }

    private onDeleteSubscription(subscriptionId: string) {
        this.umhSerivce.deleteSubscription(this.subscription.SubscriberId, subscriptionId).subscribe(
            res => {
                this.initList();
                console.log(res);
            },
            err => {
                // @TODO: remove this line after ret value is fixed in UmhAction
                this.initSubscription();
                err => console.error("@TODO check umh return value");
            }
        );
    }

    private updateSubscription(subscription: IUmhSubscription) {
        this.umhSerivce.updateSubscription(this.subscription.SubscriberId, subscription).subscribe(
            res => console.log(res),
            err => console.error("@TODO check umh return value") 
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