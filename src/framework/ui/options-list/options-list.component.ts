import {Component, ContentChild, EventEmitter, Input, Output, TemplateRef} from '@angular/core';

@Component({
    selector: 'uni-options-list-component',
    template: `
        <ng-content></ng-content>
        <ng-container *ngFor="let option of options">
            <span (click)="onClick(option)">
                <ng-container *ngTemplateOutlet="optionTemplate;context:{item:option}"></ng-container>
            </span>
        </ng-container>
    `
})
export class UniOptionsListComponent {
    @Input() options: any[];
    @Input() selectedOption: any;
    @Output() selectOption = new EventEmitter();
    @ContentChild('optionTemplate')

    private optionTemplate: TemplateRef<any>;

    onClick(option) {
        this.selectOption.emit(option);
    }
}
