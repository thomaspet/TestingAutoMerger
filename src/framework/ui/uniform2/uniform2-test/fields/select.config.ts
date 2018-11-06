export const selectConfig = {
    Hidden: false,
    Placeholder: 'write a some description',
    Label: 'Description',
    FieldType: 'select',
    Property: 'data.gender',
    UpdateOn: 'blur',
    Required: true,
    Tooltip: {
        Type: 'info',
        Text: 'select your gender'
    },
    Options: {
        source: [
            { id: 1, name: 'Kvinne' },
            { id: 2, name: 'Mann' }
        ],
        template: (obj) => obj ? `${obj.id} - ${obj.name}` : '',
        valueProperty: 'id',
        displayProperty: 'name'
    }
};
