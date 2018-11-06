import { UniSearchEmployeeConfig } from '@app/services/common/uniSearchConfig/uniSearchEmployeeConfig';
export function uniSearchConfig(generator: UniSearchEmployeeConfig) {
    return {
        Options: {
            uniSearchConfig: generator.generate(),
            valueProperty: 'ID'
        },
        EntityType: 'Employee',
        Property: 'EmployeeSearchResultID',
        FieldType: 'unisearch',
        Label: 'Navn'
    };
}
