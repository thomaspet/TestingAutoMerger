import {Component} from '@angular/core';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from '@angular/router-deprecated';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {ComponentProxy} from '../../../../framework/core/componentProxy';

const TRANSQUERY_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/list',
        name: 'TransqueryList',
        loader: () => ComponentProxy.LoadComponentAsync('TransqueryList', 'src/app/components/accounting/transquery/list/transqueryList')
    }),
    new AsyncRoute({
        path: '/details',
        name: 'TransqueryDetails',
        loader: () => ComponentProxy.LoadComponentAsync('TransqueryDetails', 'src/app/components/accounting/transquery/details/transqueryDetails')
    }),
    new AsyncRoute({
        path: '/detailsByAccountId/:accountId/year/:year/period/:period/isIncomingBalance/:isIncomingBalance',
        name: 'TransqueryDetails',
        loader: () => ComponentProxy.LoadComponentAsync('TransqueryDetails', 'src/app/components/accounting/transquery/details/transqueryDetails')
    }),
    new AsyncRoute({
        path: '/detailsByJournalEntryNumber/:journalEntryNumber',
        name: 'TransqueryDetails',
        loader: () => ComponentProxy.LoadComponentAsync('TransqueryDetails', 'src/app/components/accounting/transquery/details/transqueryDetails')
    })
];

@Component({
    selector: 'transquery',
    templateUrl: 'app/components/accounting/transquery/transquery.html',
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(TRANSQUERY_ROUTES)
export class Transquery {
    private childRoutes: RouteDefinition[];

    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({name: 'Forespørsel', url: '/accounting/transquery'});
        this.childRoutes = TRANSQUERY_ROUTES.slice(0, TRANSQUERY_ROUTES.length - 1);
    }
}
