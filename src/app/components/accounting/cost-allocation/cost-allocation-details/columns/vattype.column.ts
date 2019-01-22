import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { vatTypeGroupConfig } from '@app/components/accounting/cost-allocation/cost-allocation-details/cost-allocation-items-table.helpers';
import { VatTypeService } from '@app/services/accounting/vatTypeService';
import { CompanySettings } from '@app/unientities';

export default (vatTypeService: VatTypeService, companySettings: CompanySettings) => {
    let vattypes = [];
    vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true').subscribe(result => {
        vattypes = result;
    });
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
