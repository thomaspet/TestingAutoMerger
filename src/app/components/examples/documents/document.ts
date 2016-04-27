import {Component, ChangeDetectionStrategy} from 'angular2/core';
import {UniDocumentUploader, UniDocumentList} from '../../../../framework/documents/index';
import {Employee} from '../../../unientities';
import {EmployeeFileUploader} from './employeeUploader';
import {UniHttp} from '../../../../framework/core/http/http';

@Component({
    selector: 'uni-document-demo',
    directives: [UniDocumentUploader, UniDocumentList],
    providers: [EmployeeFileUploader],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <h1>Example with employee 1</h1>
        <uni-document-uploader 
            [service]="service" 
            [entity]="employee"
            (onFileUploaded)="onFileUploaded($event)"
        ></uni-document-uploader>
        <p class="error" style="min-height:40px"><span>{{service.statusText}}</span></p>
        <uni-document-list
            [service]="service"
            [entity]="employee"
            (onClickItem)="onClickItem($event)"
        >
        </uni-document-list>
    `
})
export class UniDocumentDemo {
    private employee: Employee;
    constructor(private $http: UniHttp, private service: EmployeeFileUploader) {
        this.employee = new Employee();
        this.employee.ID = 1;
    }
    public onFileUploaded(slot) {
        console.log('Do stuff when file is uploaded!');
    }
    public onClickItem(url) {
        window.open(url, '_blank');
    }
}
