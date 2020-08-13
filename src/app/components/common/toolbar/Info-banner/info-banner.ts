import { Component, Input } from '@angular/core';
import { IInfoBannerConfig } from '../toolbar';

@Component({
    selector: 'toolbar-info-banner',
    styleUrls: ['./info-banner.sass'],
    template: `
    <section id="banner">
        <i class="material-icons" Id="banner-icon">info</i>
        <section Id="banner-message">
            {{ config.message }}
            <a (click)="config.action()">{{ config.link }}</a>
        </section>
    </section>
    `
})
export class ToolbarInfoBanner {
    @Input() config: IInfoBannerConfig;
}
