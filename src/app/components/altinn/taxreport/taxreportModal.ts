import { AfterViewInit, Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormRecordWithKey, NameKey, SchemaRF1167, TaxReport, TaxReportService } from '@app/services/common/taxReportService';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { FieldType, UniFieldLayout } from '@uni-framework/ui/uniform';
import { IUniTableConfig, UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import { IUniModal } from '@uni-framework/uni-modal';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

@Component({
    selector: 'taxreport-modal',
    templateUrl: './taxreport-modal.html'
})
export class TaxReportModal implements IUniModal, OnInit, AfterViewInit  {
    @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;

    onClose = new EventEmitter();

    public fields$: BehaviorSubject<Partial<UniFieldLayout>[]>;
    public current = new BehaviorSubject(new SchemaRF1167());
    keys: string[] = [];

    taxReport$: BehaviorSubject<TaxReport> = new BehaviorSubject(null);
    // what is best - Dictionary (as received from backend) or own class FormRecordWithKey?
    taxRecords$: BehaviorSubject<FormRecordWithKey[]> = new BehaviorSubject([]);// BehaviorSubject<{ Key: string, record: FormRecord}[]> = new BehaviorSubject([]);
    taxReportCode: string;
    config$: BehaviorSubject<IUniTableConfig> = new BehaviorSubject(null);

    private table$: ReplaySubject<AgGridWrapper> = new ReplaySubject(1);

    constructor(private taxReportService: TaxReportService) {}

    public ngOnInit() {
        let taxRecords: FormRecordWithKey[];
        this.taxReportService.GetOrCreateTaxReport()
            .subscribe((report: TaxReport) => {
                this.taxReport$.next(report);
                this.taxReportCode = report.Code;
                taxRecords = this.taxReportService.getRecords(report);
                const keys: string[] = [];
                taxRecords.forEach((rec) => {
                    keys.push(rec.Key);
                });
                this.keys = keys;
                this.taxRecords$.next(taxRecords);

                this.setCurrent(taxRecords);
        });
        this.config$.next(this.getConfig(false));

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
        this.updateValues();
        this.taxReportService.SaveTaxReport(this.taxReport$.value).subscribe((saved) => {
        });
    }

    private setCurrent(records: FormRecordWithKey[]) {
        const schema = new SchemaRF1167();
        const item = records.find(x => x.Key === 'Revisjonsplikt');
        schema.Revisjonsplikt = item.Value;
        this.current.next(schema);
    }

    private updateValues() {
        /* testing 2 different methods for updating values
           1: schema has class with properties (only Revisjonsplikt atm)
           2: generic - fields in grid
        */
        const current = this.current.getValue();
        const records: FormRecordWithKey[] = this.taxRecords$.getValue();
        const report = this.taxReport$.getValue();
        const data = JSON.parse(report.Data);

        const revisjonspliktValue = current.Revisjonsplikt;
        this.keys.forEach((key) => {
            const record = records.find(x => x.Key === key);
            const item = data[key];
            if (key === 'Revisjonsplikt') {
                item.Value = revisjonspliktValue;
            } else {
                item.Value = record.Value;
            }
        });

        report.Data = JSON.stringify(data);
        this.taxReport$.next(report);
    }

    private getConfig(key: boolean): IUniTableConfig {

        const keyCol = new UniTableColumn('Key', 'Navn', UniTableColumnType.Text, false);
        const textCol = new UniTableColumn('Text', 'Tekst', UniTableColumnType.Text, false);
        const valueCol = new UniTableColumn('Value', 'Verdi', UniTableColumnType.Text, true);
        const verifiedCol = new UniTableColumn('Verified', 'Verifisert', UniTableColumnType.Boolean, true);

        if (key) {
        return new UniTableConfig('altinn.tax-report')
            .setColumns([keyCol, textCol, valueCol, verifiedCol]);
        }
        return new UniTableConfig('altinn.tax-report')
            .setColumns([textCol, valueCol]);
    }

    private initForm() {
        const fields: Partial<UniFieldLayout>[] = [
            {
                Property: 'Revisjonsplikt',
                FieldType: FieldType.DROPDOWN,
                Label: 'Er foretaket revisjonspliktig?',
                Classes: 'bill-small-field right',
                Section: 0
            }
        ];

        const revisjonspliktValues: NameKey[] = [];
        // TODO get the values from json-file or similar
        revisjonspliktValues.push(new NameKey('Ja'));
        revisjonspliktValues.push(new NameKey('Nei'));
        revisjonspliktValues.push(new NameKey('Valgt_bort_revisjon', 'Valgt bort'));
        const revisjonspliktField = fields.find(f => f.Property === 'Revisjonsplikt');
        revisjonspliktField.Options = {
            source: revisjonspliktValues,
            valueProperty: 'Key',
            template: (item) => item.Name,
            debounceTime: 200,
            hideDeleteButton: true
        };

        this.fields$ = new BehaviorSubject(fields);
    }

    emit() {
        this.onClose.emit();
    }
}
