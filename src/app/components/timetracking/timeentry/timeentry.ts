import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';

export var view = new View('timeentry', 'Registrere timer', 'TimeEntry');

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/timeentry/timeentry.html', 
})
export class TimeEntry {    
    public view = view;

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: view.label, url: view.route });
    }
}