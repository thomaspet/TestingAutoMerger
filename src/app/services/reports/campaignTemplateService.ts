import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import { CampaignTemplate } from '@uni-entities';
import {URLSearchParams} from '@angular/http';

@Injectable()
export class CampaignTemplateService extends BizHttp<CampaignTemplate> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = CampaignTemplate.RelativeUrl;
        this.entityType = CampaignTemplate.EntityType;
        this.DefaultOrderBy = 'ID';
    }

    public getInvoiceTemplatetext() {
        const UrlSearchParams = new URLSearchParams();
        UrlSearchParams.set('filter', "EntityName eq 'CustomerInvoice'");

        return this.GetAllByUrlSearchParams(UrlSearchParams);
    }

    public getOrderTemplateText() {
        const UrlSearchParams = new URLSearchParams();
        UrlSearchParams.set('filter', "EntityName eq 'CustomerOrder'");

        return this.GetAllByUrlSearchParams(UrlSearchParams);
    }

     public getQuoteTemplateText() {
        const UrlSearchParams = new URLSearchParams();
        UrlSearchParams.set('filter', "EntityName eq 'CustomerQuote'");

        return this.GetAllByUrlSearchParams(UrlSearchParams);
    }
}
