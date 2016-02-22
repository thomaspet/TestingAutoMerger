export var InputTemplateString = `
    <input *ngIf="config.control"
        [ngFormControl]="config.control"
        [readonly]="config.readonly"
        [disabled]="config.disabled"
    />
`;
