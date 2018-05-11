import {Component} from '@angular/core';
import {IUniTab} from '../layout/uniTabs/uniTabs';

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
