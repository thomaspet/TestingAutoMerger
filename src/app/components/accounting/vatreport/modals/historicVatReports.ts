import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniTableColumn, UniTableConfig, UniTableColumnType} from '@uni-framework/ui/unitable';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {Period, VatReport} from '@uni-entities';
import {PeriodDateFormatPipe} from '@app/pipes/periodDateFormatPipe';
import {HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {VatReportService, ErrorService} from '@app/services/services';
import {StatisticsService} from '@app/services/common/statisticsService';
import {set} from 'lodash';

@Component({
    selector: 'historic-vatreport-modal',
    styles: [`.uni-modal { width: 75vw;}`],
    template: `
        <section role="dialog" class="uni-modal uni-redesign">
            <header>Oversikt over MVA meldinger</header>
            <article class='modal-content'>
                <p>Trykk på en av linjene under for å vise detaljer om MVA meldingen</p>
                <ag-grid-wrapper
                    [resource]="lookupFunction"
                    [config]="uniTableConfig"
                    (rowSelect)="selectedItemChanged($event)">
                </ag-grid-wrapper>
            </article>
            <footer>
                <button (click)="close(null)" class="secondary">Avbryt</button>
            </footer>
        </section>
    `
})
export class HistoricVatReportModal implements IUniModal {
    @Input() options: IModalOptions;
    @Output() onClose = new EventEmitter<any>();

    uniTableConfig: UniTableConfig;
    lookupFunction: (urlParams: HttpParams) => any;
    private periodDateFormat: PeriodDateFormatPipe;

    constructor(
        private vatReportService: VatReportService,
        private statisticsService: StatisticsService,
        private errorService: ErrorService
    ) {
        this.periodDateFormat = new PeriodDateFormatPipe(this.errorService);
    }

    public ngOnInit() {
        this.uniTableConfig = this.generateUniTableConfig();
        this.lookupFunction = (urlParams: HttpParams) =>
            this.getTableData(urlParams).catch((err, obs) => this.errorService.handleRxCatch(err, obs));

    }

    private getTableData(urlParams: HttpParams): Observable<any> {
        urlParams = urlParams || new HttpParams();
        urlParams = urlParams.set('model', 'vatreport');
        urlParams = urlParams.set('select', 'TerminPeriodID,vatreport.*,terminperiod.*,vatreporttype.*,journalentry.*,vatreportarchivedsummary.*,'
            + 'auditlog.Action,auditlog.ID,auditlog.NewValue,auditlog.UpdatedAt,auditlog.EntityType');
        urlParams = urlParams.set('join', 'vatreport.ID eq auditlog.EntityID');
        urlParams = urlParams.set('orderby', urlParams.get('orderby') || 'TerminPeriodID desc,ID desc');
        urlParams = urlParams.set('expand', 'terminperiod,vatreporttype,journalentry,vatreportarchivedsummary');
        urlParams = urlParams.set('filter', 'auditlog.newvalue eq 32004 and (auditlog.oldvalue eq 32002 or auditlog.oldvalue eq 32001) and auditlog.EntityType eq \'VatReport\'');
        return this.statisticsService.GetWrappedDataByHttpParams(urlParams);
    }

    private generateUniTableConfig(): UniTableConfig {
        return new UniTableConfig('accounting.vatReports.historicVatReports', false, false)
            .setPageable(true)
            .setPageSize(10)
            .setSearchable(false)
            .setColumns([
                new UniTableColumn('TerminPeriodID', 'PeriodeID', UniTableColumnType.Text),
                new UniTableColumn('VatReportType.Name', 'Type', UniTableColumnType.Text)
                    .setAlias('VatReportType_Name'),
                new UniTableColumn('TerminPeriod.AccountYear', 'År', UniTableColumnType.Text)
                    .setAlias('TerminPeriod_AccountYear'),
                new UniTableColumn('TerminPeriod.No', 'Termin', UniTableColumnType.Text)
                    .setAlias('TerminPeriod_No'),
                new UniTableColumn('TerminPeriod.Name', 'Periode', UniTableColumnType.Text)
                    .setAlias('TerminPeriod_Name')
                    .setTemplate((vatReport: any) => {
                        return this.periodDateFormat.transform(<Period>{
                            FromDate: vatReport.TerminPeriod_FromDate,
                            ToDate: vatReport.TerminPeriod_ToDate,
                        });
                    }),
                new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text).setWidth('15%')
                    .setTemplate((vatReport: VatReport) => {
                        return this.vatReportService.getStatusText(vatReport.StatusCode);
                    }),
                new UniTableColumn('CreatedAt', 'Sist endret dato', UniTableColumnType.DateTime).setWidth('15%')
                    .setTemplate((vatReport: VatReport) => {
                        return (new Date(vatReport.CreatedAt) > new Date(vatReport.UpdatedAt))
                            ? vatReport.CreatedAt.toString()
                            : vatReport.UpdatedAt.toString();
                    }),
                new UniTableColumn('auditlog.Action', 'Status Altinn', UniTableColumnType.Text)
                    .setAlias('auditlogAction')
                    .setTemplate((vatReport: any) => {
                        return (vatReport.auditlogAction === 'approveManually')
                            ? 'Manuelt godkjent'
                            : 'Signert';
                    }),

            ]);
    }

    public selectedItemChanged(data: any) {
        this.close(this.mapVatReport(data));
    }

    public close(vatReport: VatReport) {
        if (vatReport) {
            this.onClose.emit(this.mapVatReport(vatReport));
        } else {
            this.onClose.emit();
        }
    }

    public mapVatReport(object: any): VatReport {
        const vatReport = new VatReport();

        for (const prop in object) {
            if (object.hasOwnProperty(prop)) {
                const mappedProperty = prop ? prop.split('_').join('.') : prop;
                set(vatReport, mappedProperty, object[prop]);
            }
        }
        return vatReport;
    }
}
