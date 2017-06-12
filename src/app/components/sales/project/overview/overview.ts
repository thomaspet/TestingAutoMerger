import { Component } from '@angular/core';

@Component({
    selector: 'project-overview',
    templateUrl: './overview.html'
}) 

export class ProjectOverview {

    constructor() {
        console.log('Hello from overview');
    }

}