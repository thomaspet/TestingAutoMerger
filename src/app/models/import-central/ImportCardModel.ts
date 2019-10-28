import { TemplateType } from "./ImportDialogModel";
import { ImportUIPermission, ImportSaftUIPermission } from "./ImportUIPermissionModel";

export class ImportCardModel {
    uiPermission: {
        hasComponentAccess?: boolean;
        hasTemplateAccess?: boolean;
        hasTemplateDataAccess?: boolean;
        hasImportAccess?: boolean;
        hasExportAccess?: boolean;
    }
    type:TemplateType;
    iconName: string;
    title:string;
    importText: string;
    downloadText: string;
}