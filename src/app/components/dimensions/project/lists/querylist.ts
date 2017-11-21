import {Component} from '@angular/core';
import {UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ActivatedRoute} from '@angular/router';
import {ISummaryConfig} from '../../../common/summary/summary';
import {
    ProjectService,
    ErrorService,
    UniQueryDefinitionService
} from '../../../../services/services';

@Component({
    selector: 'project-query-list',
    templateUrl: './querylist.html'
})

export class ProjectQueryList {
    private projectID: number = 0;
    private reportID: number = 0;
    private customerID: number = 0;
    public summary: ISummaryConfig[] = [];

    constructor(private projectService: ProjectService,
                private errorService: ErrorService,
                private uniQueryDefinitionService: UniQueryDefinitionService,
                private route: ActivatedRoute) {
    }

    public ngOnInit() {
        this.uniQueryDefinitionService.getReferenceByModuleId(UniModules.Projects).subscribe((links) => {
            this.route.url.subscribe((url) => {
                let link = links.find(x => x.name === url[0].path);
                if (link) {
                    this.reportID = link.id;
                }
            });
        });

        this.projectService.currentProject.subscribe(
            (project) => {
                if (project) {
                    this.projectID = project.ID;
                    this.customerID = project.ProjectCustomerID;
                }
            }
        );

        // this.setSums(); // TODO: need to get the sums for each status from Statistics
    }

    public setSums() {
        this.summary = [{
            value: '1000',
            title: 'Kladd'
        }];
    }
}
