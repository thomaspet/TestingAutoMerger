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
            this._records.push(new FormRecordWithKey('Revisjonsplikt', 'Er foretaket revisjonspliktig?'));
            this._records.push(new FormRecordWithKey('RevisorOrganisasjonsnummer', 'Revisors organisasjonsnr.'));
            this._records.push(new FormRecordWithKey('RevisjonsselskapNavn', 'Revisorselskapets navn'));
            this._records.push(new FormRecordWithKey('RevisorNavn', 'Revisors navn'));
            this._records.push(new FormRecordWithKey('RevisorAdresse', 'Adresse'));
            this._records.push(new FormRecordWithKey('RevisorPostnummer', 'Postnr.'));
            this._records.push(new FormRecordWithKey('RevisorPoststed', 'Poststed'));
            // Er den løpende bokføringen utført av ekstern regnskapsfører? Ja/Nei
            this._records.push(new FormRecordWithKey('RegnskapsforingEkstern', 'Er den løpende bokføringen utført av ekstern regnskapsfører?'));
            this._records.push(new FormRecordWithKey('RegnskapsforerNavn', 'Navn'));
            this._records.push(new FormRecordWithKey('RegnskapsforerOrganisasjonsnummer', 'Organisasjonsnr.'));
            this._records.push(new FormRecordWithKey('RegnskapsforerAdresse', 'Forretningsadresse'));
            this._records.push(new FormRecordWithKey('RegnskapsforerPostnummer', 'Postnummer og poststed'));
            this._records.push(new FormRecordWithKey('RegnskapsforerPoststed', 'Poststed i adressen til regnskapsfører'));
            this._records.push(new FormRecordWithKey('FremforbartUnderskudd', 'Fremførbart underskudd'));
            this._records.push(new FormRecordWithKey('Sysselsatte', 'Antall årsverk i regnskapsåret'));
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

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = TaxReport.RelativeUrl;
        this.entityType = TaxReport.EntityType;
    }

    public GetOrCreateTaxReport(): Observable<TaxReport> {
        // TODO year. Skal det velges av bruker, være likt året man jobber med, eller?
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

    public getRecords(taxReport: TaxReport): FormRecordWithKey[] {
        const taxRecords: FormRecordWithKey[] = [];
        const data = JSON.parse(taxReport.Data);

        const schema = new Schema('RF-1167');
        const records = schema.GetRecords();
        records.forEach((record) => {
            const item: FormRecord = data[record.Key];
            taxRecords.push(new FormRecordWithKey(record.Key, record.Text, item.Value, item.Verified));
        });
        return taxRecords;
    }
}
