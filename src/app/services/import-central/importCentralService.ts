import { Injectable } from "@angular/core";
import { UniHttp } from "@uni-framework/core/http/http";
import { ImportUIPermission, ImportSaftUIPermission, SaftPermissions } from "@app/models/import-central/ImportUIPermissionModel";

@Injectable()
export class ImportCentralService {
    constructor(private http: UniHttp) { }

    uiPermission = {
        customer: new ImportUIPermission(),
        product: new ImportUIPermission(),
        supplier: new ImportUIPermission(),
        ledger: new ImportUIPermission(),
        payroll: new ImportUIPermission(),
        saft: new ImportSaftUIPermission(),
        voucher: new ImportUIPermission()
    }

    public getTemplateWithData(entityType) {
        return this.http
            .usingRootDomain()
            .withDefaultHeaders()
            .asGET()
            .withEndPoint(`import-central/download-with-data?entity=${entityType}`)
            .send({ responseType: 'blob' })
            .map(res => new Blob([res.body], { type: 'text/csv' }));
    }

    public getDiclaimerAudit(userid: number) {
        return this.http
            .usingBusinessDomain()
            .withDefaultHeaders()
            .asGET()
            .withEndPoint(`auditlogs?filter=EntityType eq 'User' and EntityID eq ${userid} and Field eq 'HasAgreedToImportDisclaimer'`)
            .send()
            .map(res => res.body);
    }

    public getAccessibleComponents(permissions) {
        this.resetSaftUIPermissions();
        const imports = ['customer', 'product', 'supplier', 'ledger', 'payroll', 'voucher'];
        imports.forEach(ent => this.resetUIPermissions(ent));
        if (permissions.length) {
            permissions.map(per => {
                let uiKeys = per.split('_');
                if (uiKeys.includes('import')) {
                    imports.forEach(im => this.setPermissions(uiKeys, im));
                    if (uiKeys.includes('saf-t-import')) {
                        this.setPermissionSaft(uiKeys, SaftPermissions.import);
                    } else if (uiKeys.includes('saf-t-export')) {
                        this.setPermissionSaft(uiKeys, SaftPermissions.export);
                    }
                }
            });
        } else {
            imports.forEach(im => this.setPermissions(permissions, im));
            this.setPermissionSaft(permissions, 'saft');
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

    private setPermissionSaft(uiKeys, type) {
        if (uiKeys.length) {
            if (type === SaftPermissions.import) {
                this.uiPermission.saft.hasComponentAccess = true;
                this.uiPermission.saft.hasImportAccess = true;
            }
            if (type === SaftPermissions.export) {
                this.uiPermission.saft.hasComponentAccess = true;
                this.uiPermission.saft.hasExportAccess = true;
            }
        } else {
            this.uiPermission.saft.hasComponentAccess = true;
            this.uiPermission.saft.hasImportAccess = true;
            this.uiPermission.saft.hasExportAccess = true;
        }
    }

    private resetUIPermissions(entity) {
        this.uiPermission[entity].hasComponentAccess = false;
        this.uiPermission[entity].hasTemplateAccess = false;
        this.uiPermission[entity].hasTemplateDataAccess = false;
    }
    private resetSaftUIPermissions() {
        this.uiPermission.saft.hasComponentAccess = false;
        this.uiPermission.saft.hasImportAccess = false;
        this.uiPermission.saft.hasExportAccess = false;
    }

}
