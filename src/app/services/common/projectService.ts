import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Project} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class ProjectService extends BizHttp<Project> {

    public currentProject: BehaviorSubject<Project> = new BehaviorSubject(null);
    public allProjects: Project[];
    public isDirty: boolean;

    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);

        this.relativeURL = Project.RelativeUrl;
        this.entityType = Project.EntityType;
        this.DefaultOrderBy = null;
    }

    public setNew() {
        this.currentProject.next(new Project);
    }

    public getProjectHours(id: number) {
        const route = '?model=workitem'
            + '&select=sum(minutes),year(date) as year,'
            + 'month(date) as mnd,Project.Name'
            + '&filter=(dimensions.projectid eq ' + id + ')'
            + '&join=workitem.worktypeid eq worktype.id and workitem.dimensionsid eq '
            + 'dimensions.id and dimensions.projectid eq project.id'
            + '&top=orderby=year,mnd';
        return this.http.asGET()
            .usingStatisticsDomain()
            .withEndPoint(route)
            .send()
            .map(response => response.json());
    };

    public getAllProjectHours(filter: string) {
        const route = 'workitems?expand=WorkType,Dimensions,Dimensions.Project,WorkRelation.Worker.Info,'
            + 'Dimensions.Department,CustomerOrder,Customer,Customer.Info'
            + '&filter=' + filter
            + '&orderBy=StartTime&hateoas=false';
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint(route)
            .send();
    }
}
