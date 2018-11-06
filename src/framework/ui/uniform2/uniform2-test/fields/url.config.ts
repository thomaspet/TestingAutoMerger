import { Validators } from '@angular/forms';

export const urlConfig = {
    Hidden: false,
    Placeholder: 'write a value',
    Label: 'Personal site',
    FieldType: 'url',
    Property: 'data.personal_site',
    Validators: [Validators.required],
    UpdateOn: 'blur',
    Required: true,
    Tooltip: {
        Type: 'info',
        Text: 'This is a url field'
    }
};
