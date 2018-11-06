import { Validators } from '@angular/forms';

export const hyperlinkConfig = {
    Hidden: false,
    Placeholder: 'write a value',
    Label: 'My site',
    Description: 'link to my site',
    FieldType: 'hyperlink',
    Target: '_blank',
    Property: 'data.site',
    Validators: [Validators.required],
    UpdateOn: 'blur',
    Required: true,
    Tooltip: {
        Type: 'info',
        Text: 'This is a text field'
    }
};
