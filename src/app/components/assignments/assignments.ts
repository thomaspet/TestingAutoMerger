import {Component} from '@angular/core';
import {IUniTab} from '@app/components/layout/uni-tabs';

@Component({
    selector: 'uni-assignments',
    templateUrl: './assignments.html'
})
export class UniAssignments {
    public tabs: IUniTab[] = [
        {name: 'Godkjenninger', path: 'approvals'},
        {name: 'Oppgaver', path: 'tasks'}
    ];
}
