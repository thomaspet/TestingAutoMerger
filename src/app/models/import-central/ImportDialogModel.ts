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

export enum VoucherOptions {
    Draft,
    Post
}

export enum TemplateType {
    Customer,
    Product,
    Supplier,
    MainLedger,
    Payroll,
    Saft,
    Voucher,
    All
}

export enum ImportJobName {
    Customer = 'CustomerImportJob',
    Product = 'ProductImportJob',
    Supplier = 'SupplierImportJob',
    MainLedger = 'MainLedgerImportJob',
    Payroll = 'PayrollmportJob',
    Saft = 'ImportSaft',
    Voucher = 'VoucherImportJob'
}

export enum ImportStatement {
    ProductFormatStatement = 'Importen støtter også Uni standard format (*.txt, rectype \'70\'). For bruk til import fra Uni økonomi V3.(NB! Salgskonto på varen setter mva-kode. Importen håndterer bare priser med eks.mva, varer med mva-kode \'1\' vil få feil pris)',
    ProductDownloadStatement = 'Last ned excel mal for bruk til import fra eksterne system.',

    CustomerFormatStatement = 'Importen støtter også Uni standard format (*.txt, rectype \'30\'). For bruk til import fra Uni økonomi V3.',
    CustomerDownloadStatement = 'Last ned excel mal for bruk til import fra eksterne system.',

    SupplierFormatStatement = 'Importen støtter også Uni standard format (*.txt, rectype \'40\'). For bruk til import fra Uni økonomi V3.',
    SupplierDownloadStatement = 'Last ned excel mal for bruk til import fra eksterne system',

    MainLedgerConditionalStatement = 'Hvis kontonummer i filen eksisterer i Uni Economy, så vil importen hoppe over rad med dette nummeret. Kontonumrene blir validert mot kontoserien, som ligger under Innstillinger, og filen avvises ved avvik.',
    MainLedgerFormatStatement = 'Importen støtter også Uni standard format (*.txt, rectype \'20\'). For bruk til import fra Uni økonomi V3.',
    MainLedgerDownloadStatement = 'Last ned excel mal for bruk til import fra eksterne system.'
}