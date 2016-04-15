import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {PayrollRun} from '../../unientities';

export class PayrollRunService extends BizHttp<PayrollRun> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = PayrollRun.relativeUrl;
    }
    
    public next(id: number) {
        return this.http
                   .asGET()
                   .withEndPoint(this.relativeURL)
                   .send({action: 'next&RunID=' + id});
    }
    
    public previous(id: number) {
        return this.http
                   .asGET()
                   .withEndPoint(this.relativeURL)
                   .send({action: 'previous&RunID=' + id});
    }
}
