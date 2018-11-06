export const radioGroupConfig = {
    Label: 'Favourite Language',
    Options: {
        labelProperty: 'Text',
        valueProperty: 'ID',
        source: [
            {ID: 1, Text: 'javascript'},
            {ID: 2, Text: 'typescript'},
            {ID: 3, Text: 'coffescript'}
        ],
    },
    FieldType: 'radio',
    Property: 'data.favouriteLanguage',
    UpdateOn: 'change'
};
