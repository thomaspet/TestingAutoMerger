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
import {VatReport} from '../../../../../app/unientities';
import {PeriodDateFormatPipe} from '../../../../pipes/periodDateFormatPipe';
import {ToastService} from '../../../../../framework/uniToast/toastService';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {
    VatReportService,
    PeriodService,
    ErrorService
} from '../../../../services/services';

@Component({
    selector: 'historic-vatreport-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header><h1>Oversikt over MVA meldinger</h1></header>
            <article class='modal-content'>
                <p>Trykk på en av linjene under for å vise detaljer om MVA meldingen</p>
                <uni-table
                    [resource]="lookupFunction"
                    [config]="uniTableConfig"
                    (rowSelected)="selectedItemChanged($event)">
                </uni-table>
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
        private periodService: PeriodService,
        private toastService: ToastService,
        private vatReportService: VatReportService,
        private errorService: ErrorService
    ) {
        this.periodDateFormat = new PeriodDateFormatPipe(this.errorService);
    }

    public ngOnInit() {
        this.uniTableConfig = this.generateUniTableConfig();
        this.lookupFunction = (urlParams: URLSearchParams) =>
            this.getTableData(urlParams).catch((err, obs) => this.errorService.handleRxCatch(err, obs));

    }

    private getTableData(urlParams: URLSearchParams): Observable<VatReport[]> {
        urlParams = urlParams || new URLSearchParams();
        urlParams.set('expand', 'TerminPeriod,VatReportType,JournalEntry,VatReportArchivedSummary');

        if (!urlParams.get('orderby')) {
            urlParams.set('orderby', 'TerminPeriod.AccountYear DESC, TerminPeriod.No DESC, ID DESC');
        }

        return this.vatReportService.GetAllByUrlSearchParams(urlParams);
    }

    private generateUniTableConfig(): UniTableConfig {
        return new UniTableConfig('accounting.vatReports.historicVatReports', false, false)
            .setPageable(true)
            .setPageSize(10)
            .setSearchable(false)
            .setColumns([
                new UniTableColumn('VatReportType.Name', 'Type', UniTableColumnType.Text).setWidth('25%'),
                new UniTableColumn('TerminPeriod.AccountYear', 'År', UniTableColumnType.Text).setWidth('15%'),
                new UniTableColumn('TerminPeriod.No', 'Termin', UniTableColumnType.Text).setWidth('15%'),
                new UniTableColumn('TerminPeriod.Name', 'Periode', UniTableColumnType.Text).setWidth('30%')
                    .setTemplate((vatReport: VatReport) => {
                        return this.periodDateFormat.transform(vatReport.TerminPeriod);
                    }),
                new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text).setWidth('15%')
                    .setTemplate((vatReport: VatReport) => {
                        return this.vatReportService.getStatusText(vatReport.StatusCode);
                    })

            ]);
    }

    public selectedItemChanged(data: any) {
        let vatReport: VatReport = data.rowModel;
        this.close(vatReport);
    }

    public close(vatReport: VatReport) {
        this.onClose.emit(vatReport);
    }
}
