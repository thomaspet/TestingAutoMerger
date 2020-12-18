import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'uni-custom-list',
    templateUrl: './custom-list.component.html',
    styleUrls: ['./custom-list.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class UniCustomListComponent {}
