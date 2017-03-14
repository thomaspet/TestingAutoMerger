import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';
import {ErrorService} from './errorService';

@Injectable()
export class ModelService {
    private models: Array<any>;

    constructor(private uniHttpService: UniHttp, private errorService: ErrorService, protected authService: AuthService) {
        if (this.authService) {
            this.authService.authentication$.subscribe(change => this.invalidateCache());
        }
    }

    public getModel(name: string): string {
        if (this.models) {
            return this.models.find(x => x.Publicname === name);
        }

        return null;
    }

    public getModels(): Array<any> {
        return this.models;
    }

    private invalidateCache() {
        this.models = null;
    }

    public loadModelCache(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.models) {
                // get statuses from API and add it to the cache
                this.uniHttpService
                    .usingMetadataDomain()
                    .asGET()
                    .withEndPoint('allmodels')
                    .send()
                    .map(response => response.json())
                    .subscribe(data => {
                        if (data) {
                            this.models = data;
                            resolve(true);
                        } else {
                            reject('Could not get models from API');
                        }
                    }, err => this.errorService.handle(err));
            } else {
                resolve(true);
            }
        });
    }
}
