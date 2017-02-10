import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {UserService} from '../services';
import {User} from '../../unientities';
import {StatisticsService} from './StatisticsService';
import {ErrorService} from './ErrorService';

@Injectable()
export class StatusService {
    private statusDictionary: {[StatusCode: number]: string};

    constructor(private statisticsService: StatisticsService, private userService: UserService, private errorService: ErrorService) {

    }

    public getStatusText(statusCode: number): string {
        if (this.statusDictionary) {
            return this.statusDictionary[statusCode];
        }

        return null;
    }

    public loadStatusCache(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.statusDictionary) {
                // get statuses from API and add it to the cache
                this.statisticsService.GetAll('model=Status&select=StatusCode,Description')
                    .subscribe(data => {
                        if (data.Data) {
                            this.statusDictionary = {};
                            data.Data.forEach(item => {
                                this.statusDictionary[item.StatusStatusCode] = item.StatusDescription;
                            });

                            resolve(true);
                        } else {
                            reject('Could not get statuses from API');
                        }
                    }, err => this.errorService.handle(err));
            }

            resolve(true);
        });
    }

    public getStatusLogEntries(entityType: string, entityID: number, toStatus: number): Observable<any> {
        return Observable.forkJoin(
            this.userService.GetAll(null),
            this.statisticsService.GetAll(
                `model=StatusLog&filter=EntityType eq '${entityType}' and EntityID eq ${entityID} and ToStatus eq ${toStatus}&select=StatusLog.CreatedAt as CreatedAt,StatusLog.CreatedBy as CreatedBy,StatusLog.FromStatus as FromStatus,ToStatus as ToStatus,StatusLog.EntityID as StatusLogEntityID,StatusLog.EntityType as StatusLogEntityType`),
            this.loadStatusCache()
        ).map(responses => {
                let users: Array<User> = responses[0];
                let data = responses[1].Data ? responses[1].Data : [];
                data.forEach(item => {
                    item.FromStatusText = this.getStatusText(item.FromStatus);
                    let createdByUser = users.find(x => x.GlobalIdentity === item.CreatedBy);
                    item.CreatedByName = createdByUser ? createdByUser.DisplayName : '';
                });
                return data;
            });
    }
}
