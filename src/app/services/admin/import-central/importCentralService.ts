import { Injectable } from '@angular/core';
import { UniHttp } from '@uni-framework/core/http/http';

@Injectable()
export class ImportCentralService {
    constructor(private http: UniHttp) {}

    getTemplateWithData(entityType) {
        return this.http
            .usingRootDomain()
            .withDefaultHeaders()
            .asGET()
            .withEndPoint(`import-central/download-with-data?entity=${entityType}`)
            .send({ responseType: 'blob' })
            .map(res => new Blob([res.body], { type: 'text/csv' }));
    }

    getDiclaimerAudit(userid: number) {
        return this.http
            .usingBusinessDomain()
            .withDefaultHeaders()
            .asGET()
            .withEndPoint(`auditlogs?filter=EntityType eq 'User' and EntityID eq ${userid} and Field eq 'HasAgreedToImportDisclaimer'`)
            .send()
            .map(res => res.body);
    }
}
