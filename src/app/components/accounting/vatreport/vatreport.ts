import {Component} from '@angular/core';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from '@angular/router-deprecated';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {ComponentProxy} from '../../../../framework/core/componentProxy';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';

const VATREPORT_ROUTES = [
    new AsyncRoute({
        path: '/checklist',
        name: 'Kontroll',
        loader: () => ComponentProxy.LoadComponentAsync('VatCheckListView','app/components/accounting/vatreport/checkListView/checkListView')
    }),
    new AsyncRoute({
        useAsDefault: true,
        path: '/report',
        name: 'Oppgave',
        loader: () => ComponentProxy.LoadComponentAsync('VatReportView','app/components/accounting/vatreport/reportView/reportView')
    })
];

@Component({
    selector: 'vatreport',
    templateUrl: 'app/components/accounting/vatreport/vatreport.html',
    directives: [ROUTER_DIRECTIVES, UniTabs, UniSave]
})
@RouteConfig(VATREPORT_ROUTES)
export class VatReport {
    private childRoutes: RouteDefinition[];

    private saveactions: IUniSaveAction[] = [
         {
             label: 'Kjør',
             action: (done) => this.runVatReport(done),
             main: true,
             disabled: false
         },
         {
             label: 'Kjør og send inn',
             action: (done) => this.runVatReportAndSend(done),
             disabled: false
         }
    ];

    constructor(public router: Router, private tabService: TabService) {
        //this.tabService.addTab({name: 'MVA oppgave', url: '/accounting/vatreport'});
        this.childRoutes = VATREPORT_ROUTES;
    }

    public runVatReport(done) {
        done("Kjørt!");
    }

    public runVatReportAndSend(done) {
        done("Sendt inn!");
    }
}
