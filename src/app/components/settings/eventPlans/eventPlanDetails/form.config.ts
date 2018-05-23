import { FieldType } from '@uni-framework/ui/uniform';
export default function createFormConfig(models, jobs) {
    return [
        {
            EntityType: 'Eventplan',
            Property: 'Name',
            FieldType: FieldType.TEXT,
            Label: 'Navn',
            Section: 0,
            FieldSet: 1
        },
        {
            EntityType: 'Eventplan',
            Property: 'OperationFilter',
            FieldType: FieldType.UNI_MULTISELECT,
            Label: 'Operation Filter',
            Section: 0,
            FieldSet: 2,
            Options: {
                showAllButton: false,
                showCheckbox: true,
                source: [
                    {
                        ID: 'C',
                        Name: 'Create'
                    },
                    {
                        ID: 'U',
                        Name: 'Update'
                    },
                    {
                        ID: 'D',
                        Name: 'Delete'
                    },
                ],
                bindValue: 'ID',
                bindLabel: 'Name',
                OptionsToModel: (options, config, items) => {
                    let result = '';
                    const hasC = options.find(x => x[config.Options.bindValue] === 'C');
                    const hasU = options.find(x => x[config.Options.bindValue] === 'U');
                    const hasD = options.find(x => x[config.Options.bindValue] === 'D');
                    if (hasC) {
                        result += 'C';
                    }
                    if (hasU) {
                        result += 'U';
                    }
                    if (hasD) {
                        result += 'D';
                    }
                    return result;
                },
                ModelToOptions: (model, config, items) => {
                    if (!model) {
                        return [];
                    }
                    const hasC = model.indexOf('C') > -1;
                    const hasU = model.indexOf('U') > -1;
                    const hasD = model.indexOf('D') > -1;
                    return items.filter(item => {
                        if (item.ID === 'C') {
                            return hasC ? true : false;
                        }
                        if (item.ID === 'U') {
                            return hasU ? true : false;
                        }
                        if (item.ID === 'D') {
                            return hasD ? true : false;
                        }
                    });
                },
            }
        },
        {
            Placeholder: '',
            EntityType: 'Eventplan',
            Property: 'ModelFilter',
            FieldType: FieldType.UNI_MULTISELECT,
            Label: 'Model Filter',
            Section: 0,
            FieldSet: 1,
            Options: {
                source: models,
                bindValue: 'ID',
                bindLabel: 'Name',
                showAllButton: true,
                OptionsToModel: (selectedItems, config, items) => {
                    const labels = selectedItems.map(opt => opt[config.Options.bindLabel]);
                    if (labels.length === 0) {
                        return '*';
                    }
                    return labels.join(',');
                },
                ModelToOptions: (model, config, items) => {
                    if (!model) {
                        return [];
                    }
                    if (model === '*') {
                        return [];
                    }
                    const labels = model.split(',');
                    return labels.map(x => items.find(it => it[config.Options.bindLabel] === x));
                },
            }
        },
        {
            EntityType: 'Eventplan',
            Property: 'PlanType',
            FieldType: FieldType.DROPDOWN,
            Label: 'Type',
            Section: 0,
            FieldSet: 2,
            Options: {
                valueProperty: 'ID',
                displayProperty: 'Name',
                addEmptyValue: true,
                source: [
                    {
                        ID: 0,
                        Name: 'Webhook'
                    },
                    {
                        ID: 1,
                        Name: 'Custom'
                    },
                    {
                        ID: 2,
                        Name: 'Other'
                    }
                ]
            }
        },
        {
            EntityType: 'Eventplan',
            Property: 'Active',
            FieldType: FieldType.CHECKBOX,
            Label: 'Aktiv',
            Section: 0,
            FieldSet: 1
        },
        {
            Placeholder: '',
            EntityType: 'Eventplan',
            Property: 'JobNames',
            FieldType: FieldType.UNI_MULTISELECT,
            Label: 'Job Names',
            Section: 0,
            FieldSet: 2,
            Options: {
                source: jobs,
                bindValue: 'ID',
                bindLabel: 'Name',
                showAllButton: false,
                OptionsToModel: (selectedItems, config, items) => {
                    const labels = selectedItems.map(opt => opt[config.Options.bindLabel]);
                    if (labels.length === 0) {
                        return '*';
                    }
                    return labels.join(',');
                },
                ModelToOptions: (model, config, items) => {
                    if (!model) {
                        return [];
                    }
                    if (model === '*') {
                        return [];
                    }
                    const labels = model.split(',');
                    return labels.map(x => items.find(it => it[config.Options.bindLabel] === x));
                },
            }
        },
        {
            EntityType: 'Eventplan',
            Property: 'Cargo',
            FieldType: FieldType.TEXT,
            Label: 'Cargo',
            Section: 0,
            Hidden: true
        },
    ];
}
