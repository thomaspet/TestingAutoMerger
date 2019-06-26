import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ProjectService, UniQueryDefinitionService} from '@app/services/services';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'project-query-list',
    templateUrl: './querylist.html'
})
export class ProjectQueryList {
    onDestroy$ = new Subject();
    projectID: number = 0;
    reportID: number = 0;
    customerID: number = 0;

    constructor(
        private projectService: ProjectService,
        private uniQueryDefinitionService: UniQueryDefinitionService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    public ngOnInit() {
        this.uniQueryDefinitionService.getReferenceByModuleId(UniModules.Projects).subscribe((links) => {
            this.route.url.subscribe((url) => {
                if (url[0].path === 'supplierinvoices' && !this.projectService.hasSupplierInvoiceModule) {
                    this.router.navigateByUrl('/dimensions/projects/editmode');
                    return;
                }
                const link = links.find(x => x.name === url[0].path);
                if (link) {
                    this.reportID = link.id;
                }
            });
        });

        this.projectService.currentProject.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(
            (project) => {
                if (project) {
                    this.projectID = project.ID;
                    this.customerID = project.ProjectCustomerID;
                }
            }
        );
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
