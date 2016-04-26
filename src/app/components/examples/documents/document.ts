import {Component, ViewChild} from 'angular2/core';
import {UniDocumentUploader, UniDocumentList} from '../../../../framework/documents/index';
import {Employee} from '../../../unientities';
import {EmployeeFileUploader} from './employeeUploader';
import {UniHttp} from '../../../../framework/core/http/http';

@Component({
    selector: 'uni-document-demo',
    directives: [UniDocumentUploader, UniDocumentList],
    providers: [EmployeeFileUploader],
    template: `
        <h1>Example with employee 1</h1>
        
        <uni-document-uploader 
            [uploader]="uploader" 
            [entity]="employee"
            (onFileUploaded)="onFileUploaded($event)"
        ></uni-document-uploader>
        
        <uni-document-list
            [uploader]="uploader"
            [entity]="employee"
            (onClickItem)="onClickItem($event)"
        >
        </uni-document-list>
    `
})
export class UniDocumentDemo {
    @ViewChild(UniDocumentList) 
    private listComponent: UniDocumentList;
    private employee: Employee;
    
    
    
    constructor(private $http: UniHttp, private uploader: EmployeeFileUploader) {
        this.employee = new Employee();
        this.employee.ID = 1;
    }

    public onFileUploaded(slot) {
        this.listComponent.slotsList = [].concat(this.listComponent.slotsList, slot);
    }
    
    public onClickItem(url) {
        window.open(url, '_blank');
    }
}
