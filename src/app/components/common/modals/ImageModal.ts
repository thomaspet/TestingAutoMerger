import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '../../../../framework/uniModal/barrel';
import {File} from '../../../unientities';
import {UniImage, UniImageSize} from '../../../../framework/uniImage/uniImage';


type Config = {
    close: () => void,
    fileIDs: Array<number>,
    entity: string,
    entityID: number,
    showFileID: Number,
    readOnly: boolean,
    size: UniImageSize,
    event: (files: File[]) => void
};

export type UpdatedFileListEvent = {
    entity: string,
    entityID: number,
    files: File[]
};

@Component({
    selector: 'image-modal',
    template: `
        <section role="dialog" class="uni-modal account_detail_modal_size">
            <header><h1>Forhåndsvisning</h1></header>
            <article [attr.aria-busy]="busy">
                    <uni-image
                        [singleImage]="true"
                        [fileIDs]="config.fileIDs"
                        [entity]="config.entity"
                        [entityID]="config.entityID"
                        [showFileID]="config.showFileID"
                        [readonly]="config.readOnly"
                        (fileListReady)="fileListReady($event)"
                        [size]="config.size"
                    ></uni-image>
            </article>
            <footer>

            </footer>
        </section>
    `
})
export class ImageModal implements IUniModal {
    public config: any = {};
    private files: any;

    @ViewChild(UniImage)
    public uniImage: UniImage;

    @Output()
    public onClose: EventEmitter<UpdatedFileListEvent> = new EventEmitter<UpdatedFileListEvent>();

    @Input()
    public options: IModalOptions;

    constructor() { }

    public ngOnInit() {
        this.config.entity = this.options.data.entity;
        this.config.entityID = this.options.data.entityID;
        this.config.fileIDs = this.options.data.fileIDs;
        this.config.showFileID = this.options.data.showFileID || null;
        this.config.readOnly = this.options.data.readonly;
        this.config.size = this.options.data.size || null;
    }

    public refreshImages() {
        this.uniImage.refreshFiles();
    }

    public fileListReady(files: File[]) {
        this.files = files;
    }

    public close() {
        this.onClose.emit({entity: this.config.entity, entityID: this.config.entityID, files: this.files});
    }
}
