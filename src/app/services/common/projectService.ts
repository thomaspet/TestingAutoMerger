import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Project} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {BehaviorSubject} from 'rxjs';
import {ReplaySubject} from 'rxjs';
import {IToolbarConfig} from '../../components/common/toolbar/toolbar';
import {IUniSaveAction} from '../../../framework/save/save';
import {URLSearchParams} from '@angular/http';

@Injectable()
export class ProjectService extends BizHttp<Project> {

    public currentProject: BehaviorSubject<Project> = new BehaviorSubject(null);
    public toolbarConfig: ReplaySubject<IToolbarConfig> = new ReplaySubject(null);
    public saveActions: ReplaySubject<Array<IUniSaveAction>> = new ReplaySubject(null);
    public allProjects: Project[];
    public isDirty: boolean;

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Project.RelativeUrl;
        this.entityType = Project.EntityType;
        this.DefaultOrderBy = null;
    }

    // tslint:disable-next-line:member-ordering
    public statusTypes: Array<any> = [
        { Code: 42201, Text: 'Kladd', isPrimary: true},
        { Code: 42202, Text: 'Tilbudsfase', isPrimary: false },
        { Code: 42203, Text: 'Pågår', isPrimary: true },
        { Code: 42204, Text: 'Fullført', isPrimary: true },
        { Code: 42205, Text: 'Arkivert', isPrimary: false },
    ];

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

    public FindProjects<T>(params: URLSearchParams, baseFilter?: string) {
        // use default orderby for service if no orderby is specified
        if (!params.get('orderby') && this.DefaultOrderBy !== null) {
            params.set('orderby', this.DefaultOrderBy);
        }

        // use default expands for service if no expand is specified
        if (!params.get('expand') && this.defaultExpand) {
            params.set('expand', this.defaultExpand.join());
        }

        // Apply basefilter?
        var userFilter = params.get('filter');
        if (baseFilter) {
            params.set('filter', userFilter ? userFilter + ' and ( ' + baseFilter + ' )' : baseFilter);
        }

        if (userFilter === '' && (!baseFilter)) {
            params.delete('filter');
        }

        var result = this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(this.relativeURL)
            .send({}, <any>params);

        // Restore user-defined-filter
        if (baseFilter) {
            params.set('filter', userFilter);
        }

        return result;
    }
}
