import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {StatisticsService} from './statisticsService';
import {ErrorService} from './ErrorService';

@Injectable()
export class StatusService {
    private statusDictionary: {[StatusCode: number]: string};

    constructor(private statisticsService: StatisticsService, private errorService: ErrorService) {

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
}
