import {FieldType} from '@uni-framework/ui/uniform';

const config = [
    {
        Property: 'Password',
        Label: 'Passord',
        FieldType: FieldType.PASSWORD
    },
    {
        Property: 'RepeatedPassword',
        Label: 'Bekreft Passord',
        FieldType: FieldType.PASSWORD
    },
    {
        Property: 'Phone',
        Label: 'Telefonnummer',
        FieldType: FieldType.TEXT
    },
    {
        Property: 'IsAdmin',
        Label: 'Administrator',
        FieldType: FieldType.CHECKBOX
    },
];

export default config;
