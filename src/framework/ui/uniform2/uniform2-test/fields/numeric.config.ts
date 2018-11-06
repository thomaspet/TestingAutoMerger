export const numericConfig = {
    Placeholder: 'write a value',
    Label: 'Age',
    FieldType: 'numeric',
    Property: 'data.age',
    UpdateOn: 'blur',
    Options: {
        format: 'number',
        decimalLength: 2,
        thousandSeparator: ' ',
        decimalSeparator: ','
    },
    Tooltip: {
        Type: 'info',
        Text: 'This is the age field'
    }
};
