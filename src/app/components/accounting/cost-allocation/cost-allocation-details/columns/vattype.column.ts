import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { VatTypeService } from '@app/services/accounting/vatTypeService';
import { CompanySettings, VatType } from '@app/unientities';
import { IGroupConfig } from '@uni-framework/ui/unitable/controls';

const vatTypeGroupConfig: IGroupConfig = {
    groupKey: 'VatCodeGroupingValue',
    visibleValueKey: 'Visible',
    groups: [
        {
            key: 1,
            header: 'Kjøp/kostnader.'
        },
        {
            key: 2,
            header: 'Kjøp/Importfaktura'
        },
        {
            key: 3,
            header: 'Import/Mva-beregning'
        },
        {
            key: 4,
            header: 'Salg/inntekter'
        }
        ,
        {
            key: 5,
            header: 'Salg uten mva.'
        }
        ,
        {
            key: 6,
            header: 'Kjøpskoder, spesielle'
        }
        ,
        {
            key: 7,
            header: 'Egendefinerte koder'
        }

    ]
};

export const vattypeColumn = (vattypes: VatType[], vatTypeService: VatTypeService, companySettings: CompanySettings) => {
    return new UniTableColumn('VatType', 'MVA', UniTableColumnType.Lookup)
        .setDisplayField('VatType.VatCode')
        .setWidth('8%')
        .setSkipOnEnterKeyNavigation(true)
        .setTemplate((rowModel) => {
            if (rowModel.VatType) {
                const vatType = rowModel.VatType;
                const vatTypePercent = vattypes.find(item => item.ID === vatType.ID);
                return `${vatType.VatCode}: ${vatTypePercent.VatPercent}%`;
            }
            return '';
        })
        .setOptions({
            itemTemplate: (item) => {
                return `${item.VatCode}: ${item.Name} - ${item.VatPercent}%`;
            },
            lookupFunction: (searchValue) => {
                return vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true')
                    .map(result => result.filter(
                        (vattype) => vattype.VatCode === searchValue
                        || vattype.VatPercent === searchValue
                        || vattype.Name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0
                        || searchValue === `${vattype.VatCode}: ${vattype.Name} - ${vattype.VatPercent}%`
                        || searchValue === `${vattype.VatCode}: ${vattype.VatPercent}%`
                    ));
            },
            groupConfig: vatTypeGroupConfig
        })
        .setEditable(x => companySettings.TaxMandatoryType === 3);
};
