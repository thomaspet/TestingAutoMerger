
import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CampaignTemplate} from '@uni-entities';
import { Observable } from 'rxjs';

@Injectable()
export class CampaignTemplateService extends BizHttp<CampaignTemplate> {

    private requestCache: {[hash: number]: Observable<any>} = {};

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = CampaignTemplate.RelativeUrl;
        this.entityType = CampaignTemplate.EntityType;
        this.DefaultOrderBy = 'ID';
    }

    getTemplateText() {
        const hash = this.hashFnv32a(this.relativeURL);

        if (!this.requestCache[hash]) {
            this.requestCache[hash] = this.http
                .asGET()
                .usingBusinessDomain()
                .withEndPoint(this.relativeURL)
                .send()
                .map(res => res.body)
                .publishReplay(1)
                .refCount();
        }
        return this.requestCache[hash];
    }

    public clearCache() {
        this.requestCache = {};
    }
}