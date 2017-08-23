import {Component, Input} from '@angular/core';

export interface IUniInfoConfig {
    headline: string;
    content?: string;
}

@Component({
    selector: 'uni-information',
    template: `
    <article class="information_sheet">
        
        <h1>{{config.headline}}</h1>
        <p [innerHTML]="config.content || ''"></p>
        
    </article>
    `
})
export class UniInfo {
    @Input() public config: IUniInfoConfig;
}
