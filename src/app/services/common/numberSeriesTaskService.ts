import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {NumberSeriesTask} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class NumberSeriesTaskService extends BizHttp<NumberSeriesTask> {

    constructor(public http: UniHttp) {
        super(http);

        this.relativeURL = NumberSeriesTask.RelativeUrl;
        this.entityType = NumberSeriesTask.EntityType;
        this.DefaultOrderBy = null;
    }

    public getActiveNumberSeriesTasks(entityType: string): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=get-active-numberseriestasks&entityType=' + entityType)
            .send()
            .map(response => response.json());
    }

    public translateTask(task) {
        switch (task.Name) {
            case 'Journal': task._DisplayName = 'Bokføring'; break;
            case 'CustomerInvoice': task._DisplayName = 'Fakturering'; break;
            case 'SupplierInvoice': task._DisplayName = 'Fakturamottak'; break;
            case 'Salary': task._DisplayName = 'Lønn'; break;
            case 'Bank': task._DisplayName = 'Bank'; break;
            case 'VatReport': task._DisplayName = 'MVA-melding'; break;
            case 'Asset': task._DisplayName = 'Eiendeler'; break;
        }
        return task;
    }
}
