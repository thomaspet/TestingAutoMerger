import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from "@angular/core";
import { IUniModal, IModalOptions } from "@uni-framework/uni-modal";
import { UniModalService } from "@uni-framework/uni-modal/modalService";
import { IUniSaveAction } from "@uni-framework/save/save";
import { OppgaveBarnepass, ReportDefinition, FieldType, BarnepassLeveranse } from "@uni-entities";
import { AltinnIntegrationService, ReportDefinitionService, ReportNames } from "@app/services/services";
import { Observable, BehaviorSubject } from "rxjs";
import { UniFieldLayout } from "@uni-framework/ui/uniform";
import { IUniTab } from '@app/components/layout/uni-tabs/uni-tabs';
import { UniTableConfig } from '@uni-framework/ui/unitable/config/unitableConfig';
import { UniTableColumn } from '@uni-framework/ui/unitable/config/unitableColumn';
import { isNullOrUndefined } from "util";
import { UniPreviewModal } from "@app/components/reports/modals/preview/previewModal";
import { ToastService, ToastType } from "@uni-framework/uniToast/toastService";
import { AgGridWrapper } from "@uni-framework/ui/ag-grid/ag-grid-wrapper";

@Component({
    selector: 'barnepass-sender-modal',
    templateUrl: './barnepassSenderModal.html',
    styleUrls: ['./barnepassModals.sass']
})

export class BarnepassSenderModal implements OnInit, IUniModal {
    @ViewChild(AgGridWrapper)
    public table: AgGridWrapper;
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();
    public saveActions: IUniSaveAction[] = [];
    public checkedRows: OppgaveBarnepass[];
    public busy: boolean;
    public year: number;
    public report: any;//ReportDefinition; parameters does not exist on ReportDefinition
    public reportName: string;
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
//dropdown Blir aktuelt hvis det kommer flere rapporter   public reports: any[] = [];

    public tabs: IUniTab[];
    public rows: OppgaveBarnepass[];
    public tableConfig: UniTableConfig;
    barnepass: BarnepassLeveranse;
    emailCount: number = 0;
    printCount: number = 0;
    allRows: OppgaveBarnepass[];
    rowsWithoutEmail: OppgaveBarnepass[];
    rowsWithEmail: OppgaveBarnepass[];

    sendTypeEmail: string = 'E-post';
    sendTypePrint: string = 'Utskrift';

    constructor(
        private altinnService: AltinnIntegrationService,
        private reportDefinitionService: ReportDefinitionService,
        private toastService: ToastService,
        private modalService: UniModalService
    ) {}

    ngOnInit(): void {
        this.year = this.options.data.year;

        this.report = this.options.data.report;
        if (this.report)
        {
            this.reportName = this.report.Name;
        }
        Observable.forkJoin(
            this.altinnService.getBarnepass(this.year)
            //dropdown, this.reportDefinitionService.GetAll('filter=...')
            //håndtering av manglende report input - ikke ferdig, this.getReport()
        ).subscribe((res) => {
            this.barnepass = res[0];
            const rows = this.barnepass.oppgave;
            //dropdown this.reports = res[1];
            /*if (!res[1])
            {
                this.close();
            }*/

            this.rowsWithEmail = rows.filter(x => x['email']);
            this.rowsWithoutEmail = rows.filter(x => isNullOrUndefined(x['email']));
            this.rowsWithEmail.forEach((row) => {
                row['_type'] = this.sendTypeEmail;
            });
            this.rowsWithoutEmail.forEach((row) => {
                row['_type'] = this.sendTypePrint;
            });
            this.allRows = rows;
            this.tabs = [
                { name: 'Alle', onClick: () => this.setAllRows(), count: this.allRows.length },
                { name: 'Med e-post', onClick: () => this.filterRowsWithEmail(), count: this.rowsWithEmail.length },
                { name: 'Uten e-post', onClick: () => this.filterRowsWithoutEmail(), count: this.rowsWithoutEmail.length }
            ];
            })
        //dropdown this.setUpFields();
        this.setupTable();
        this.updateSaveActions();
    }

    getReport() : Observable<boolean> {
        if (this.options.data.report) {
            this.report = this.options.data.report;
            this.reportName = this.report.Name;
            return Observable.of(true);
        }
        else {
            this.reportDefinitionService.getReportByName(ReportNames.BARNEPASS).subscribe((res) => {
                if (res) {
                    this.report = res;
                    this.reportName = this.report.Name;
                    return Observable.of(true);
                }
                else {
                    this.toastService.addToast('Report ' + ReportNames.BARNEPASS + ' does not exist!');
                    return Observable.of(false);
                }
            });
        }
    }

    setAllRows() {
        this.rows = this.allRows;
    }

    filterRowsWithEmail() {
        this.rows = this.rowsWithEmail;
    }

    filterRowsWithoutEmail() {
        this.rows = this.rowsWithoutEmail;
    }

    public handleSending(printAll: boolean = false) {
        const selectedPrints = this.checkedRows.filter(x => x['_type'] === this.sendTypePrint);
        const selectedEmails = this.checkedRows.filter(x => x['_type'] === this.sendTypeEmail);

        this.sendPrint(printAll ? this.checkedRows : selectedPrints);

        if (printAll || selectedEmails.length === 0) {
            this.table.clearSelection();
            return;
        }

        this.sendEmails(selectedEmails)
            .subscribe(response => {
                if (!response) {
                    return;
                }
                this.table.clearSelection();
                this.toastService.addToast("E-post sendt", ToastType.good, 3);
            });
    }

    private sendEmails(rows: OppgaveBarnepass[]): Observable<any> {
        return this.altinnService.emailBarnepassToCustomers(this.barnepass.ID, rows.map(x => x.foedselsnummer));
    }

    private sendPrint(rows: any[]) {
        if (!rows.length || !this.report) {
            return;
        }
        //Dersom det skal være flere kunder i samme rapport (utskrift)
        const customerFilter = rows.map(x => x.foedselsnummer).join(',');
        this.report.parameters = [
            {Name: 'Year', value: this.year},
            {Name: 'CustomerFilter', value: customerFilter}
        ];
        /* Ellers (foreach)
        this.report.parameters = [
            {Name: 'Year', value: this.year},
            {Name: 'CustomerOrgNumber', value: this.rows[0].foedselsnummer },
            {Name: 'Amount', value: this.rows[0].paaloeptBeloep },
            {Name: 'CustomerName', value: this.rows[0].navn}
        ];
        const customerID = null;//TODO finn kunde fra api
        if (customerID)
        {
            this.report.parameters.push({Name: 'CustomerID', value: customerID})
        }
        */
        this.modalService.open(UniPreviewModal, {data: this.report});
    }


    private updateSaveActions() {
        this.saveActions = this.getSaveActions(this.checkedRows && !!this.checkedRows.length);
    }

    private getSaveActions(isActive: boolean): IUniSaveAction[] {
        return [
            {
                label: 'Send e-post/Skriv ut',
                action: () => this.handleSending(),
                disabled: !isActive
            },
            {
                label: 'Skriv ut alle valgte',
                action: () => this.handleSending(true),
                disabled: !isActive
            }
        ];
    }

    private setupTable() {
        const navnCol = new UniTableColumn('navn', 'Navn');
        const emailCol = new UniTableColumn('email', 'E-post');
        const typeCol = new UniTableColumn('_type', 'Type');

        this.tableConfig = new UniTableConfig('salary.barnepass.sendings', false, true, 25)
            .setSearchable(true)
            .setColumnMenuVisible(true)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([navnCol, emailCol, typeCol]);
    }

    public rowSelectionChange(selectedRows?: OppgaveBarnepass[]) {
        this.checkedRows = selectedRows;
        this.emailCount = 0;
        this.printCount = 0;
        selectedRows.forEach(row => {
            if (row['_type'] === this.sendTypeEmail) {
                this.emailCount++;
            } else {
                this.printCount++;
            }
        });

       this.updateSaveActions();
    }

    public setBusy(event: boolean) {
        this.busy = event;
    }

    public close() {
        this.onClose.next(true);
    }

/* dropdown
    private getReportsFields(reports: ReportDefinition[]): UniFieldLayout[] {
        return <any[]>[
            {
                Property: 'ReportID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Rapport',
                Options: {
                    source: reports,
                    displayProperty: 'Description',
                    valueProperty: 'ID'
                }
            }
        ];
    }

    private setUpFields() {
        const fields = [
            {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: 'TODO',//this.entityType,
                Property: 'UseReportID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Rapport',
                ReadOnly: false,
                Options: {
                    source: this.reports,
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 200,
                    addEmptyValue: true
                },
            }
        ];

        this.fields$.next(fields);
    }
*/
}