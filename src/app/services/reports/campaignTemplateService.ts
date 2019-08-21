import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CampaignTemplate} from '@uni-entities';

@Injectable()
export class CampaignTemplateService extends BizHttp<CampaignTemplate> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = CampaignTemplate.RelativeUrl;
        this.entityType = CampaignTemplate.EntityType;
        this.DefaultOrderBy = 'ID';
    }

    public getInvoiceTemplatetext() {
        const params = new HttpParams()
            .set('filter', `EntityName eq 'CustomerInvoice'`);

        return this.GetAllByHttpParams(params, true);
    }

    public getOrderTemplateText() {
        const params = new HttpParams()
            .set('filter', `EntityName eq 'CustomerOrder'`);

        return this.GetAllByHttpParams(params, true);
    }

     public getQuoteTemplateText() {
        const params = new HttpParams()
            .set('filter', `EntityName eq 'CustomerQuote'`);

        return this.GetAllByHttpParams(params, true);
    }
}
