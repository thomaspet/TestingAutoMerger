import {Injectable} from '@angular/core';

import {Observable, forkJoin, of as observableOf} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {UniHttp} from '@uni-framework/core/http/http';
import {BizHttp} from '@uni-framework/core/http/BizHttp';
import {UserRole} from '@uni-entities';

@Injectable()
export class UserRoleService extends BizHttp<UserRole> {
    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = UserRole.RelativeUrl;
        this.entityType = UserRole.EntityType;
        this.defaultExpand = ['SharedRole'];
    }

    getRolesByUserID(id: number): Observable<UserRole[]> {
        return super.GetAll('filter=UserID eq ' + id);
    }

    bulkUpdate(addRoles: Partial<UserRole>[], removeRoles: Partial<UserRole>[]) {
        super.invalidateCache();

        let addRequest = observableOf(true);
        if (addRoles && addRoles.length) {
            addRequest = this.http.asPOST()
                .usingBusinessDomain()
                .withEndPoint('userroles?bulk-insert-roles')
                .withBody(addRoles)
                .send()
                .map(res => res.json());
        }

        const deleteRequest = removeRoles && removeRoles.length
            ? forkJoin(...removeRoles.map(userRole => super.Remove(userRole.ID)))
            : observableOf(true);

        // Run add-request first, in case one of the deletes fail and cancel the forkJoin.
        // Ideally we'd update everything in one request, but the api currently
        // does not support this
        return addRequest.pipe(switchMap(() => deleteRequest));
    }
}
