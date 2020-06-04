import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { RegulativeGroup } from '@uni-entities';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from '@app/services/common/errorService';

@Injectable()
export class RegulativeGroupService extends BizHttp<RegulativeGroup> {
    constructor(
        protected http: UniHttp,
        private errorService: ErrorService,
    ) {
        super(http);
        this.relativeURL = RegulativeGroup.RelativeUrl;
        this.entityType = RegulativeGroup.EntityType;
    }

    getAll(query: string, expands: string[]) {
        const forbiddenCode = 403;
        return super.GetAll(query, expands)
            .pipe(
                catchError((err: HttpErrorResponse, obs) => (err.status === forbiddenCode)
                    ? of(null)
                    : this.errorService.handleRxCatch(err, obs)
                ),
                map(regulatives => regulatives || [])
            );
    }
}
