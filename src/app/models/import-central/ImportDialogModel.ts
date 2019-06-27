export class ImportDialogModel {
    Url: string;
    CompanyKey: string;
    CompanyName: string;
    ImportFileType: ImportFileType;
}

export enum ImportFileType {
    StandardizedExcelFormat,
    StandardUniFormat
}