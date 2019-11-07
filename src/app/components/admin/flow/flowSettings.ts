import {Component} from '@angular/core';
import {IUniTab} from '@uni-framework/uni-tabs';
import {EventplanService} from '@app/services/common/eventplan.service';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';

import { FlowTemplates } from './templates/templates';
import { FlowList } from './flow-list/flow-list';

export const FLOW_ROUTES = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'templates',
    },
    {
        path: 'templates',
        component: FlowTemplates
    },
    {
        path: 'flows',
        component: FlowList
    }
];

@Component({
    selector: 'flow-settings',
    template: `
        <uni-toolbar
            [config]="toolbarConfig"
            [saveactions]="eventPlanService.saveActions$ | async">
        </uni-toolbar>

        <section class="application">
            <uni-tabs [useRouterLinkTabs]="true" [tabs]="tabs"></uni-tabs>
            <router-outlet></router-outlet>
        </section>
    `,
})
export class FlowSettings {
    tabs: IUniTab[] = [
        {name: 'Maler', path: 'templates'},
        {name: 'Lagrede flyter', path: 'flows'}
    ];
    toolbarConfig = <IToolbarConfig>{
        title: 'Flyt',
        hideBreadcrumbs: true,
    };

    constructor(public eventPlanService: EventplanService) {}
}

