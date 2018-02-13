import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';

@Component({
    selector: 'uni-report-progress',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p class="uni-progress" *ngIf="progress < 100">
            <span>Generer rapport...</span>
            <progress [value]="progress" max="100"></progress>
        </p>
    `
})
export class UniReportProgressComponent implements OnChanges {

    @Input() reportSteps: any;
    progress = 0;
    ngOnChanges() {
        this.progress = this.progress + 12.5;
    }

    constructor() {}
}
