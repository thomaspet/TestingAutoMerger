import { Injectable } from '@angular/core';
import { UniHttp } from '@uni-framework/core/http/http';
import { UniEntity } from '@uni-entities';
import { BizHttp } from '@uni-framework/core/http';
import {Observable} from 'rxjs';

export class TaxReport extends UniEntity {
    public static RelativeUrl = 'taxreport';
    public static EntityType = 'TaxReport';

    public ID: number;
    public Year: number;
    public Data: string;
    public Code: string;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Records: { Key: string, record: FormRecord}[];
}
export class FormRecord {
    public Type: string;
    public Text: string;
    public Value: string;
    public Verified: boolean;
    public ReadOnly: boolean;

    constructor(text?: string, verified: boolean = true) {
        this.Text = text || '';
        this.Verified = verified;
    }
}
export class FormRecordWithKey extends FormRecord {
    public Key: string;

    constructor(key: string, text?: string, value?: string, verified: boolean = false) {
        super();
        this.Key = key;
        this.Text = text || '';
        this.Value = value || '';
        this.Verified = verified;
    }
}

export class Schema {
    private _records: FormRecordWithKey[] = [];
    public GetRecords(): FormRecordWithKey[] {
        return this._records;
    }
    constructor(code: string) {
        // TODO get from json-file or similar
        if (code === 'RF-1167') {
            // Er firmaet revisjonspliktig? - Ja/Nei/Valgt bort
            this._records.push(new FormRecordWithKey('Revisjonsplikt-datadef-310', 'Er foretaket revisjonspliktig?'));
            this._records.push(new FormRecordWithKey('RevisorOrganisasjonsnummer-datadef-1938', 'Revisors organisasjonsnr.'));
            this._records.push(new FormRecordWithKey('RevisjonsselskapNavn-datadef-13035', ''));
            this._records.push(new FormRecordWithKey('RevisorNavn-datadef-1937', ''));
            this._records.push(new FormRecordWithKey('RevisorAdresse-datadef-2247', ''));
            this._records.push(new FormRecordWithKey('RevisorPostnummer-datadef-11265', ''));
            this._records.push(new FormRecordWithKey('RevisorPoststed-datadef-11266', ''));
            // Er den løpende bokføringen utført av ekstern regnskapsfører? Ja/Nei
            this._records.push(new FormRecordWithKey('RegnskapsforingEkstern-datadef-11262', ''));
            this._records.push(new FormRecordWithKey('RegnskapsforerNavn-datadef-280', ''));
            this._records.push(new FormRecordWithKey('RegnskapsforerOrganisasjonsnummer-datadef-3651', ''));
            this._records.push(new FormRecordWithKey('RegnskapsforerAdresse-datadef-281', ''));
            this._records.push(new FormRecordWithKey('RegnskapsforerPostnummer-datadef-6678', ''));
            this._records.push(new FormRecordWithKey('RegnskapsforerPoststed-datadef-6679', ''));
            this._records.push(new FormRecordWithKey('FremforbartUnderskudd', ''));
            this._records.push(new FormRecordWithKey('Sysselsatte-datadef-30', 'Antall årsverk i regnskapsåret'));
        }
    }
}
export class SchemaRF1167 {
    public Revisjonsplikt: string;
}
export class NameKey {
    public Key: string;
    public Name: string;

    constructor(key: string, name?: string) {
        this.Key = key || '';
        this.Name = name || key;
    }
}

@Injectable()
export class TaxReportService extends BizHttp<TaxReport> {

    // records$: BehaviorSubject<{ Key: string, record: FormRecord}[]> = new BehaviorSubject([]);
    records: { Key: string, record: FormRecord}[] = [];

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = TaxReport.RelativeUrl;
        this.entityType = TaxReport.EntityType;

        this.records = this.getTaxRecords('RF-1167');
    }

    public GetOrCreateTaxReport(): Observable<TaxReport> {
        return super.PostAction(null, 'get-or-create', 'year=2020&code=RF-1167');
    }

    public GetTaxReport(id: number): Observable<TaxReport> {
        return super.Get(id);
    }

    public SaveTaxReport(taxReport: TaxReport): Observable<TaxReport> {
        return super.Put(taxReport.ID, taxReport);
    }

    public SendTaxReport(id: number) {
        super.PutAction(null, 'send', 'ID=' + id).subscribe(() => {
            // this action does not return anything yet
        });
    }

    public getTaxRecords(code: string): { Key: string, record: FormRecord}[] {
        const result: { Key: string, record: FormRecord}[] = [];
        result['Sysselsattedatadef30'] = new FormRecord('Antall årsverk i regnskapsåret');
        result['KontaktpersonNavndatadef2'] = new FormRecord('Kontaktpersonens navn');
        return result;
    }

    // Dette er kun for visning. For oppdatering må vi også ha Key
    public getTaxReportRecords(taxReport: TaxReport): FormRecord[] {
        const taxRecords: FormRecord[] = [];
        const data = JSON.parse(taxReport.Data);
        // Object.entries(obj).map(([key, val]) => console.log(key, '=>', val));
        Object.keys(data).forEach(key => {
            // her kommer trolig en endring, Text hentes fra json fil i front e.l.
            const value = data[key];
            taxRecords.push(value);
        });
        return taxRecords;
    }

    public getRecords(taxReport: TaxReport): FormRecordWithKey[] {
        const taxRecords: FormRecordWithKey[] = [];
        const data = JSON.parse(taxReport.Data);

        // TODO kun key og value skal komme fra backend, resten her i front, json-fil e.l.
        const schema = new Schema('RF-1167');
        const records = schema.GetRecords();
        records.forEach((record) => {
            const item: FormRecord = data[record.Key];
            taxRecords.push(new FormRecordWithKey(record.Key, record.Text, item.Value, item.Verified));
        });
        return taxRecords;
    }

    private getFormRecordWithKey(key: string, value: FormRecord) {
        return new FormRecordWithKey(key, value.Text, value.Value, value.Verified);
    }

    public getTaxReportRecords_v1(taxReport: TaxReport): FormRecord[] {
        const taxRecords: FormRecord[] = [];
        const data = JSON.parse(taxReport.Data);
        const records = Object.entries(data);
        /*
                Object.keys(data).forEach(key => {
                    const value = data[key];
                    this.taxRecords.push(value);
                });
                */
        const item = Object.entries(data)['Sysselsatte-datadef-30'];
        taxRecords.push(Object.entries(data)['Sysselsatte-datadef-30']);
        return taxRecords;
    }
/*
    public getRecords(code: string): FormRecord[] {
        const taxRecords: FormRecord[] = [];
        if (code === 'RF-1167') {
            taxRecords.push(new FormRecord('Antall årsverk i regnskapsåret'));
            taxRecords.push(new FormRecord('Kontaktpersonens navn'));
        }
        return taxRecords;
    }
*/
}


/* endre til å ha json fil i front, med alle felt utenom Value og Verified
  "Sysselsattedatadef30": {
    "Type": 1,
    "Text": "Antall årsverk i regnskapsåret",
    "Value": null,
    "Verified": false,
    "ReadOnly": false
  },
  "KontaktpersonNavndatadef2": {
    "Type": 0,
    "Text": "Kontaktpersonens navn",
    "Value": null,
    "Verified": false,
    "ReadOnly": false
  }
*/
