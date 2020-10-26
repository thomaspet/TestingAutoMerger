import { Injectable } from '@angular/core';
import { BizHttp } from '@uni-framework/core/http/BizHttp';
import { Eventplan } from '@app/unientities';
import { UniHttp } from '@uni-framework/core/http/http';
import { ErrorService } from '@app/services/common/errorService';
import { GuidService } from '@app/services/common/guidService';
import { Observable, BehaviorSubject } from 'rxjs';
import { IUniSaveAction } from '@uni-framework/save/save';

@Injectable()
export class EventplanService extends BizHttp<Eventplan> {
    saveActions$: BehaviorSubject<IUniSaveAction[]> = new BehaviorSubject([]);

    constructor(
        public http: UniHttp,
        public guidService: GuidService,
        public errorService: ErrorService
    ) {
        super(http);
        this.relativeURL = Eventplan.RelativeUrl;
        this.entityType = Eventplan.EntityType;
        this.defaultExpand = ['Subscribers', 'ExpressionFilters'];
    }

    save(eventplan: Eventplan): Observable<Eventplan> {
        const request = eventplan.ID > 0
            ? this.Put(eventplan.ID, eventplan)
            : this.Post(eventplan);

        return request;
    }
}
