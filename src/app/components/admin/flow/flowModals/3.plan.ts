import {Component, Output, EventEmitter, Input, ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {JobService} from '@app/services/admin/jobs/jobService';
import {ErrorService} from '@app/services/common/errorService';
import {Eventplan, EventplanType, EventSubscriber} from '@app/unientities';
import {GuidService} from '@app/services/common/guidService';
import {FlowModalPage} from '@app/components/admin/flow/flowModals/flowModal';

@Component({
    selector: 'flow-custom-modal-plan',
    templateUrl: './3.plan.html',
})
export class FlowModalPlan implements FlowModalPage {
    @Input() eventPlan: Eventplan;
    @Output() stepComplete: EventEmitter<boolean> = new EventEmitter();

    PlanType = EventplanType;

    myControl = new FormControl();
    options: string[];
    filteredOptions: string[];

    constructor(
        jobService: JobService,
        errorService: ErrorService,
        private elementRef: ElementRef,
        private guidService: GuidService,
    ){
        jobService
            .getJobs()
            .subscribe(
                jobs => this.options = this.filteredOptions = jobs,
                err => errorService.handle(err),
            );

        this.filteredOptions = this.options = [
            'loading...',
        ];

        this.myControl.valueChanges
            .filter(searchText => searchText !== undefined)
            .subscribe(searchText =>
                this.filteredOptions = this.options
                    .filter(option => option.toLowerCase().includes(searchText.toLowerCase()))
            );
    }

    toggle() {
        if (this.eventPlan.PlanType !== EventplanType.Webhook) {
            this.eventPlan.PlanType = EventplanType.Webhook;
        } else {
            this.eventPlan.PlanType = EventplanType.Custom;
        }
        this.eventPlan.Subscribers = <EventSubscriber[]>[{}];
        this.setFocusOnTextInput();
    }

    setFocusOnTextInput() {
        setTimeout(()=> {
            const textInput = (<any>this.elementRef).nativeElement.querySelector('input[type=text]');
            if (textInput) {
                textInput.focus();
            }
        });
    }

    ngOnInit() {
        if (this.eventPlan.PlanType === undefined) {
            this.eventPlan.PlanType = EventplanType.Webhook;
        }
        if (!this.eventPlan.Subscribers) {
            this.eventPlan.Subscribers = [];
        }
        if (this.eventPlan.Subscribers.length == 0 && this.eventPlan.PlanType === EventplanType.Webhook) {
            this.addSubscriber();
        }
    }

    removeSubscriber(subscriber: EventSubscriber) {
        const index = this.eventPlan.Subscribers.indexOf(subscriber);
        this.eventPlan.Subscribers.splice(index, 1);
    }

    addSubscriber() {
        this.eventPlan.Subscribers = this.eventPlan.Subscribers || [];
        this.eventPlan.Subscribers.push(<EventSubscriber>{
            _createguid: this.guidService.guid(),
            Active: true,
        });
    }

    getErrors(): string[] {
        const errors: string[] = [];
        if (this.eventPlan.PlanType === undefined) {
            errors.push('Venligst velg en plan før du går videre');
        }
        if (this.eventPlan.PlanType === EventplanType.Webhook
            && this.eventPlan.Subscribers.some(s => !s.Endpoint || !s.Name)) {
            errors.push('Fyll ut alle webhook endepunktene før du går videre');
        }
        if (this.eventPlan.PlanType === EventplanType.Custom && !this.eventPlan.JobNames) {
            errors.push('Velg en jobb før du går videre');
        }
        if (this.eventPlan.PlanType === EventplanType.Custom
            && this.eventPlan.Subscribers.some(s => !s.Name)) {
            errors.push('En av feltene mangler navn');
        }
        if (this.eventPlan.PlanType === EventplanType.Custom
            && this.eventPlan.Subscribers.some(s => !s.Endpoint)) {
            errors.push('En av feltene mangler verdi');
        }
        return errors;
    }
}
