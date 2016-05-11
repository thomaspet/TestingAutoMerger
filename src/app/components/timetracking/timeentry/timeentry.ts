import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';

export var view = new View('timeentry', 'Timeføring', 'TimeEntry');

@Component({
    selector: view.name,
    template: `<h3>{{view.label}}</h3>
    <a href='#/timetracking/worker'>Timefører</a>
    `
})
export class TimeEntry {    
    public view = view;

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: view.label, url: view.route });
    }
}