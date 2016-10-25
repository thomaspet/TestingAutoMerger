import {Component} from '@angular/core';
import {Employee} from '../../../unientities';
import {EmployeeFileUploader} from './employeeUploader';
import {UniHttp} from '../../../../framework/core/http/http';

@Component({
    selector: 'uni-document-demo',
    providers: [EmployeeFileUploader],
    template: `
        <h1>Example with employee 1</h1>
        <uni-document-uploader 
            [service]="service" 
            [entity]="employee"
            (fileUploaded)="onFileUploaded($event)"
        ></uni-document-uploader>
        <p class="error" style="min-height:40px"><span>{{service.statusText}}</span></p>
        <uni-document-list
            [service]="service"
            [entity]="employee"
            (clickItem)="onClickItem($event)"
            (deleteItem)="onDeleteItem($event)"
        >
        </uni-document-list>
    `
})
export class UniDocumentDemo {
    private employee: Employee;
    constructor(private service: EmployeeFileUploader) {
        this.employee = new Employee();
        this.employee.ID = 1;
    }
    public onFileUploaded(slot) {
        console.log('Do stuff when file is uploaded!', slot);
    }
    public onClickItem(url) {
        window.open(url, '_blank');
    }
    public onDeleteItem(slot) {
        console.log('Do stuff when file is deleted!', slot);
    }
}
