import {Component} from '@angular/core';
import {IUniTabsRoute} from '../layout/uniTabs/uniTabs';
import {StatisticsService, UserService, ErrorService} from '../../services/services';
import {User, ApprovalStatus, TaskStatus, TaskType} from '../../unientities';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'uni-assignments',
    templateUrl: './assignments.html'
})
export class UniAssignments {
    private tabs: IUniTabsRoute[];
    private taskCount: number;
    private approvalCount: number;

    constructor(
        statisticsService: StatisticsService,
        userService: UserService,
        errorService: ErrorService
    ) {
        this.tabs = [
            {name: 'Godkjenninger', path: 'approvals'},
            {name: 'Oppgaver', path: 'tasks'}
        ];

        userService.getCurrentUser().subscribe((user: User) => {
            const tasksQuery = 'model=Task&select=count(ID) as count'
                + '&filter=UserID eq ' + user.ID
                + ' and StatusCode ne ' + TaskStatus.Complete
                + ' and Type eq ' + TaskType.Task;

            const approvalsQuery = 'model=Approval&select=count(ID) as count'
                + '&filter=UserID eq ' + user.ID
                + ' and StatusCode eq ' + ApprovalStatus.Active;

            Observable.forkJoin(
                statisticsService.GetAll(tasksQuery),
                statisticsService.GetAll(approvalsQuery)
            ).subscribe(
                res => {
                    try {
                        this.taskCount = res[0].Data[0].count;
                        this.approvalCount = res[1].Data[0].count;
                    } catch (e) {
                        console.log(e);
                    }
                },
                err => errorService.handle(err)
            );
        });
    }
}
