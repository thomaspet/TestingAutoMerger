import {Component, ChangeDetectionStrategy} from '@angular/core';
import {IUniWidget} from '../uniWidget';

@Component({
    selector: 'uni-company-logo-widget',
    template: `
        <section class="widget-logo-wrapper">
            <uni-image
                [entity]="'companysettings'"
                [entityID]="1"
                class="header_logo"
                [singleImage]="true"
                [readonly]="true">
            </uni-image>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniCompanyLogoWidget {
    public widget: IUniWidget;
}
