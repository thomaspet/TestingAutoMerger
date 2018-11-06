import { Validators } from '@angular/forms';

export const textConfig = {
    Hidden: false,
    Placeholder: 'write a value',
    Label: 'Name',
    FieldType: 'text',
    Property: 'name.firstname',
    Validators: [Validators.required],
    UpdateOn: 'blur',
    Required: true,
    Tooltip: {
        Type: 'info',
        Text: 'This is a text field'
    }
};
