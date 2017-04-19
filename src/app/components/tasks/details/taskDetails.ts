// angular
import {Component, OnInit, Input, OnChanges, SimpleChange} from '@angular/core';
import {Task, TaskStatus, TaskType} from '../../../unientities';

@Component({
    selector: 'task-details',
    templateUrl: './taskDetails.html'
})
export class TaskDetails {
    @Input() public selectedTask: any;
    
    constructor() {
    }
}