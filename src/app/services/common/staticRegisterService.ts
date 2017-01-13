import {BizHttp} from '../../../framework/core/http/BizHttp';
import {StaticRegister} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Injectable} from '@angular/core';
import {ErrorService} from '../common/ErrorService';

@Injectable()
export class StaticRegisterService extends BizHttp<StaticRegister> {

    constructor(http: UniHttp, private errorService: ErrorService) {
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
                var localstorageStamp = localStorage.getItem(entity.Registry + 'Stamp');
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
            localStorage.setItem(entity.Registry + 'Data', JSON.stringify(response));
            localStorage.setItem(entity.Registry + 'Stamp', entity.stamp);
        }, err => this.errorService.handle(err));
    }

    public getStaticRegisterDataset(registry: string) {
        return JSON.parse(localStorage.getItem(registry + 'Data'));
    }

}
