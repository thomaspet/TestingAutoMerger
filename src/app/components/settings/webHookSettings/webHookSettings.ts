import {Component, ViewChild, ChangeDetectorRef} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {UniSelect, ISelectConfig} from '../../../../framework/ui/uniform/index';

import {UmhService, IUmhAction, IUmhObjective, IUmhSubscription, IUmhSubscriber, SubscriptionState} from '../../../services/common/UmhService';
import {AuthService} from '../../../../framework/core/authService';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {CompanyService, ErrorService} from '../../../services/services';
import {Company} from '../../../unientities';
import {IUniSaveAction} from '../../../../framework/save/save';

@Component({
    selector: 'webhook-settings',
    templateUrl: './webHookSettings.html',
})
export class WebHookSettings {
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    @ViewChild(UniSelect) private select: UniSelect;

    private noFilter: string = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    
    private actionSelectConfig: ISelectConfig;
    private objectiveSelectConfig: ISelectConfig;
    
    private objectives: Array<IUmhObjective> = [];
    private actions: Array<IUmhAction> = [];

    private subscription: IUmhSubscription = {};
    private subscriptions: Array<IUmhSubscription> = [];

    private company: Company;
    private isEnabled: boolean = false;
    private isPermitted: boolean = false;
    private isBusy: boolean = true;

    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (done) => this.save(done),
            main: true,
            disabled: true
        }
    ];

    public constructor(
        private umhSerivce: UmhService,
        private companyService: CompanyService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private toastService: ToastService,
        private errorService: ErrorService
        ) {
    }

    public ngOnInit() {
        console.log('---> ngOnInit');
        this.objectiveSelectConfig = {
            displayProperty: 'Name',
            placeholder: 'Velg objektiv',
            searchable: true
        };
        this.actionSelectConfig = {
            displayProperty: 'Name',
            placeholder: 'Velg handling',
            searchable: true
        };

        this.umhSerivce.isPermitted(true).subscribe(
            isPermitted => { 
                this.isPermitted = isPermitted;

                if (isPermitted) {
                    this.companyService.invalidateCache();
                    this.companyService.Get(this.authService.activeCompany.ID).subscribe(
                        company => {
                            console.log('COMPANY' + JSON.stringify(company));
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
        )
    }

    public ngAfterViewInit() {
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
                this.initList();
            },
            err => this.errorService.handle(err)
        );
    }

    public canDeactivate(): boolean|Promise<boolean> {
        if (this.saveactions[0].disabled) {
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
        console.log(JSON.stringify(this.actions));
    }

    private initObjectives(data: any) {
        const objectives = [];
        let objective: IUmhObjective = {
            id: this.noFilter,
            Name: 'All'
        };
        objectives.push(objective);

        for (let i = 0; i < data.length; ++i) {
            objectives.push(data[i]);
        }
        this.objectives = objectives;
        console.log(JSON.stringify(this.objectives));
    }

    private initSubscription() {
        this.subscription = {
            AppModuleId: this.noFilter,
            Enabled: true,
            ObjectiveId: this.noFilter,
            ActionId: this.noFilter,
            Url: '',
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

                    for (var i = 0; i < length; ++i) {
                        subscriptions[i].State = SubscriptionState.Unchanged;    
                    }
                    this.subscriptions = subscriptions;
                    this.isBusy = false;
                    this.saveactions[0].disabled = true;
                },
                err => this.errorService.handle(err)
            );
        }
    }

    private onSubmit() {
        this.subscriptions.push(this.subscription);
        this.initSubscription();
        this.saveactions[0].disabled = false;
    }

    private enableWebHooks() {
        this.isBusy = true;

        this.umhSerivce.enableWebhooks().subscribe(
            res => {
                this.ngOnInit();
            },
            err2 => this.errorService.handle(err2)
        );
    }

    private urlChange(event) {
        
    }

    private descriptionChange(event) {
        
    }

    private onObjectiveSelectForNewSubscription(event: IUmhObjective) {
        if (event !== undefined) {
            this.subscription.ObjectiveId = event.id;
         } else {
            this.subscription.ObjectiveId = this.noFilter;
        }
    }

    private onActionSelectForNewSubscription(event: IUmhAction) {
        if (event !== undefined) {
            this.subscription.ActionId = event.id;
         } else {
            this.subscription.ActionId = this.noFilter;
        }
    }

    private onObjectiveSelectForExistingSubscription(subscription: IUmhSubscription, event: IUmhObjective) {
        if (event !== undefined) {
            subscription.ObjectiveId = event.id;
         } else {
            subscription.ObjectiveId = this.noFilter;
        }
        
        this.updateSubscription(subscription);
    }

    private onActionSelectForExistingSubscription(subscription: IUmhSubscription, event: IUmhAction) {
        if (event !== undefined) {
            subscription.ActionId = event.id;
         } else {
            subscription.ActionId = this.noFilter;
        }

        this.updateSubscription(subscription);
    }


    private onToggle(subscription: IUmhSubscription) {
        subscription.Enabled = !subscription.Enabled;
        this.updateSubscription(subscription);        
    }

    private onDeleteSubscription(subscription: IUmhSubscription) {
        if (subscription.State === SubscriptionState.New) {
            var idx = this.subscriptions.indexOf(subscription);

            if (idx > -1) {
                this.subscriptions.splice(idx, 1);
                this.isBusy = false;
            }
        } else {
            subscription.State = SubscriptionState.Deleted;
        }
        this.saveactions[0].disabled = false;
    }

    private updateSubscription(subscription: IUmhSubscription) {
        this.saveactions[0].disabled = false;

        if (subscription.State !== SubscriptionState.New) {
            subscription.State = SubscriptionState.Changed;
        }
    }

    private isSubmitDisabled(): boolean {
        return this.subscription.Url === ''
                || this.subscription.Name === '';
    }

    private getObjectiveName(id: string): string {
        if (this.objectives !== undefined) {
            var objective =  this.objectives.find(o => o.id === id);

            return objective !== undefined ? objective.Name : '';
        } else {
            return 'All';
        }
    }

    private getActionName(id: string): string {
        if (this.actions !== undefined) {
            var action = this.actions.find(o => o.id === id);

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
                    done('Webhook innstillinger feilet i lagring');
                }
            );
        } else {
            done();
            this.saveactions[0].disabled = true;
        }
   }
}