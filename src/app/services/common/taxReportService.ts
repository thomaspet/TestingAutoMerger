import { Injectable } from '@angular/core';
import { UniHttp } from '@uni-framework/core/http/http';
import { UniEntity } from '@uni-entities';
import { BizHttp } from '@uni-framework/core/http';
import {Observable} from 'rxjs';
import { inherits } from 'util';

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
        // Er firmaet revisjonspliktig? - Ja/Nei/Valgt bort
        let key = 'Revisjonsplikt-datadef-310';
        taxRecords.push(this.getFormRecordWithKey(key, data[key]));
        // TODO Hvis Ja på forrige spørsmål -> Revisor sitt orgnr, navn og kontaktperson (3 felter)

        // Er den løpende bokføringen utført av ekstern regnskapsfører? Ja/Nei
        key = 'RegnskapsforingEkstern-datadef-11262';
        taxRecords.push(this.getFormRecordWithKey(key, data[key]));
        // Hvis Ja på forrige spørsmål -> Regnskapsfører sitt navn, orgnr og kontaktperson (3 felter)
        key = 'RegnskapsforerNavn-datadef-280';
        taxRecords.push(this.getFormRecordWithKey(key, data[key]));
        key = 'RegnskapsforerOrganisasjonsnummer-datadef-3651';
        taxRecords.push(this.getFormRecordWithKey(key, data[key]));
        key = 'RegnskapsforerAdresse-datadef-281';
        taxRecords.push(this.getFormRecordWithKey(key, data[key]));
        key = 'RegnskapsforerPostnummer-datadef-6678';
        taxRecords.push(this.getFormRecordWithKey(key, data[key]));
        key = 'RegnskapsforerPoststed-datadef-6679';
        taxRecords.push(this.getFormRecordWithKey(key, data[key]));
        // TODO Fremførbart underskudd - tall-felt
        //
        key = 'Sysselsatte-datadef-30';
        taxRecords.push(this.getFormRecordWithKey(key, data[key]));
        /*
        // Object.entries(data).map(([key, val]) => console.log(key, '=>', val));
        Object.keys(data).forEach(key => {
            // her kommer trolig en endring, Text hentes fra json fil i front e.l.
            const value: FormRecord = data[key];
            const record = new FormRecordWithKey(); // { Key = key, Text = value.Text };
            record.Key = key;
            record.Text = value.Text;
            record.Value = value.Value;
            record.Verified = value.Verified;
            taxRecords.push(record);
        });*/
        return taxRecords;
    }

    private getFormRecordWithKey(key: string, value: FormRecord) {
        const record = new FormRecordWithKey();
            record.Key = key;
            record.Text = value.Text;
            record.Value = value.Value;
            record.Verified = value.Verified;
        return record;
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
