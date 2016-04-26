import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';
import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {FileUploadService} from './FileUploadService';

@Component({
    selector: 'uni-document-list',
    directives: [CORE_DIRECTIVES, FORM_DIRECTIVES],
    template: `
        <ul *ngIf="slotsList">
            <li *ngFor="#slot of slotsList">
                <a (click)="open(slot)">{{slot.Name}}</a>
                <button (click)="delete(slot)">Delete</button>
            </li>
        </ul>
    `
})
export class UniDocumentList {

    @Input()
    public uploader: FileUploadService<any>;

    @Input()
    public entity: any;

    @Output()
    public onClickItem: EventEmitter<any> = new EventEmitter<any>(true);

    public slotsList: any[];

    constructor() {
    }

    public ngOnInit() {
        this.uploader.GetAll(this.entity.ID)
            .subscribe((response) => {
                return this.slotsList = response;
            });
    }

    public open(slot) {
        var self = this;
        this.uploader.download(this.entity.ID, slot.ID)
            .subscribe((response) => {
                self.onClickItem.emit(response);
            });
    }

    public delete(slot) {
        this.uploader.remove(this.entity.ID, slot.ID).subscribe((response) => {
            var index = this.slotsList.indexOf(slot);
            this.slotsList = [
                ...this.slotsList.slice(0, index),
                ...this.slotsList.slice(index + 1)
            ];
        });

    }
}