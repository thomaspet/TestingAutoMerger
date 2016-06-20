import {Injectable} from '@angular/core';
import {FileUploadService} from '../../../../../framework/documents/index';
import {SupplierInvoice} from '../../../../unientities';
import {UniHttp} from '../../../../../framework/core/http/http';
import {AuthService} from '../../../../../framework/core/authService';

@Injectable()
export class SupplierInvoiceFileUploader extends FileUploadService<SupplierInvoice> {
    constructor(protected $http: UniHttp) {
        super($http);
        this.entityType = SupplierInvoice.EntityType;
    }
}
