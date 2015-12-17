export var InputTemplateString = `
    <input
        [ngFormControl]="config.control"
        [ngClass] = "config.classes"
        [readonly]="config.readonly"
        [disabled]="config.disabled"
    />
`;
