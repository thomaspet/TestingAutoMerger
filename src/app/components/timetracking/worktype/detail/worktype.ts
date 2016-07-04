import {Component} from "@angular/core";
import {TabService} from '../../../layout/navbar/tabstrip/tabService';
import {View} from '../../../../models/view/view';
import {WorkerService} from '../../../../services/timetracking/workerservice';
import {WorkTypeSystemTypePipe} from '../../utils/pipes';

export var view = new View('worktype', 'Timeart', 'WorktypeDetailview', true, 'worktype/detail');

@Component({
    selector: view.name + 'detail',
    templateUrl: 'app/components/timetracking/worktype/detail/worktype.html',
    pipes: [WorkTypeSystemTypePipe],
    providers: [WorkerService]
})
export class WorktypeDetailview {

    constructor(private workerService: WorkerService) {
    }
}  