import {Pipe, PipeTransform} from '@angular/core';

const ROLE_TRANSLATIONS = {
    'Accounting.Admin': 'Full tilgang regnskap',
    'Accounting.Journal': 'Bilagsføring',
    'Accounting.Reporting': 'Rapportering',
    'Accounting.Approval': 'Fakturagodkjenning',
    'Approval.Accounting': 'Forenklet fakturagodkjenning',

    'Sales.Admin': 'Full tilgang salg',
    'Sales.Manager': 'Salgsledelse',
    'Sales.Invoice': 'Faktura',
    'Sales.Order': 'Ordre',
    'Sales.Quote': 'Tilbud',
    'Sales.Reporting': 'Rapportering',

    'Payroll.Admin': 'Full tilgang lønn',
    'Payroll.Travel': 'Reiseregning',
    'Payroll.HR': 'Personalannsvar - lønn',
    'Payroll.Payroll': 'Personalannsvar - lønn',
    'Payrollplus.Admin': 'Full tilgang lønn utvidet',

    'Timetracking.Admin': 'Full tilgang timer',
    'Timetracking.HR': 'Personalansvar - timer',
    'Timetracking.Manager': 'Timegodkjenning',
    'Timetracking.Reporting': 'Rapportering',
    'Timetracking.Worker': 'Timeregistrering',
};

@Pipe({
    name: 'translateRole',
    pure: true
})
export class RoleTranslationPipe implements PipeTransform {

    transform(roleName: string): string {
        return ROLE_TRANSLATIONS[roleName] || roleName;
    }
}
