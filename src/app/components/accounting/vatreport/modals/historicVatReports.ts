import {Component, Type, Input, Output, ViewChild, EventEmitter, OnInit} from '@angular/core';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType} from 'unitable-ng2/main';
import {UniModal} from '../../../../../framework/modals/modal';
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
    selector: 'historic-vatreport-form',
    template: `
        <article class='modal-content' *ngIf="config">
            <h1>Oversikt over MVA meldinger</h1>
            <p>Trykk på en av linjene under for å vise detaljer om MVA meldingen</p>
            <uni-table [resource]="lookupFunction" [config]="uniTableConfig" (rowSelected)="selectedItemChanged($event)"></uni-table>
        </article>
    `
})
export class HistoricVatReportTable implements OnInit {
    @Input() public config: any = {};

    @ViewChild(UniTable) public unitable: UniTable;

    @Output() public vatReportSelected: EventEmitter<any> = new EventEmitter<any>();

    private uniTableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
    private periodDateFormat: PeriodDateFormatPipe;

    constructor(
        private vatReportService: VatReportService,
        private toastService: ToastService,
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
        return new UniTableConfig(false, false)
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

    private selectedItemChanged(data: any) {
        let vatReport: VatReport = data.rowModel;
        this.config.vatReportSelected(vatReport);
    }
}

@Component({
    selector: 'historic-vatreport-modal',
    template: `<uni-modal [type]='type' [config]='modalConfig'></uni-modal>`
})
export class HistoricVatReportModal {
    @ViewChild(UniModal)
    public modal: UniModal;

    @Output() public vatReportSelected: EventEmitter<any> = new EventEmitter<any>();

    private modalConfig: any = {};
    public type: Type<any> = HistoricVatReportTable;

    constructor(
        private periodService: PeriodService,
        private toastService: ToastService
    ) {
        const self = this;

        self.modalConfig = {
            hasCancelButton: false,
            class: 'good',
            vatReportSelected: (data) => {
                this.vatReportSelected.emit(data);
                this.modal.close();
            }
        };
    }

    public openModal() {
        this.modal.open();
        setTimeout(() => {
            this.modal.getContent().then((cmp: HistoricVatReportTable) => {
                cmp.unitable.refreshTableData();
            });
        });
    }
}
