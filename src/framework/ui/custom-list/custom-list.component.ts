import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
    selector: 'uni-custom-list',
    templateUrl: './custom-list.component.html',
    styleUrls: ['./custom-list.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniCustomListComponent {}
