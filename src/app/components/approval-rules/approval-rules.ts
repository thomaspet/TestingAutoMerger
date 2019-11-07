import {Component} from '@angular/core';
import {IUniTab} from '@uni-framework/uni-tabs';

@Component({
    selector: 'approval-flow',
    template: `
        <uni-toolbar [config]="{title: 'Godkjenningsregler'}"></uni-toolbar>
        <section style="width: calc(100% - 4rem);" class="application uni-redesign">
            <uni-tabs [tabs]="tabs"></uni-tabs>
            <router-outlet></router-outlet>
        </section>
    `
})
export class ApprovalRules {
    tabs: IUniTab[] = [
        { name: 'Fakturagodkjenning', path: 'invoice-rules' },
        { name: 'Vikarer', path: 'substitutes' }
    ];

}
