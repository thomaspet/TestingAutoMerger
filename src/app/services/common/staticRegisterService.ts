import {BizHttp} from '../../../framework/core/http/BizHttp';
import {StaticRegister} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Injectable} from '@angular/core';
import {ErrorService} from '../common/errorService';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

@Injectable()
export class StaticRegisterService extends BizHttp<StaticRegister> {

    constructor(
        http: UniHttp,
        private errorService: ErrorService,
        private browserStorage: BrowserStorageService,
    ) {
        super(http);
    }

    public checkForStaticRegisterUpdate() {
        this.http.asGET()
        .usingBusinessDomain()
        .withEndPoint('staticregister')
        .send()
        .map(response => response.json())
        .subscribe((response) => {
            response.forEach(entity => {
                const localstorageStamp = this.browserStorage.getItem(entity.Registry + 'Stamp');
                if ((!localstorageStamp) || (localstorageStamp < entity.stamp)) {
                    this.postStaticRegisterDataset(entity);
                }
            });
        }, err => this.errorService.handle(err));

    }

    public postStaticRegisterDataset(entity) {
        this.http.asGET()
        .usingBusinessDomain()
        .withEndPoint(entity.Registry)
        .send()
        .map(response => response.json())
        .subscribe((response) => {
            this.browserStorage.setItem(entity.Registry + 'Data', response);
            this.browserStorage.setItem(entity.Registry + 'Stamp', entity.stamp);
        }, err => this.errorService.handle(err));
    }

    public getStaticRegisterDataset(registry: string) {
        return this.browserStorage.getItem(registry + 'Data');
    }

}
