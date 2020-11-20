import { Injectable } from '@angular/core';
import { UniHttp } from '@uni-framework/core/http/http';
import { UniEntity } from '@uni-entities';
import { BizHttp } from '@uni-framework/core/http';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map, take} from 'rxjs/operators';
import { isNullOrUndefined } from 'util';

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
    private _code = '';

    public GetRecords(client: HttpClient): Observable<FormRecordWithKey[]> {
        return client.get(`assets/tax-records/${this._code}.json`, {observe: 'body'}).pipe(
            take(1),
            map((records: any[]) => records.map(record => new FormRecordWithKey(record.key, record.text)))
        );
    }
    constructor(code: string) {
        this._code = code;
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
    public SendAnnualTaxReport(annualSettlementID: number) {
        super.PutAction(null, 'send-annual', 'annualSettlementID=' + annualSettlementID).subscribe(() => {
            // this action does not return anything yet
        });
    }

    public getRecords(taxReport: TaxReport): Observable<FormRecordWithKey[]> {
        const taxRecords: FormRecordWithKey[] = [];
        const data = JSON.parse(taxReport.Data);

        const schema = new Schema('RF-1167');
        return schema.GetRecords(this.http.http).pipe(
            map(records => records.map((record) => {
                if (data[record.Key] !== undefined) {
                    const item: FormRecord = data[record.Key];
                    return new FormRecordWithKey(record.Key, record.Text, item.Value, item.Verified);
                } else {
                    console.error('The record ' + record.Key + ' is in json but not in the records from backend - has something changed?');
                    return new FormRecordWithKey('', record.Text);
                }
            })
            )
        );
    }
}
