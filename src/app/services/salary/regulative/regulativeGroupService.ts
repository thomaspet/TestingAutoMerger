import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { RegulativeGroup } from '@uni-entities';
import { Injectable } from '@angular/core';
import { ElsaPurchaseService } from '@app/services/elsa/elsaPurchasesService';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class RegulativeGroupService extends BizHttp<RegulativeGroup> {
    constructor(
        protected http: UniHttp,
        private elsaPurchaseService: ElsaPurchaseService,
    ) {
        super(http);
        this.relativeURL = RegulativeGroup.RelativeUrl;
        this.entityType = RegulativeGroup.EntityType;
    }

    getAll(query: string, expands: string[]) {
        return this.elsaPurchaseService
            .getPurchaseByProductName('LONN_UTVIDET')
            .pipe(
                switchMap(p => !p
                    ? of([])
                    : super.GetAll(query, expands)
                )
            );
    }
}
