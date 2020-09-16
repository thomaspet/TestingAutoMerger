import { AfterViewInit, Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormRecord, FormRecordWithKey, NameKey, SchemaRF1167, TaxReport, TaxReportService } from '@app/services/common/taxReportService';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { FieldType, UniFieldLayout } from '@uni-framework/ui/uniform';
import { IUniTableConfig, UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import { IUniModal } from '@uni-framework/uni-modal';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

@Component({
    selector: 'taxreport-modal',
    templateUrl: './taxreport-modal.html'
})
export class TaxReportModal implements IUniModal, OnInit, AfterViewInit  {
    @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;

    onClose = new EventEmitter();

    public fields$: BehaviorSubject<Partial<UniFieldLayout>[]>;
    public current = new BehaviorSubject(new SchemaRF1167());

    taxReport$: BehaviorSubject<TaxReport> = new BehaviorSubject(null);
    taxRecords$: BehaviorSubject<FormRecord[]> = new BehaviorSubject([]);
    taxRecordsDict$: BehaviorSubject<FormRecordWithKey[]> = new BehaviorSubject([]);// BehaviorSubject<{ Key: string, record: FormRecord}[]> = new BehaviorSubject([]);
    taxReportCode: string;
    taxRecords: FormRecord[] = [];
    taxConfig$: BehaviorSubject<IUniTableConfig> = new BehaviorSubject(null);
    taxConfigDict$: BehaviorSubject<IUniTableConfig> = new BehaviorSubject(null);

    private table$: ReplaySubject<AgGridWrapper> = new ReplaySubject(1);

    constructor(private taxReportService: TaxReportService) {}

    public ngOnInit() {
        let taxRecordsDict: FormRecordWithKey[]; // { Key: string, record: FormRecord}[];
        // const currentYear = new Date().getFullYear();
        this.taxReportService.GetOrCreateTaxReport()
            .subscribe((report: TaxReport) => {
                this.taxReport$.next(report);
                this.taxReportCode = report.Code;
                taxRecordsDict = this.taxReportService.getRecords(report);
                // this.taxRecords = this.taxReportService.getTaxReportRecords(report);
                /* all records
                const data = JSON.parse(report.Data);
                Object.keys(data).forEach(key => {
                    const value = data[key];
                    this.taxRecords.push(value);
                }); */
                // this.taxRecords$.next(this.taxRecords);
                this.taxRecordsDict$.next(taxRecordsDict);

                // this.focus(this.taxRecords[0]);

                const schema = new SchemaRF1167();
                schema.Revisjonsplikt = 'Nei';
                this.current.next(schema);
        });
        // this.taxConfig$.next(this.getTaxConfig(false));
        this.taxConfigDict$.next(this.getTaxConfig(true));

        this.initForm();
    }

    public ngAfterViewInit(): void {
        this.table$.next(this.table);
    }

    public saveAndSend() {
        this.taxReportService.SaveTaxReport(this.taxReport$.value).subscribe((saved) => {
            this.taxReportService.SendTaxReport(saved.ID);
        });
    }

    public save() {
        // få med endringer i grid
        const current = this.current.getValue();
        const revisjonspliktValue = current.Revisjonsplikt;

        const records: FormRecordWithKey[] = this.taxRecordsDict$.getValue();
        const key = 'Revisjonsplikt-datadef-310';
        const record = records.find(x => x.Key === key);
        const report = this.taxReport$.getValue();
        const data = JSON.parse(report.Data);
        // const item: FormRecord = Object.keys(data)[key]; // Object.entries(data)[key];
        // item.Value = record.Value;
        Object.keys(data).forEach(key1 => {
            if (key1 === key) {
                const item: FormRecord = data[key1];
                item.Value = revisjonspliktValue; // record.Value;
            }
        });
        report.Data = JSON.stringify(data);
        this.taxReport$.next(report);
        this.taxReportService.SaveTaxReport(this.taxReport$.value).subscribe((saved) => {
        });
    }

    private getTaxConfig(key: boolean): IUniTableConfig {

        const keyCol = new UniTableColumn('Key', 'Navn', UniTableColumnType.Text); // TODO hidden
        const textCol = new UniTableColumn('Text', 'Tekst', UniTableColumnType.Text, false);
        const valueCol = new UniTableColumn('Value', 'Verdi', UniTableColumnType.Text, true);
        const verifiedCol = new UniTableColumn('Verified', 'Verifisert', UniTableColumnType.Boolean, true); // TODO checkbox

        if (key) {
        return new UniTableConfig('salary.altinn-overview')
            .setColumns([keyCol, textCol, valueCol, verifiedCol]);
        }
        return new UniTableConfig('salary.altinn-overview')
            .setColumns([textCol, valueCol, verifiedCol]);
    }

    private focus(record: FormRecord) {
        if (!record) {
            return;
        }
        this.taxRecords$
            .take(1)
            .delay(200)
            .switchMap(records => Observable.forkJoin(Observable.of(records), this.table$.take(1)))
            .subscribe((result) => {
                const [table] = result;
                /*const receiptRows = receipts.find(row => row.ID === taxReport.ID);
                if (!receiptRows) {
                    return;
                }
                table.focusRow(receiptRows['_originalIndex']);*/
            });
    }

    private initForm() {
        const fields: Partial<UniFieldLayout>[] = [
            {
                Property: 'Revisjonsplikt',
                FieldType: FieldType.DROPDOWN,
                Label: 'Valuta',
                Classes: 'bill-small-field right',
                Section: 0
            }
        ];

        const revisjonspliktValues: NameKey[] = [];
        revisjonspliktValues.push(new NameKey('Ja'));
        revisjonspliktValues.push(new NameKey('Nei'));
        revisjonspliktValues.push(new NameKey('Valgt_bort_revisjon', 'Valgt bort'));
        const revisjonspliktField = fields.find(f => f.Property === 'Revisjonsplikt');
        revisjonspliktField.Options = {
            source: revisjonspliktValues,
            valueProperty: 'Key',
            displayValue: 'Name',
            debounceTime: 200,
            hideDeleteButton: true
        };

        this.fields$ = new BehaviorSubject(fields);
    }

    emit() {
        // this.saveAndSend();
        this.onClose.emit();
    }
}
