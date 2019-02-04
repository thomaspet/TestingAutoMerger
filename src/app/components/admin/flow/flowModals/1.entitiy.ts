import {Component, Output, EventEmitter, Input} from '@angular/core';
import {FormControl} from '@angular/forms';
import {StatisticsService} from '@app/services/common/statisticsService';
import {ErrorService} from '@app/services/common/errorService';
import {Eventplan} from '@app/unientities';
import {FlowModalPage} from '@app/components/admin/flow/flowModals/flowModal';

@Component({
    selector: 'flow-custom-modal-entity',
    template: `
        <section>
            <h2><i class="material-icons">gps_fixed</i>Velg entitet</h2>
            <form *ngIf="eventPlan">
              <mat-form-field>
                <input type="text"
                       name="model-type"
                       autofocus
                       [(ngModel)]="eventPlan.ModelFilter"
                       placeholder="Entitets navn"
                       aria-label="Number"
                       matInput
                       [formControl]="myControl"
                       [matAutocomplete]="auto"
                       style="border:none;">
                <mat-autocomplete #auto="matAutocomplete">
                  <mat-option *ngFor="let option of filteredOptions" [value]="option">
                    {{option}}
                  </mat-option>
                </mat-autocomplete>
              </mat-form-field>
            </form>
        </section>
    `,
})
export class FlowModalEntity implements FlowModalPage {
    @Input() eventPlan: Eventplan;
    @Output() stepComplete: EventEmitter<boolean> = new EventEmitter();

    myControl = new FormControl();
    options: string[];
    filteredOptions: string[];

    constructor(
        statistics: StatisticsService,
        errorService: ErrorService,
    ) {
        statistics.GetAll("model=model&select=name")
            .subscribe(
                response => {
                    this.options = response.Data.map(d => d.ModelName);
                    this.filteredOptions = this.options.filter(
                        option => option.toLowerCase().includes((this.myControl.value || '').toLowerCase())
                    );
                },
                err => errorService.handle(err),
            );

        this.filteredOptions = this.options = [
            'loading...',
        ];

        this.myControl.valueChanges
            .subscribe(searchText =>
                this.filteredOptions = this.options
                    .filter(option => option.toLowerCase().includes((searchText||'').toLowerCase()))
            );
    }

    getErrors(): string[] {
        const errors = <string[]>[];
        if (this.options.some(option => this.eventPlan.ModelFilter === option)) {
            errors.push()
        }
        return errors;
    }
}
