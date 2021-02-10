import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';

export interface IToolbarValidation {
    label: string;
    type: 'good' | 'bad' | 'warn';
    link?: string;
    tooltip?: string;
    click?: () => void;
}

@Component({
    selector: 'uni-toolbar-validation',
    templateUrl: './toolbar-validation.html',
    styleUrls: ['./toolbar-validation.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniToolbarValidation {
    @Input() public validationMessages: IToolbarValidation[];

    constructor(private cdr: ChangeDetectorRef) {}

    public getValidationIcon(validation: IToolbarValidation) {
        if (validation.type === 'good') {
            return 'check_circle';
        } else if (validation.type === 'bad') {
            return 'add_circle';
        } else {
            return 'info';
        }
    }

    onClick(item: IToolbarValidation) {
        if (item.click) {
            item.click();
        }
    }

}
