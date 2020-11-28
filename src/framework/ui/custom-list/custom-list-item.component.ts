import {ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'uni-custom-list-item',
    templateUrl: './custom-list-item.component.html',
    styleUrls: ['./custom-list-item.component.sass'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniCustomListItemComponent {
    @Input() step: any;
    @ContentChild('stepButtonTemplate') public stepButtonTemplate: TemplateRef<any>;
    @ContentChild('stepCardTemplate') public stepCardTemplate: TemplateRef<any>;
}
