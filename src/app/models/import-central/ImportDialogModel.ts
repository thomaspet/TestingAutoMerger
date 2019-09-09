export class ImportDialogModel {
    Url: string;
    CompanyKey: string;
    CompanyName: string;
    ImportFileType: ImportFileType;
    ImportOption: ImportOption;
}

export enum ImportFileType {
    StandardizedExcelFormat,
    StandardUniFormat
}

export enum ImportOption {
    Skip,
    Override,
    Duplicate
}

export enum TemplateType {
    Customer,
    Product,
    Supplier,
    MainLedger,
    Payroll,
    Saft,
    All
}

export enum ImportJobName  {
    Customer = 'CustomerImportJob',
    Product = 'ProductImportJob',
    Supplier= 'SupplierImportJob',
    MainLedger= 'MainLedgerImportJob',
    Payroll= 'PayrollmportJob'
}