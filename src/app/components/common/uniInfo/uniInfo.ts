import {Component, Input} from '@angular/core';

export interface IUniInfoConfig {
    headline: string;
}

@Component({
    selector: 'uni-information',
    template: `
    <article class="information_sheet">
        
        <h1>{{config.headline}}</h1>
        <ng-content class="information_content"></ng-content>
        
    </article>
    `
})
export class UniInfo {
    @Input() public config: IUniInfoConfig;
}
