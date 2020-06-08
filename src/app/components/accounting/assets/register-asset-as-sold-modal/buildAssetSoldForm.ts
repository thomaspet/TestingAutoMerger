import {FieldType} from '@uni-framework/ui/uniform';
import {of} from 'rxjs';

export const radioButtonField = [{
    Section: 0,
    FieldSet: 0,
    FieldSetColumn: 1,
    Property: '_createInvoice',
    Label: '',
    FieldType: FieldType.RADIOGROUP,
    Options: {
        source: [{value: true, text: 'Opprett faktura'}, {value: false, text: 'Ikke opprett faktura'}],
        valueProperty: 'value',
        labelProperty: 'text'
    }
}];

export const buildAssetSoldForm = (vatTypes) => {
    return [
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'SoldDate',
            Label: 'Dato',
            FieldType: FieldType.LOCAL_DATE_PICKER,
        },
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'CurrentNetFinancialValue',
            Label: 'Regnskapverdi',
            FieldType: FieldType.NUMERIC,
            Options: {
                decimalLength: 2,
                decimalSeparator: ','
            },
            ReadOnly: true
        },
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'SoldAmount',
            Label: 'Salgsbeløp (eks MVA)',
            FieldType: FieldType.NUMERIC,
            Options: {
                decimalLength: 2,
                decimalSeparator: ','
            }
        },
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'VatTypeID',
            Label: 'MVA',
            FieldType: FieldType.DROPDOWN,
            Options: {
                source: vatTypes,
                valueProperty: 'ID',
                debounceTime: 200,
                template: item => `${item.VatCode}: ${item.VatPercent}% - ${item.Name}`,
                search: (query) => {
                    return of(vatTypes.filter((vatType) => {
                        return vatType.VatCode.toLowerCase().startsWith(query)
                            || vatType.Name.toLowerCase().indexOf(query) > -1
                            || vatType.VatPercent.toString().indexOf(query) > -1;
                    }));
                }
            }
        }
    ];
};
