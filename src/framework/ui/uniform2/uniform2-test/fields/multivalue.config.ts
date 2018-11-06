import { Observable } from 'rxjs/observable';

export const multivalueConfig = {
    Section: 1,
    Sectionheader: 'Text section',
    Legend: 'in the fieldset',
    Column: 1,
    FieldSet: 1,
    Placeholder: 'select some text',
    Label: 'Number of text',
    Options: {
        allowAddValues: false,
        templateFn: (row) => row && row.Text || '',
        source: [
            {ID: 1, Text: 'text1'},
            {ID: 2, Text: 'text2'},
            {ID: 3, Text: 'text3'}
        ],
    },
    AsyncValidators: [(c) => {
        return Observable.fromPromise(new Promise(resolve => {
            if (c.value === null) {
                setTimeout(() => {
                    resolve({
                        customValidator: {
                            message: 'field should should be required :)',
                            warning: true,
                        }
                    });
                }, 1000);
            } else {
                resolve(null);
            }
        }));
    }],
    // Required: true,
    FieldType: 'multivalue',
    Property: 'text.very.deeper',
    UpdateOn: 'change'
};
