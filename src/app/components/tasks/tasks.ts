import {Component} from '@angular/core';
import {Task} from '../../unientities';

@Component({
    selector: 'uni-tasks',
    templateUrl: './tasks.html'
})
export class UniTasks {
    private selectedTask: Task;

    public onTaskSelected(task) {
        this.selectedTask = task;
    }

}
