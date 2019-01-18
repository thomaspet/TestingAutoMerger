import { Injectable } from '@angular/core';
import { BizHttp } from '@uni-framework/core/http/BizHttp';
import { Eventplan, EventSubscriber } from '@app/unientities';
import { UniHttp } from '@uni-framework/core/http/http';
import { ErrorService } from '@app/services/common/errorService';
import { GuidService } from '@app/services/common/guidService';
import {HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class EventplanService extends BizHttp<Eventplan> {
    constructor(
        public http: UniHttp,
        public guidService: GuidService,
        public errorService: ErrorService
    ) {
        super(http);
        this.relativeURL = Eventplan.RelativeUrl;
        this.entityType = Eventplan.EntityType;
        this.disableCache();
    }

    getData() {
        return this.GetAll('', ['Subscribers']);
    }

    save(eventplan: Eventplan): Promise<any> {
        return new Promise( (resolve, reject) => {
            const ht = eventplan.ID ? this.http.asPUT() : this.http.asPOST();
            const route = eventplan.ID ? 'eventplans/' + eventplan.ID : 'eventplans';

            const subscribers = eventplan.Subscribers && eventplan.Subscribers
                .filter(row => !row['_isEmpty'])
                .map(s => {
                    if (!s.ID) {
                        s._createguid = this.guidService.guid();
                    }
                    if (!s.Active) {
                        s.Active = false;
                    }
                    return s;
                });
            eventplan.Subscribers = subscribers;

            ht.usingBusinessDomain()
                .withBody(eventplan)
                .withEndPoint(route)
                .send().map(response => response.json())
                .subscribe(
                    result => resolve(<Eventplan>result),
                    error => {
                        resolve(false);
                        this.errorService.handle(error);
                    }
                );
        });
    }

    delete(eventplan: Eventplan): Observable<any> {
        return this.http.usingBusinessDomain()
            .asDELETE()
            .withEndPoint(`eventplans/${eventplan.ID}`)
            .send();
    }
}
