import {Component, Input} from '@angular/core';

export interface ITextWidgetConfig {
    topText?: {
        text: string;
        class?: string;
    }[];
    mainText?: {
        text: string;
        class?: string;
    };
    bottomText?: {
        text: string;
        class?: string;
    }[];
};

@Component({
    selector: 'uni-widget-text',
    template: `
        <p *ngFor="let txt of config.topText" [ngClass]="txt.class">{{txt.text}}</p>
        <h1 *ngIf="config.mainText" [ngClass]="config.mainText.class">{{config.mainText.text}}</h1>
        <p *ngFor="let txt of config.bottomText" [ngClass]="txt.class">{{txt.text}}</p>
    `
})
export class TextWidget {
    @Input() public config: ITextWidgetConfig;
}
