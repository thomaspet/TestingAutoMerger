import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {DistributionPlanService} from '@app/services/services';
import * as _ from 'lodash';

@Component({
    selector: 'distribution-plan-modal',
    templateUrl: './distribution-plan-modal.html'
})

export class DistributionPlanModal implements OnInit, IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    currentPlan: any;
    types: any[];
    currentType: any;
    busy: boolean = false;
    setAsCompanyDefault: boolean = true;
    deletedElements: any[] = [];

    constructor (
        private toast: ToastService,
        private distributionPlanService: DistributionPlanService
    ) { }

    public ngOnInit() {
        this.currentPlan = _.cloneDeep(this.options.data.plan);
        this.types = _.cloneDeep(this.options.data.types);
        this.currentType = this.options.data.currentType;

        if (this.currentPlan.ID) {
            this.setAsCompanyDefault = this.currentType.defaultPlan && this.currentPlan
            && this.currentType.defaultPlan.ID === this.currentPlan.ID;
        }
    }

    public saveOrCreate() {
        // Check for duplicates
        if (new Set(this.currentPlan.Elements.map(el => parseInt
            (el.DistributionPlanElementTypeID, 10) )).size !==  this.currentPlan.Elements.length) {
            this.toast.addToast('Lagring avbrutt', ToastType.warn, ToastTime.medium,
            'Kan ikke lagre plan med duplikate prioriteringer. Sjekk verdier og prøv igjen.');
            return;
        } else if (!this.currentPlan.Name) {
            this.toast.addToast('Lagring avbrutt', ToastType.warn, ToastTime.medium, 'Kan ikke lagre plan uten navn.');
        } else {
            this.currentPlan.Elements.map((el: any, index: number) => {
                el.Priority = index + 1;
                el.ElementType = null;
                return el;
            });
        }

        // Reattach deleted elements to delete them
        this.currentPlan.Elements = this.currentPlan.Elements.concat(this.deletedElements);
        this.busy = true;
        this.distributionPlanService.saveDistributionPlan(this.currentPlan).subscribe((plan) => {
            this.busy = false;
            this.onClose.emit({
                setAsDefault: this.setAsCompanyDefault,
                plan: plan
            });
        }, err => {
            this.busy = false;
            this.toast.addToast('Lagring feilet', ToastType.warn, ToastTime.medium,
                'Kunne ikke lagre plan. Sjekk data eller prøv igjen senere');
        });
    }

    public addPriority() {
        if (this.currentPlan.Elements.length >= this.types.length || this.currentPlan.Elements.length === 5) {
            const errorMsg = this.currentPlan.Elements.length >= this.types.length
            ? 'Alle tilgjengelige utsendelsesmetoder for denne entitet er allerede lagt til i planen.'
            : 'En plan kan ikke ha mer enn 5 utsendelsesmetoder';
            this.toast.addToast('Kan ikke legge til', ToastType.warn, ToastTime.short, errorMsg);
            return;
        }
        const nextFree = this.types.find(type => !this.currentPlan.Elements.map(el => el.DistributionPlanElementTypeID).includes(type.ID));
        const element = {
            ElementType: nextFree,
            DistributionPlanElementTypeID: nextFree.ID,
            DistributionPlanID: this.currentPlan.ID,
            ID: 0,
            _createguid: this.distributionPlanService.getNewGuid()
        };
        this.currentPlan.Elements.push(element);
    }

    public deletePriority(index) {
        const deletedElement = this.currentPlan.Elements.splice(index, 1)[0];
        if (deletedElement.ID) {
            deletedElement.Deleted = true;
            this.deletedElements.push(deletedElement);
        }
    }

    public close() {
        this.onClose.emit(false);
    }
}
