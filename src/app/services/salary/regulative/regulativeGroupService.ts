import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { RegulativeGroup } from '@uni-entities';
import { Injectable } from '@angular/core';
import { ElsaPurchaseService } from '@app/services/elsa/elsaPurchasesService';
import { switchMap, map } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { UserService } from '@app/services/common/userService';

@Injectable()
export class RegulativeGroupService extends BizHttp<RegulativeGroup> {
    constructor(
        protected http: UniHttp,
        private elsaPurchaseService: ElsaPurchaseService,
        private userService: UserService,
    ) {
        super(http);
        this.relativeURL = RegulativeGroup.RelativeUrl;
        this.entityType = RegulativeGroup.EntityType;
    }

    getAll(query: string, expands: string[]) {
        return forkJoin(
                this.userService.getCurrentUser(),
                this.elsaPurchaseService.getAll('ProductName=LONN_UTVIDET')
            )
            .pipe(
                map(([user, purchasesOnUser]) => purchasesOnUser.find(p => p.GlobalIdentity === user.GlobalIdentity)),
                switchMap(p => !p
                    ? of([])
                    : super.GetAll(query, expands)
                )
            );
    }
}
