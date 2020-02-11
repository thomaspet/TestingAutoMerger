import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DistributionPlanService, CompanySettingsService} from '@app/services/services';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {DistributionPlan, DistributionPlanElementType, CompanySettings, Distributions} from '../../../unientities';
import {BehaviorSubject} from 'rxjs';
import { Observable } from 'rxjs';
import {DistributionPlanModal} from './distribution-plan-modal';
import {CustomerListModal} from './customer-list-modal';
import {UniModalService, UniConfirmModalV2, IModalOptions, ConfirmActions} from '@uni-framework/uni-modal';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';

declare const _; // lodash

@Component({
    selector: 'uni-distibution',
    templateUrl: './distribution.html'
})

export class UniDistributionSettings {
    plans: DistributionPlan[];
    elements: any = [];
    currentPriority: number = 0;
    deletedElements: any = [];
    plan: BehaviorSubject<any> = new BehaviorSubject({});
    elementTypes: DistributionPlanElementType[];
    hasUnsavedChanges: boolean = false;
    active: boolean = true;
    busy: boolean = true;
    companySettings: CompanySettings;
    toolbarConfig: IToolbarConfig = {
        title: 'Utsendelse',
        buttons: [
            {
                label: 'Lær mer om utsendelse',
                action: () => {
                    const options: IModalOptions = {
                        header: 'Utsendelse i systemet',
                        message: 'I dette bildet kan du definere oppsett for utsendelse. Her kan du sette prioriteringsrekkefølge '
                        + 'for sending av faktura, ordre, tilbud og purring. '
                        + 'Sett en plan som standard for at den skal automatisk brukes av alle kunder '
                        + '(med mindre du spesifiserer en annen plan på kundekortet). <br/> <br/> '
                        + '<strong>En plan fungerer slik:</strong><br/>'
                        + 'En plan kan ha flere utsendelsesmetoder. Systemet vil begynne på punkt 1 og prøve å sende på denne måten. '
                        + 'Hvis den ikke er mulig, f.eks ved sending av e-post og kundekort mangler e-postaddresse, vil systemet prøve '
                        + 'den neste prioriteringen. Osv. <br/> <br/>'
                        + 'Om det er satt en standardplan for firma, vil denne alltid bli satt automatisk på faktura, ordre og tilbud. '
                        + 'Om det er satt på kundekortet, vil denne bli prioritert over firmaplan, da denne er satt spesifikt på kunde. '
                        + '<br/><br/><strong>NB: Slå på Automatisk utsendelse for å sende ut faktura automatisk.</strong>',
                        class: 'small-text-modal',
                        buttonLabels: {
                            reject: 'OK'
                        }
                    };

                    this.modalService.open(UniConfirmModalV2, options);
                }
            }
        ]
    };

    entityTypes = [
        {
            value: 'Models.Sales.CustomerInvoice',
            label: 'Faktura',
            showPlansView: false,
            defaultPlan: null,
            keyValue: 'CustomerInvoiceDistributionPlanID',
            plans: []
        },
        {
            value: 'Models.Sales.CustomerOrder',
            label: 'Ordre',
            showPlansView: false,
            defaultPlan: null,
            keyValue: 'CustomerOrderDistributionPlanID',
            plans: []
        },
        {
            value: 'Models.Sales.CustomerQuote',
            label: 'Tilbud',
            showPlansView: false,
            defaultPlan: null,
            keyValue: 'CustomerQuoteDistributionPlanID',
            plans: []
        },
        {
            value: 'Models.Sales.CustomerInvoiceReminder',
            label: 'Purring',
            showPlansView: false,
            defaultPlan: null,
            keyValue: 'CustomerInvoiceReminderDistributionPlanID',
            plans: []
        }
    ];

    constructor(
        private distributionPlanService: DistributionPlanService,
        private companySettingsService: CompanySettingsService,
        private route: ActivatedRoute,
        private toastService: ToastService,
        private modalService: UniModalService
    ) { }

    public ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.getDistributionPlans();
        });
    }

    public getDistributionPlans() {
        this.distributionPlanService.invalidateCache();

        Observable.forkJoin([
            this.distributionPlanService.GetAll('', ['Elements', 'Elements.ElementType']),
            this.distributionPlanService.getElementTypes(),
            this.companySettingsService.Get(1, ['Distributions'])
        ]).subscribe(([plans, types, companySettings]) => {
            this.plans = plans;
            this.elementTypes = types;
            this.companySettings = companySettings;
            this.active = this.companySettings.AutoDistributeInvoice;

            this.distributionPlanService.getCustomerCount(this.plans).subscribe((response) => {
                this.busy = false;
                // Map count to correct plan
                this.plans = this.plans.map(plan => {
                    plan['_count'] = response.Data[0]['count' + plan.ID];
                    return plan;
                });

                this.entityTypes.map((ent) => {
                    ent.plans = plans.filter(plan => plan.EntityType === ent.value);
                    ent.defaultPlan = plans.find(plan => {
                        return plan.EntityType === ent.value && (this.companySettings && this.companySettings.Distributions
                            && plan.ID === this.companySettings.Distributions[ent.keyValue]);
                    });
                    if (ent.defaultPlan) {
                        ent.plans.map(plan => {
                            if (plan.ID === ent.defaultPlan.ID) {
                                plan['_count'] += response.Data[0][ent.label];
                            }
                        });
                    }
                    return ent;
                });
            }, err => {
                this.busy = false;
                this.toastService.addToast('Kunne ikke laste data', ToastType.bad, ToastTime.medium);
            });
        }, (err) => {
            this.busy = false;
            this.toastService.addToast('Kunne ikke laste data', ToastType.bad, ToastTime.medium);
        });
    }

    public onActionClick(actionName: string, plan: DistributionPlan, type: any) {
        switch (actionName) {
            case 'standard':
                this.setNewStandard(plan, type);
                break;
            case 'remove':
                const fakePlan = { ID: null};
                this.setNewStandard(fakePlan, type);
                break;
            case 'edit':
                this.openPlanModal(plan, type);
                break;
            case 'delete':
                this.deletePlan(plan, type);
                break;
            case 'customer':
                this.openCustomerModal(plan, type);
                break;
        }
    }

    public openPlanModal(plan: DistributionPlan, type) {
        if (!plan) {
            plan = new DistributionPlan();
            plan.Name = 'Min nye plan';
            plan.EntityType = type.value;
            plan.ID = 0;
            plan.Elements = [];
        }
        const header = `${plan.ID
            ? 'Rediger plan for utsendelse av ' + type.label.toLowerCase()
            : 'Ny utsendelsesplan for ' + type.label.toLowerCase()}`;
        const data = {
            plan: plan,
            types: this.filterElementTypes(type.value),
            currentType: type
        };

        this.modalService.open(DistributionPlanModal,
            { data: data, header: header, closeOnClickOutside: false })
        .onClose.subscribe((response) => {
            if (response) {
                if (!type.defaultPlan || (response.setAsDefault && response.plan.ID !== type.defaultPlan.ID)) {
                    this.setNewStandard(response.plan, type);
                } else if (type.defaultPlan && response.plan.ID === type.defaultPlan.ID && !response.setAsDefault) {
                    // Remove standard plan
                    response.plan.ID = null;
                    this.setNewStandard(response.plan, type);
                } else {
                    this.getDistributionPlans();
                }
            }
        });
    }

    public openCustomerModal(plan, type) {
        const data = {
            plan: plan,
            type: type
        };
        this.modalService.open(CustomerListModal, { data: data }).onClose.subscribe(() => {
            this.getDistributionPlans();
        });
    }

    public deletePlan(plan: DistributionPlan, type: any) {
        if (type.defaultPlan && type.defaultPlan.ID === plan.ID) {
            this.toastService.addToast('Sletting avbrutt', ToastType.warn, ToastTime.short, 'Kan ikke slette standardplan.');
            return;
        }

        const msg = !plan['_count'] ? '' : `<strong>${plan.Name}</strong> er koblet til ${plan['_count']} ` +
        `kunde${plan['_count'] > 1 ? 'r' : ''}. Hvis du sletter denne planen, ` +
        `vil disse kunden${plan['_count'] > 1 ? 'e' : ''} følge standardplan for firma. <br/> <br/>`;

        const options: IModalOptions = {
            header: 'Slette plan: ' + plan.Name,
            message: msg + 'Er du sikker på at du vil slette denne planen? Dette steget kan ikke angres.',
            footerCls: 'center',
            buttonLabels: {
                reject: 'Slett',
                cancel: 'Avbryt'
            }
        };

        this.modalService.open(UniConfirmModalV2, options).onClose.subscribe((action: ConfirmActions) => {
            if (action === ConfirmActions.REJECT) {
                this.distributionPlanService.Remove(plan.ID).subscribe(() => {
                    this.toastService.addToast('Plan slettet', ToastType.good, ToastTime.short);
                    this.getDistributionPlans();
                });
            }
        });
    }

    public setNewStandard(plan, type) {
        if (!this.companySettings.Distributions) {
            const newDist = new Distributions();
            newDist._createguid = this.distributionPlanService.getNewGuid();
            this.companySettings.Distributions = newDist;
        }

        this.companySettings.Distributions[type.keyValue] = plan.ID;
        this.companySettings.DefaultDistributionsID = null;

        this.companySettingsService.Put(1, this.companySettings).subscribe((settings) => {
            this.toastService.addToast(`${plan.ID ? 'Ny standardplan satt' : 'Standardplan fjernet'}`, ToastType.good, 5);
            this.getDistributionPlans();
        });
    }

    public turnOnOffAutomaticDistribution() {
        this.companySettings.AutoDistributeInvoice = this.active;

        this.companySettingsService.Put(1, this.companySettings).subscribe((settings) => {
           this.toastService.addToast(
               `Automatisk utsendelse av faktura slått ${ settings.AutoDistributeInvoice ? 'på' : 'av'}`,
               ToastType.good, ToastTime.short);
        });
    }

    // Filter elementtypes based on what type is set
    private filterElementTypes(type: string) {
        if (type === 'Models.Sales.CustomerInvoice') {
            return this.elementTypes;
        } else if (type === 'Models.Sales.CustomerInvoiceReminder') {
            return this.elementTypes.filter(res => res.ID === 2 || res.ID === 3);
        } else {
            return this.elementTypes.filter(res => res.ID === 2);
        }
    }
}
