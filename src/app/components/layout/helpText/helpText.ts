import {Component, ContentChild, Input, ChangeDetectionStrategy, TemplateRef} from '@angular/core';

@Component({
    selector: 'uni-helptext',
    template: `
        <button class="helpTextToggle" type="button" tabindex="-1">
            Help
        </button>

        <aside class="helpText">
            <section *ngIf="text">{{text}}</section>
            <ng-template *ngTemplateOutlet="itemTemplate"></ng-template>
        </aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniHelpText {
    /*
        ContentChild allows us to pass templates directly to the component
        Example:

        <uni-helptext>
            <ng-template>
                <h1>I can write html here!</h1>
            </ng-template>
        </uni-helptext>

    */
    @ContentChild(TemplateRef)
    public itemTemplate: TemplateRef<any>;

    // This is for use-cases where we just want plain text in the tooltip
    @Input() public text: string;
}
