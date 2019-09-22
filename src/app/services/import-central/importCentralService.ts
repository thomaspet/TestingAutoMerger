import { Injectable } from "@angular/core";
import { UniHttp } from "@uni-framework/core/http/http";
import { ImportUIPermission } from "@app/models/import-central/ImportUIPermissionModel";

@Injectable()
export class ImportCentralService {
    constructor(private http: UniHttp) { }

    uiPermission = {
        customer: new ImportUIPermission(),
        product: new ImportUIPermission(),
        supplier: new ImportUIPermission(),
        ledger: new ImportUIPermission(),
        payroll: new ImportUIPermission()
    }

    public getTemplateWithData(entityType) {
        return this.http
            .usingRootDomain()
            .withDefaultHeaders()
            .asGET()
            .withEndPoint(`import-central/download-with-data?entity=${entityType}`)
            .send({responseType: 'blob'})
            .map(res => new Blob([res.body], { type: 'text/csv' }));
    }

    public getDiclaimerAudit(userid: number) {
        return this.http
            .usingBusinessDomain()
            .withDefaultHeaders()
            .asGET()
            .withEndPoint(`auditlogs?filter=EntityType eq 'User' and EntityID eq ${userid} and Field eq 'HasAgreedToImportDisclaimer'`)
            .send()
            .map(res =>  res.body);
    }

    public getAccessibleComponents(permissions) {
        ['customer', 'product', 'supplier', 'ledger', 'payroll'].forEach(ent => this.resetUIPermissions(ent));
        if (permissions.length) {
            permissions.map(per => {
                let uiKeys = per.split('_');
                if (uiKeys.includes('import')) {
                    this.setPermissions(uiKeys, 'customer');
                    this.setPermissions(uiKeys, 'product');
                    this.setPermissions(uiKeys, 'supplier');
                    this.setPermissions(uiKeys, 'ledger');
                    this.setPermissions(uiKeys, 'payroll');
                }
            });
        } else {
            this.setPermissions(permissions, 'customer');
            this.setPermissions(permissions, 'product');
            this.setPermissions(permissions, 'supplier');
            this.setPermissions(permissions, 'ledger');
            this.setPermissions(permissions, 'payroll');
        }
        return this.uiPermission;
    }

    private setPermissions(uiKeys: any, entity: string) {
        if (uiKeys.length) {
            if (uiKeys.includes(entity)) {
                this.uiPermission[entity].hasComponentAccess = true;
                if (uiKeys.includes('template')) {
                    this.uiPermission[entity].hasTemplateAccess = true;
                    if (uiKeys.includes('data')) {
                        this.uiPermission[entity].hasTemplateDataAccess = true;
                    }
                }
            }
        } else {
            this.uiPermission[entity].hasComponentAccess = true;
            this.uiPermission[entity].hasTemplateAccess = true;
            this.uiPermission[entity].hasTemplateDataAccess = true;
        }
    }

    private resetUIPermissions(entity) {
        this.uiPermission[entity].hasComponentAccess = false;
        this.uiPermission[entity].hasTemplateAccess = false;
        this.uiPermission[entity].hasTemplateDataAccess = false;
    }

}
