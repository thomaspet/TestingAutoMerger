import { FieldType } from '@uni-framework/ui/uniform';
import { SellerService } from '@app/services/sales/sellerService';
import { map } from 'rxjs/operators';

export default (type: string, sellerService: SellerService) => {
    return sellerService.GetAll(null).pipe(
        map((sellers) => [
            {
                Property: 'InvoiceDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Fakturadato'
            },
            {
                Property: 'DueDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Forfallsdato'
            },
            {
                Property: 'MinAmount',
                FieldType: FieldType.NUMERIC,
                Label: 'Minimumsbeløp'
            },
            {
                Property: 'Operation',
                FieldType: FieldType.DROPDOWN,
                Label: 'Antall faktura',
                Options: {
                    source: type === 'order' ? [
                        {ID: 0, Name: 'En faktura per kunde'},
                        {ID: 1, Name: 'En faktura per ordre'},
                        {ID: 2, Name: 'En faktura per prosjekt'},
                    ] : [
                        {ID: 0, Name: 'En faktura per kunde'},
                        {ID: 1, Name: 'En faktura per kladd'},
                        {ID: 2, Name: 'En faktura per prosjekt'},
                    ],
                    valueProperty: 'ID',
                    displayProperty: 'Name'
                }
            },
            {
                Property: 'SellerID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Selger',
                Options: {
                    source: [{ID: 0, Name: 'Hentes fra order'}].concat(sellers),
                    valueProperty: 'ID',
                    displayProperty: 'Name'
                }
            },
            {
                Property: 'YourRef',
                FieldType: FieldType.TEXT,
                Label: 'Vår refereranse',
                Placeholder: 'Hentes fra ' + (type === 'order' ? 'ordre' : 'faktura kladd')
            },
        ])
    );
};
