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

    public getRecords(code: string): FormRecord[] {
        const taxRecords: FormRecord[] = [];
        if (code === 'RF-1167') {
            taxRecords.push(new FormRecord('Antall årsverk i regnskapsåret'));
            taxRecords.push(new FormRecord('Kontaktpersonens navn'));
        }
        return taxRecords;
    }
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
