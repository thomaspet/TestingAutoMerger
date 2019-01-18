import {Component} from '@angular/core';
import {UniModalService} from '@uni-framework/uni-modal';
import {IUniTab} from '@app/components/layout/uniTabs/uniTabs';
import {EventplanService} from '@app/services/common/eventplan.service';
import {FlowModal} from '@app/components/admin/flow/flowModals/flowModal';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';
import {FlowPrefabricatedTab} from '@app/components/admin/flow/prefabricatedFlowsTab';
import {FlowMyFlowTab} from '@app/components/admin/flow/tabMyFlows';
import {Observable} from 'rxjs';
import {ErrorService} from '@app/services/common/errorService';

export const FLOW_ROUTES = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'prefabricated',
    },
    {
        path: 'prefabricated',
        component: FlowPrefabricatedTab,
    },
    {
        path: 'my-flows',
        component: FlowMyFlowTab,
    },
];

export const FLOW_SETTINGS_TABS = [
    FlowPrefabricatedTab,
    FlowMyFlowTab,
];

@Component({
    selector: 'flow-settings',
    template: `
        <uni-toolbar [config]="toolbarConfig"></uni-toolbar>
        <uni-tabs [useRouterLinkTabs]="true" [tabs]="tabs"></uni-tabs>
        <router-outlet></router-outlet>
    `,
})
export class FlowSettings {
    tabs: IUniTab[] = [
        {name: 'Maler', path: 'prefabricated'},
        {name: 'Mine flyter', path: 'my-flows'},
    ];
    toolbarConfig = <IToolbarConfig>{
        title: 'Flyt',
        hideBreadcrumbs: true,
        saveactions: [{
            label: 'Lag ny flyt',
            action: (done) => this.createCustomEventplan(done),
        }],
    };

    constructor(
        private modalService: UniModalService,
        private eventPlanService: EventplanService,
        private errorService: ErrorService,
    ) {}

    createCustomEventplan(done: () => string) {
        return this.modalService.open(FlowModal).onClose
            .filter(eventPlan => eventPlan && eventPlan.OperationFilter)
            .map(eventPlan => Object.assign({Active:true}, eventPlan))
            .switchMap(eventPlan => Observable.fromPromise(this.eventPlanService.save(eventPlan)))
            .finally(() => done())
            .subscribe(
                eventPlan => this.eventPlanService.Post(eventPlan),
                err => this.errorService.handle(err),
            );
    }
}

