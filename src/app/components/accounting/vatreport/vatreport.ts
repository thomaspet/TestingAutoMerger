import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router} from '@angular/router';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';

@Component({
    selector: 'vatreport',
    templateUrl: 'app/components/accounting/vatreport/vatreport.html',
    directives: [ROUTER_DIRECTIVES, UniTabs, UniSave]
})
export class VatReport {
    private childRoutes: any[];
    private saveactions: IUniSaveAction[];

    constructor(public router: Router, private tabService: TabService) {
        this.childRoutes = [
            {name: 'Kontroll', path: 'checklist'},
            {name: 'Oppgave', path: 'report'}
        ];

        this.saveactions = [
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
    }

    public runVatReport(done) {
        done('Kjørt!');
    }

    public runVatReportAndSend(done) {
        done('Sendt inn!');
    }
}
