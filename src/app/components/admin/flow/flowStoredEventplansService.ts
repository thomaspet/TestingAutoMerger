import {Injectable} from '@angular/core';
import {ReplaySubject, Observable} from 'rxjs';
import {Eventplan} from '@app/unientities';
import {EventplanService} from '@app/services/common/eventplan.service';
import {ErrorService} from '@app/services/common/errorService';
import {AuthService} from '@app/authService';

@Injectable()
export class FlowStoredEventplansService {
    storedEventplans: ReplaySubject<Eventplan[]> = new ReplaySubject(1);

    constructor(
        private eventplanService: EventplanService,
        private errorService: ErrorService,
        authService: AuthService,
    ) {
        this.updateCache();
        authService.authentication$.subscribe(() => this.updateCache());
    }

    private updateCache() {
        this.eventplanService.GetAll(null, ['Subscribers'])
            .subscribe(
                eventplans => this.storedEventplans.next(eventplans),
                err => this.errorService.handle(err),
            );

    }

    getEventplans(): Observable<Eventplan[]> {
        return this.storedEventplans;
    }

    setEventplans(storedEventplans: Eventplan[]) {
        this.storedEventplans.next(storedEventplans);
    }

    addEventplan(eventplan: Eventplan) {
        this.getEventplans().take(1).subscribe(eventplans => {
            eventplans.push(eventplan);
            this.storedEventplans.next(eventplans);
        });
    }
}
