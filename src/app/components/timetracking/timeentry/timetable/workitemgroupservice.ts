import {StatusCode} from './model';
import {toIso} from '../../../common/utils/utils';
import {Injectable} from '@angular/core';
import {UniHttp} from '../../../../../framework/core/http/http';
import {Observable} from 'rxjs';

const workitemgroupModelID = 196;

@Injectable()
export class WorkitemGroupService {

    constructor(private http: UniHttp) {

    }

    public GetTimeSheet(relationId: number, fromDate) {
        return this.get(`workrelations/${relationId}?action=timesheet&fromdate=${toIso(fromDate)}`);
    }

    public GetGroups(relationId: number, fromDate, toDate, ... statuses: Array<StatusCode> ) {
        const d1 = toIso(fromDate);
        const d2 = toIso(toDate);
        let route = this.routeBuilder('model=workitemgroup',
            '&select', 'id as ID,statuscode as StatusCode,task.id as TaskID'
            + `,isnull(task.modelid,${workitemgroupModelID}) as Modelid`,
            'join', 'workitemgroup.id eq task.entityid',
            'expand', 'items', 'filter', `workrelationid eq ${relationId}`
                + ` and items.date ge '${d1}' and items.date le '${d2}'`);
        if (statuses && statuses.length > 0) {
            route += ' AND (';
            statuses.forEach( (x, index) =>
                route += `${(index > 0 ? ' or ' : '')} statuscode eq ${x}`
            );
            route += ')';
        }
        return this.getStatistics(route).map( x => {
            if (x && x.Success) {
                return this.removeDuplicatesByFilter(x.Data, 'ID', 'Modelid', workitemgroupModelID, 'TaskID');
            }
            return x.Data;
        });
    }

    removeDuplicatesByFilter(list: Array<any>, idCol: string, pickField: string, pickValue: any, wipeField?: string) {
        if (!(list && list.length)) { return list; }
        const keys = {};
        let hasDuplicates = false;
        list.forEach( x => {
            const key = x[idCol];
            if (!keys[key]) {
                keys[key] = x;
            } else {
                if (keys[key][pickField] !== pickValue) {
                  keys[key] = x;
                }
                hasDuplicates = true;
            }
        });
        if (hasDuplicates) {
          list.length = 0;
          for (let prop in keys) {
            if (prop && keys[prop]) {
              list.push(keys[prop]);
            }
          }
        }
        if (wipeField) {
          list.forEach( x => {
            if (x && x[pickField] !== pickValue ) {
              x[wipeField] = undefined;
            }
          });
        }
        return list;
    }

    public GetApprovers(groupId: number): Observable<Array<{ name: string, email: string, statuscode: number }>> {
        const query = 'model=workitemgroup'
            + '&select=user.displayname as name,user.email as email,approval.statuscode as statuscode'
            + '&filter=task.modelid eq 196 and id eq ' + groupId
            + '&join=workitemgroup.id eq task.entityid and task.id eq approval.taskid and approval.userid eq user.id';
        return this.getStatistics(query).map( x => x.Data );
    }

    public Approve(groupId: number) {
        return this.POST(
            this.routeBuilder('workitemgroups/' + groupId, 'action', 'Approve')
        );
    }

    public Reject(groupId: number) {
        return this.POST(
            this.routeBuilder('workitemgroups/' + groupId, 'action', 'Reject')
        );
    }

    public Delete(groupId: number) {
        return this.deleteByID(groupId, 'workitemgroups');
    }

    public CreateGroup(relationId: number, fromDate, toDate) {
        const d1 = toIso(fromDate);
        const d2 = toIso(toDate);
        const route = this.routeBuilder('workitemgroups',
            'action', 'create-from-items', 'workrelationid', relationId, 'fromdate', d1, 'todate', d2);
        return this.POST(route);
    }

    public AssignGroup(groupId: number) {
        return this.POST(
            this.routeBuilder('workitemgroups/' + groupId, 'action', 'Assign'));
    }

    // HELPERS (simpliyfiers?):

    private routeBuilder(route: string, ... argPairs: any[] ) {
        let result = route;
        for (let i = 0; i < argPairs.length; i += 2 ) {
            result += ( argPairs[i].substr(0, 1) === '&' ? '' : i > 0 ? '&' : '?' )
            + argPairs[i] + '=' + argPairs[i + 1];
        }
        return result;
    }

    public deleteByID(id: any, baseRoute: string): Observable<any> {
        return this.http.asDELETE().usingBusinessDomain().withEndPoint(baseRoute + '/' + id).send(undefined);
    }

    public getByID<T>(id: number, baseRoute: string, expand?: string): Observable<T> {
        return this.GET(baseRoute + '/' + id, { expand: expand});
    }

    public get<T>(route: string, params?: any): Observable<T> {
        return this.GET(route, params);
    }

    private GET(route: string, params?: any ): Observable<any> {
        return this.http.asGET().usingBusinessDomain()
        .withEndPoint(route).send(params)
        .map(response => response.body);
    }

    private POST(route: string, params?: any, body?: any ): Observable<any> {
        if (body) {
            return this.http.asPOST().usingBusinessDomain().withBody(body)
            .withEndPoint(route).send(params)
            .map(response => response.body);
        } else {
            return this.http.asPOST().usingBusinessDomain()
            .withEndPoint(route).send(params)
            .map(response => response.body);
        }
    }

    public getStatistics(query: string): Observable<any> {
        return this.http.asGET().usingStatisticsDomain()
        .withEndPoint('?' + query).send()
        .map(response => response.body);

    }

}
