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
    Order,
    All
}

export enum ImportJobName {
    Customer = 'CustomerImportJob',
    Product = 'ProductImportJob',
    Supplier = 'SupplierImportJob',
    MainLedger = 'MainLedgerImportJob',
    Payroll = 'PayrollmportJob',
    Saft = 'ImportSaft',
    Voucher = 'VoucherImportJob',
    Order = 'OrderImportJob',
}

export enum ImportStatement {
    ProductFormatStatement = 'Importen støtter også Uni standard format (*.txt, rectype \'70\'). For bruk til import fra Uni økonomi V3.(NB! Salgskonto på varen setter mva-kode. Importen håndterer bare priser med eks.mva, varer med mva-kode \'1\' vil få feil pris)',
    ProductDownloadStatement = 'Last ned excel mal for bruk til import fra eksterne system.',

    CustomerFormatStatement = 'Importen støtter også Uni standard format (*.txt, rectype \'30\'). For bruk til import fra Uni økonomi V3.',
    CustomerDownloadStatement = 'Last ned excel mal for bruk til import fra eksterne system.',

    SupplierFormatStatement = 'Importen støtter også Uni standard format (*.txt, rectype \'40\'). For bruk til import fra Uni økonomi V3.',
    SupplierDownloadStatement = 'Last ned excel mal for bruk til import fra eksterne system',

    MainLedgerConditionalStatement = 'Importen støtter kontoplan med nummer mellom 1000 - 8999, kontoer utenfor denne serien blir ignorert.',
    MainLedgerFormatStatement = 'Importen støtter også Uni standard format (*.txt, rectype ‘20’). For bruk til import fra Uni økonomi V3.',
    MainLedgerDownloadStatement = 'Last ned excel mal for bruk til import fra eksterne system.',

    OrderConditionalStatement = 'Hvis ordrenr. fra fil eksisterer i UE fra før så vil importen gi nye ordrenr. basert på neste ledige.',
    OrderFormatStatement = 'Importen støtter også Uni standard formatet (*.txt, rectype \'85\',\'86\')',
}