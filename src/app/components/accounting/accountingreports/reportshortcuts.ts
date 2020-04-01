import {Component} from '@angular/core';
import {UniModalService, ConfirmActions, UniPreviewModal} from '@uni-framework/uni-modal';
import {UniReportParamsModal} from '@app/components/reports/modals/parameter/reportParamModal';
import {ReportDefinitionService} from '@app/services/services';
import {ToastService} from '@uni-framework/uniToast/toastService';

interface IReportInfo {
    name: string;
    label: string;
    comment?: string;
    icon: string;
}

@Component({
    selector: 'accounting-reports',
    template: `
        <ul>
            <li (click)="onReportClick(report)" class="report" *ngFor="let report of reports">
                <h3><i class="material-icons vertical-middle">{{report.icon}}</i> {{report.label}}</h3>
                {{report.comment}}
            </li>
        </ul>
    `
})
export class AccountingReportShortcuts {
    private reportCache: Array<any> = [];

    public reports: Array<IReportInfo> = [
        { icon: 'bar_chart', name: 'Økonomioversikt', label: 'Økonomioversikt',
            comment: 'Resultat- og balanserapport med grafisk fremstilling og periodisert resultatoversikt' },
        { icon: 'done', name: 'Resultat (prosjekt/avdeling)', label: 'Resultatrapport',
            comment: 'Resultat med utvalg på prosjekt og avdeling m/fjorårstall' },
        { icon: 'attach_money', name: 'Balanse m/periodeutvalg', label: 'Balanserapport',
            comment: `Balanse m/fjorårstall og valgfri periode` }
    ];

    constructor(
        private uniModalService: UniModalService,
        private reportService: ReportDefinitionService,
        private toast: ToastService
    ) {
    }

    public onReportClick(report) {
        this.runReport(report.name);
    }

    public runReport(name: string, report?: any) {

        if (!report) {
            report = this.reportCache.find( x => x.Name === name);
            if (!report) {
                this.reportService.GetAll(`filter=name eq '${name}'`)
                    .subscribe( (x: Array<any>) => {
                        const rep = x.length > 0 ? x[0] : undefined;
                        if (rep) {
                            this.reportCache.push(rep);
                            this.runReport('', rep);
                        } else {
                            this.toast.addToast('Ukjent rapport: ' + name);
                        }
                    });
                return;
            }
        }

        this.uniModalService.open(UniReportParamsModal,
            {   data: report,
                header: report.Name,
                message: report.Description,
            }).onClose.subscribe(modalResult => {
                if (modalResult === ConfirmActions.ACCEPT) {
                    this.uniModalService.open(UniPreviewModal, {
                        data: report
                    });
                }
            });
    }

}
