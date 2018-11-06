import { Validators } from '@angular/forms';
export const dateConfig = {
    Placeholder: 'pick a date',
    Label: 'Birth date',
    FieldType: 'date',
    Property: 'birthdate',
    UpdateOn: 'change',
    Tooltip: {
        Type: 'info',
        Text: 'date field'
    },
    Required: true,
    Validators: [Validators.required],
    Options: {
        local: true
    }
};
