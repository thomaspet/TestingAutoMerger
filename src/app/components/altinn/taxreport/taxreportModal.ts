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
    keys: string[] = [];

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
                // what is best - Dictionary (as received from backend) or own class FormRecordWithKey?
                taxRecordsDict = this.taxReportService.getRecords(report, this.keys);
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

                this.setCurrent(taxRecordsDict);
        });
        // this.taxConfig$.next(this.getTaxConfig(false));
        this.taxConfigDict$.next(this.getTaxConfig(true));

        this.initForm();
        this.populateKeys();
    }

    public ngAfterViewInit(): void {
        this.table$.next(this.table);
    }

    private populateKeys() {
       // TODO get keys from json-file or similar
       this.keys = [
            // Er firmaet revisjonspliktig? - Ja/Nei/Valgt bort
            'Revisjonsplikt-datadef-310',
            'RevisorOrganisasjonsnummer-datadef-1938',
            'RevisjonsselskapNavn-datadef-13035',
            'RevisorNavn-datadef-1937',
            'RevisorAdresse-datadef-2247',
            'RevisorPostnummer-datadef-11265',
            'RevisorPoststed-datadef-11266',
            'FremforbartUnderskudd',
            // Er den løpende bokføringen utført av ekstern regnskapsfører? Ja/Nei
            'RegnskapsforingEkstern-datadef-11262',
            'RegnskapsforerNavn-datadef-280',
            'RegnskapsforerOrganisasjonsnummer-datadef-3651',
            'RegnskapsforerAdresse-datadef-281',
            'RegnskapsforerPostnummer-datadef-6678',
            'RegnskapsforerPoststed-datadef-6679',
            // TODO Fremførbart underskudd - tall-felt
            'Sysselsatte-datadef-30'
        ];
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
        const item = records.find(x => x.Key === 'Revisjonsplikt-datadef-310');
        schema.Revisjonsplikt = item.Value;
        this.current.next(schema);
    }

    private updateValues() {
        /* testing 2 different methods for updating values
           1: schema has class with properties (only Revisjonsplikt atm)
           2: generic - fields in grid
        */
        const current = this.current.getValue();
        const records: FormRecordWithKey[] = this.taxRecordsDict$.getValue();
        const report = this.taxReport$.getValue();
        const data = JSON.parse(report.Data);

        const revisjonspliktValue = current.Revisjonsplikt;
        this.keys.forEach((key) => {
            const record = records.find(x => x.Key === key);
            const item = data[key];
            if (key === 'Revisjonsplikt-datadef-310') {
                item.Value = revisjonspliktValue;
            } else {
                item.Value = record.Value;
            }
        });

        report.Data = JSON.stringify(data);
        this.taxReport$.next(report);
    }

    private getTaxConfig(key: boolean): IUniTableConfig {

        const keyCol = new UniTableColumn('Key', 'Navn', UniTableColumnType.Text, false); // TODO hidden
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

    private initForm() {
        const fields: Partial<UniFieldLayout>[] = [
            {
                Property: 'Revisjonsplikt',
                FieldType: FieldType.DROPDOWN,
                Label: 'Revisjonsplikt',
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
