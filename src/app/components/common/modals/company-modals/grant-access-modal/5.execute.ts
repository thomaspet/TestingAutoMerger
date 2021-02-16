import {Component, Input} from '@angular/core';
import {GrantAccessData} from './grant-access-modal';

@Component({
    selector: 'execute-for-bulk-access',
    templateUrl: './5.execute.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class ExecuteForBulkAccess {
    @Input() data: GrantAccessData;

    hangfireId: number;
    hasCompletedJob: boolean;
}
