export enum ElementType {
    Print = 0,
    EHF = 1,
    Email = 2,
    Invoiceprint = 3,
    Efaktura = 4,
    Factoring = 5,
    Vipps = 6,
    AvtaleGiro = 7,
    AvtaleGiroEfaktura = 8
};

export var ElementTypes = [
    { type: ElementType.Print, label: 'Skriv ut', name: 'Print' },
    { type: ElementType.EHF, label: 'EHF', name: 'EHF' },
    { type: ElementType.Email, label: 'Send på epost', name: 'Email' },
    { type: ElementType.Invoiceprint, label: 'Fakturaprint (fra Nets)', name: 'Invoiceprint' },
    { type: ElementType.Efaktura, label: 'Efaktura', name: 'Efaktura' },
    { type: ElementType.Factoring, label: 'Factoring', name: 'Factoring' },
    { type: ElementType.Vipps, label: 'Vipps', name: 'Vippsinvoice' },
    { type: ElementType.AvtaleGiro, label: 'AvtaleGiro varsel', name: 'AvtaleGiro' },
    { type: ElementType.AvtaleGiroEfaktura, label: 'AvtaleGiro varsel + efaktura', name: 'AvtaleGiro + efaktura'}
];
