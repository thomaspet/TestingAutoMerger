import {Component, Input} from '@angular/core';
export interface IImageWidgetConfig {
    fileID?: number;
    entity?: {
        name: string,
        id: number
    };
    placeholderSrc: string;
    altText: string;
    hideToolbar?: boolean;
}
@Component({
    selector: 'uni-widget-image',
    template: `
        <uni-image *ngIf="config.fileID && !config.entity"
            [fileIDs]="[config.fileID]"
            [singleImage]="true"
            [readonly]="true"
            [hideToolbar]="config.hideToolbar"></uni-image>

        <uni-image *ngIf="config.entity"
            [entity]="config.entity.name"
            [entityID]="config.entity.id"
            [singleImage]="true"
            [readonly]="true"
            [hideToolbar]="config.hideToolbar"></uni-image>

        <img *ngIf="!config.entity && !config.fileID && config.placeholderSrc"
            [ngClass]="{'logo_placeholder' : true}"
            [src]="config.placeholderSrc"
            [alt]="config.altText ? config.altText : ''"/>
    `
})
export class ImageWidget {
    @Input() public config: IImageWidgetConfig;
}
