import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';

export var view = new View('worker', 'Arbeider', 'Worker');

@Component({
    selector: view.name,
    template: "<section class='application'><h3>{{view.label}}</h3></section>"
})
export class Worker {    
    public view = view;

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: view.label, url: view.route });
    }
}