import {CORE_DIRECTIVES, FORM_DIRECTIVES} from '@angular/common';
import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FileUploadService} from './FileUploadService';

@Component({
    selector: 'uni-document-list',
    directives: [CORE_DIRECTIVES, FORM_DIRECTIVES],
    template: `
        <ul *ngIf="service.Slots">
            <li *ngFor="let slot of service.Slots">
                <a (click)="open(slot)">{{slot?.Name}}</a>
                <button (click)="delete(slot)">Delete</button>
            </li>
        </ul>
    `
})
export class UniDocumentList {

    @Input()
    public service: FileUploadService<any>;

    @Input()
    public entity: any;

    @Output()
    public onClickItem: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public onDeleteItem: EventEmitter<any> = new EventEmitter<any>(true);

    constructor() {
    }

    public ngOnInit() {
        this.service.getSlots(this.entity.ID);
    }

    public open(slot) {
        var self = this;
        this.service.download(this.entity.ID, slot.ID)
            .then((response) => {
                self.onClickItem.emit(response);
            });
    }

    public delete(slot) {
        var self = this;
        this.service.remove(this.entity.ID, slot)
            .then((response) => {
                self.onDeleteItem.emit(response);
            });
    }
}