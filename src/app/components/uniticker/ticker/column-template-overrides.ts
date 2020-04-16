import {EmploymentStatuses} from '@app/models/employmentStatuses';
import {TickerColumn} from '@app/services/services';
import {Leavetype, TaxType, SpecialTaxAndContributionsRule, StdWageType, SalBalType} from '@uni-entities';

interface ColumnTemplateOverrides {
    [tickerCode: string]: {
        [tickerField: string]: (row, column?: TickerColumn) => string;
    };
}

export const ColumnTemplateOverrides: ColumnTemplateOverrides = {
    // Accounting

    // Sales

    // Bank

    // Salary
    employment_list: {
        'TypeOfEmployment': (row, column) =>  EmploymentStatuses.employmentTypeToText(row[column.Alias]),
        'RemunerationType': (row, column) => EmploymentStatuses.remunerationTypeToText(row[column.Alias]),
        'WorkingHoursScheme': (row, column) => EmploymentStatuses.workingHoursSchemeToText(row[column.Alias]),
        'ShipType': (row, column) => EmploymentStatuses.shipTypeToText(row[column.Alias]),
        'ShipReg': (row, column) => EmploymentStatuses.shipRegToText(row[column.Alias]),
        'TradeArea': (row, column) => EmploymentStatuses.tradeAreaToText(row[column.Alias]),

    },

    leave_items: {
        'LeaveType': (row, column) => {
            switch (row[column.Alias]) {
                case Leavetype.NotSet:
                    return 'Ikke valgt';
                case Leavetype.Leave:
                    return 'Permisjon';
                case Leavetype.LayOff:
                    return 'Permittering';
                case Leavetype.Leave_with_parental_benefit:
                        return 'Permisjon med foreldrepenger';
                case Leavetype.Military_service_leave:
                    return 'Permisjon ved militærtjeneste';
                case Leavetype.Educational_leave:
                    return 'Utdanningspermisjon';
                case Leavetype.Compassionate_leave:
                    return 'Velferdspermisjon';
            }
        }
    },

    wagetype_list: {
        'GetRateFrom': row => {
            if (row.WageTypeGetRateFrom >= 0) {
                const labels = ['Lønnsart', 'Månedslønn ansatt', 'Timelønn ansatt', 'Frisats ansatt'];
                return labels[row.WageTypeGetRateFrom];
            }
        },
        'Limit_type': row => {
            const limitTypes = ['Ingen', 'Antall', 'Beløp'];
            if (row.WageTypeLimit_type || row.WageTypeLimit_type === 0) {
                return `${row.WageTypeLimit_type} - ${limitTypes[row.WageTypeLimit_type]}`;
            }
            return '';
        },
        'taxtype': (row, column) => {
            switch (row[column.Alias]) {
                case TaxType.Tax_None:
                    return 'Ingen';
                case TaxType.Tax_Table:
                    return 'Tabelltrekk';
                case TaxType.Tax_Percent:
                    return 'Prosenttrekk';
                case TaxType.Tax_0:
                    return 'Trekkplikt uten skattetrekk';
            }
        },
        'SpecialTaxAndContributionsRule': (row, column) => {
            switch (row[column.Alias]) {
                case SpecialTaxAndContributionsRule.Standard:
                    return 'Standard/ingen valgt';
                case SpecialTaxAndContributionsRule.SpesialDeductionForMaritim:
                    return 'Særskilt fradrag for sjøfolk';
                case SpecialTaxAndContributionsRule.Svalbard:
                    return 'Svalbard';
                case SpecialTaxAndContributionsRule.JanMayenAndBiCountries:
                    return 'Jan Mayen og bilandene';
                case SpecialTaxAndContributionsRule.NettoPayment:
                    return 'Netto lønn';
                case SpecialTaxAndContributionsRule.NettoPaymentForMaritim:
                    return 'Nettolønn for sjøfolk';
                case SpecialTaxAndContributionsRule.PayAsYouEarnTaxOnPensions:
                    return 'Kildeskatt for pensjonister';
                case SpecialTaxAndContributionsRule.TaxFreeOrganization:
                    return 'Skattefri organisasjon';
            }
        },
        'StandardWageTypeFor': (row, column) => {
            switch (row[column.Alias]) {
                case StdWageType.None:
                    return 'Ingen';
                case StdWageType.TaxDrawTable:
                    return 'Tabelltrekk';
                case StdWageType.TaxDrawPercent:
                    return 'Prosenttrekk';
                case StdWageType.HolidayPayWithTaxDeduction:
                    return 'Feriepenger med skattetrekk';
                case StdWageType.HolidayPayThisYear:
                    return 'Feriepenger i år';
                case StdWageType.HolidayPayLastYear:
                    return 'Feriepenger forrige år';
                case StdWageType.HolidayPayEarlierYears:
                    return 'Feriepenger tidligere år';
                case StdWageType.AdvancePayment:
                    return 'Forskudd';
                case StdWageType.Contribution:
                    return 'Bidragstrekk';
                case StdWageType.Garnishment:
                    return 'Utleggstrekk skatt';
                case StdWageType.Outlay:
                    return 'Utleggstrekk';
                case StdWageType.SourceTaxPension:
                    return 'Forskuddstrekk kildeskatt på pensjon';
            }
        }
    },

    employee_list: {
        'OtpStatus': row => {
            const otpStatuses = ['Aktiv', 'Syk', 'Permittert', 'Lovfestet permisjon', 'Avtalt permisjon'];
            return otpStatuses[row.EmployeeOtpStatus] || otpStatuses[0];
        },
        'TypeOfPaymentOtp': row => {
            const typesOfPaymentOtp = ['Fast', 'Time', 'Provisjon'];
            return typesOfPaymentOtp[row.EmployeeTypeOfPaymentOtp] || typesOfPaymentOtp[0];
        },
        'InternasjonalIDType': row => {
            const internationalIDType = ['Ikke valgt', 'Passnr', 'Social sec. nr', 'Tax identit. nr', 'Value added nr'];
            if (row.EmployeeInternasjonalIDType || row.EmployeeInternasjonalIDType === 0) {
                const country = row.EmployeeInternasjonalIDCountry ? ' - ' + row.EmployeeInternasjonalIDCountry : '';
                return internationalIDType[row.EmployeeInternasjonalIDType] + country;
            }

            return '';
        },
        'Sex': row => {
            if (row.EmployeeSex) {
                return row.EmployeeSex = 1 ? 'Kvinne' : 'Mann';
            }

            return 'Ikke satt';
        }
    },

    salarybalances_list: {
        'InstalmentType': (row, column) => {
            switch (row[column.Alias]) {
                case SalBalType.Advance:
                    return 'Forskudd';
                case SalBalType.Contribution:
                    return 'Bidragstrekk';
                case SalBalType.Outlay:
                    return 'Utleggstrekk';
                case SalBalType.Garnishment:
                    return 'Utleggstrekk skatt';
                case SalBalType.Union:
                    return 'Fagforeningstrekk';
                case SalBalType.Other:
                    return 'Andre';
            }
        }
    }
};
