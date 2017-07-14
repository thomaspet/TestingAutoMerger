import { Component, ViewChild } from '@angular/core';
import { Project } from '../../../../unientities';
import {
    ProjectService,
    ErrorService
} from '../../../../services/services';

@Component({
    selector: 'project-document',
    templateUrl: './document.html'
})

export class ProjectDocument {
    private project: Project;

    constructor(private projectService: ProjectService) {
    }

    public ngOnInit() {
        this.projectService.currentProject.subscribe(
            (project) => {
                this.project = project;
            }
        );
    }
}
