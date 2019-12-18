import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { Regulative } from '@uni-entities';
import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';

@Injectable()
export class RegulativeService extends BizHttp<Regulative> {
    constructor(
        protected http: UniHttp
    ) {
        super(http);
        this.relativeURL = Regulative.RelativeUrl;
        this.entityType = Regulative.EntityType;
    }
    import(to: Regulative, fromFileID: number): Observable<Regulative> {
        return of(to)
            .pipe(
                switchMap(regulative => regulative.ID ? of(regulative) : super.Post(regulative)),
                switchMap(regulative => super.PostAction(regulative.ID, 'import', `fileID=${fromFileID}`))
            );
    }

    export(from: Regulative): Observable<Blob> {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(`regulatives/${from.ID}?action=export`)
            .send({responseType: 'blob'})
            .pipe(
                tap(res => console.log(res)),
                map(res => new Blob([res.body]))
            );
    }
}
