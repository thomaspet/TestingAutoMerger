import { Injectable } from "@angular/core";
import { UniHttp } from "@uni-framework/core/http/http";
import { ResponseContentType } from "@angular/http";

@Injectable()
export class ImportCentralService {
    constructor(private http: UniHttp) { }

    public getTemplateWithData(entityType) {
        return this.http
            .usingRootDomain()
            .withDefaultHeaders()
            .asGET()
            .withEndPoint(`import-central/download-with-data?entity=${entityType}`)
            .send({ responseType: ResponseContentType.Blob })
            .map(res => new Blob([res._body], { type: 'text/csv' }));
    }

    public getDiclaimerAudit(userid: number) {
        return this.http
            .usingBusinessDomain()
            .withDefaultHeaders()
            .asGET()
            .withEndPoint(`auditlogs?filter=EntityType eq 'User' and EntityID eq ${userid} and Field eq 'HasAgreedToImportDisclaimer'`)
            .send()
            .map(res => res.json());
    }

}