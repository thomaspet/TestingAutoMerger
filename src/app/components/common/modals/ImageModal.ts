import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '../../../../framework/uni-modal/interfaces';
import {File} from '../../../unientities';
import {UniImage, UniImageSize} from '../../../../framework/uniImage/uniImage';

export interface IUpdatedFileListEvent {
    entity: string;
    entityID: number;
    files: File[];
}

@Component({
    selector: 'image-modal',
    template: `
        <section role="dialog" class="uni-modal medium">
            <header>Forhåndsvisning</header>
            <article class="image-modal-body">
                <uni-image *ngIf="options?.data"
                    [singleImage]="singleImage"
                    [fileIDs]="options.data.fileIDs || []"
                    [entity]="options.data.entity"
                    [entityID]="options.data.entityID"
                    [showFileID]="options.data.showFileID || null"
                    [readonly]="options.data.readonly"
                    [size]="options.data.size || null"
                    (fileListReady)="fileListReady($event)"
                ></uni-image>
            </article>
            <footer>
                <button class="secondary" (click)="close()">Lukk</button>
            </footer>
        </section>
    `,
    styles: [`
        .image-modal-body {
            min-height: 10rem
        }
    `]
})
export class ImageModal implements IUniModal {
    private files: any;
    private singleImage: boolean = true;

    @ViewChild(UniImage)
    public uniImage: UniImage;

    @Output()
    public onClose: EventEmitter<IUpdatedFileListEvent> = new EventEmitter(false);

    @Input()
    public options: IModalOptions;

    public ngOnInit() {
        // Check specifically for false because truthy/falsy..
        if (this.options.data.singleImage === false) {
            this.singleImage = false;
        }
    }

    public refreshImages() {
        this.uniImage.refreshFiles();
    }

    public fileListReady(files: File[]) {
        this.files = files;
        this.options.cancelValue = {
            entity: this.options.data.entity,
            entityID: this.options.data.entityID,
            files: this.files
        };
    }

    public close() {
        this.onClose.emit({
            entity: this.options.data.entity,
            entityID: this.options.data.entityID,
            files: this.files
        });
    }
}
