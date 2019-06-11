import {
    Component,
    Input,
    Output,
    ViewChild,
    EventEmitter,
} from '@angular/core';
import {
    UniTable,
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType
} from '../../../../../framework/ui/unitable/index';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import { Period, VatReport } from '../../../../../app/unientities';
import {PeriodDateFormatPipe} from '../../../../pipes/periodDateFormatPipe';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs';
import {
    VatReportService,
    ErrorService
} from '../../../../services/services';
import { StatisticsService } from '@app/services/common/statisticsService';
import * as _ from 'lodash';

@Component({
    selector: 'historic-vatreport-modal',
    styles: [`.uni-modal { width: 60vw;}`],
    template: `
        <section role="dialog" class="uni-modal">
            <header><h1>Oversikt over MVA meldinger</h1></header>
            <article class='modal-content'>
                <p>Trykk på en av linjene under for å vise detaljer om MVA meldingen</p>
                <ag-grid-wrapper
                    [resource]="lookupFunction"
                    [config]="uniTableConfig"
                    (rowSelect)="selectedItemChanged($event)">
                </ag-grid-wrapper>
            </article>
            <footer>
                <button (click)="close(null)" class="bad">Avbryt</button>
            </footer>
        </section>
    `
})
export class HistoricVatReportModal implements IUniModal {

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(UniTable)
    public unitable: UniTable;

    public uniTableConfig: UniTableConfig;
    public lookupFunction: (urlParams: URLSearchParams) => any;
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
        this.lookupFunction = (urlParams: URLSearchParams) =>
            this.getTableData(urlParams).catch((err, obs) => this.errorService.handleRxCatch(err, obs));

    }

    private getTableData(urlParams: URLSearchParams): Observable<any> {
        urlParams = urlParams || new URLSearchParams();
        urlParams.set('model', 'vatreport');
        urlParams.set('select', 'vatreport.*,terminperiod.*,vatreporttype.*,journalentry.*,vatreportarchivedsummary.*,'
            + 'auditlog.Action,auditlog.ID,auditlog.NewValue,auditlog.UpdatedAt,auditlog.EntityType');
        urlParams.set('join', 'vatreport.ID eq auditlog.EntityID');
        urlParams.set('expand', 'terminperiod,vatreporttype,journalentry,vatreportarchivedsummary');
        urlParams.set('filter', 'auditlog.newvalue eq 32004 and auditlog.EntityType eq \'VatReport\'');
        return this.statisticsService.GetWrappedDataByUrlSearchParams(urlParams);
    }

    private generateUniTableConfig(): UniTableConfig {
        return new UniTableConfig('accounting.vatReports.historicVatReports', false, false)
            .setPageable(true)
            .setPageSize(10)
            .setSearchable(false)
            .setColumns([
                new UniTableColumn('VatReportType.Name', 'Type', UniTableColumnType.Text)
                    .setWidth('25%')
                    .setAlias('VatReportType_Name'),

                new UniTableColumn('TerminPeriod.AccountYear', 'År', UniTableColumnType.Text)
                    .setAlias('TerminPeriod_AccountYear')
                    .setWidth('15%'),
                new UniTableColumn('TerminPeriod.No', 'Termin', UniTableColumnType.Text)
                    .setWidth('5%')
                    .setAlias('TerminPeriod_No'),
                new UniTableColumn('TerminPeriod.Name', 'Periode', UniTableColumnType.Text)
                    .setWidth('30%')
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
                    .setWidth('15%')
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
                _.set(vatReport, mappedProperty, object[prop]);
            }
        }
        return vatReport;
    }
}
