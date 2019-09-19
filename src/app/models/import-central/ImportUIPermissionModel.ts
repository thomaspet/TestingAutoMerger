export class ImportUIPermission {
    hasComponentAccess: boolean = false;
    hasTemplateAccess: boolean = false;
    hasTemplateDataAccess: boolean = false;
  }
export class ImportSaftUIPermission {
  hasImportAccess: boolean = false;
  hasExportAccess: boolean = false;
  hasComponentAccess: boolean = false;
}
export enum SaftPermissions {
  import,
  export
}