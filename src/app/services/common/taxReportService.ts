import { Injectable } from '@angular/core';
import { UniHttp } from '@uni-framework/core/http/http';
import { UniEntity } from '@uni-entities';
import { BizHttp } from '@uni-framework/core/http';
import {Observable} from 'rxjs';

@Injectable()
export class TaxReportService extends BizHttp<TaxForm> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = TaxForm.RelativeUrl;
        this.entityType = TaxForm.EntityType;
    }

    public CreateTaxReport(): Observable<TaxForm> {
        return super.PostAction(null, 'create', 'year=2020&code=RF-1167');
    }
}

export class TaxForm extends UniEntity {
    public static RelativeUrl = 'taxform';
    public static EntityType = 'TaxForm';

    public ID: number;
    public Year: number;
    public Data: string;
    public Code: string;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
}
