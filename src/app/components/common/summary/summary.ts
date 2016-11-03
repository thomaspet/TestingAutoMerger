import { Component, Input } from '@angular/core';
export interface ISummaryConfig {
    title: string;
    value: string;
    description?: string;
}
@Component({
    selector: 'uni-summary',
    template: `
        <dl class="unisummary">
            <template ngFor let-summary [ngForOf]="configs">
                <dt>{{summary.title}}</dt>
                <dd>{{summary.value}}
                    <small *ngIf="summary.description">{{summary.description}}</small>
                </dd>
            </template>
        </dl>
    `
})
export class UniSummary {
    @Input() public configs: ISummaryConfig[];
}
