import {Component, ElementRef, ErrorHandler, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {UniFilesService} from '@app/services/common/uniFilesService';
import {FileService} from '@app/services/common/fileService';
import {switchMap} from 'rxjs/operators';

@Component({
    selector: 'uni-file-upload',
    templateUrl: './uniFileUpload.html',
    styleUrls: ['uniFileUpload.sass']
})
export class UniFileUpload {
    @ViewChild('file') fileElement: ElementRef<HTMLElement>;
    @Input() entityType: string;
    @Output() onFileUploaded: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() onFileDetached: EventEmitter<any> = new EventEmitter<any>(true);
    files = [];
    constructor(private uniFilesService: UniFilesService, private fileService: FileService, private errorHandler: ErrorHandler) {
    }

    selectFile() {
        if (this.fileElement) {
            this.fileElement.nativeElement.click();
        }
    }
    dropFile($event) {
        $event.stopPropagation();
        $event.preventDefault();
        this.onFileAttach($event, true);
    }
    dragFile($event) {
        $event.stopPropagation();
        $event.preventDefault();
    }
    onFileDetach($event, file) {
        $event.stopPropagation();
        $event.preventDefault();
        this.files = this.files.filter(x => x.file !== file.file);
        this.onFileDetached.emit(file);
    }
    openFile($event) {
        this.onFileAttach($event, false);
    }

    private onFileAttach(event, isDrop) {
        let selectedFile;
        if (isDrop) {
            const files = event.dataTransfer.files;
            selectedFile = files[0];
        } else {
            const input = event.target;
            selectedFile = input.files[0];
        }
        const fileName = selectedFile.name;
        const file = ({
            file: selectedFile,
            name: fileName,
            progressBar: 0,
            data: null
        });
        this.files.push(file);
        this.uploadFile(selectedFile, this.entityType).subscribe(result => {
            file.progressBar = 100;
            file.data = result;
            this.files = [].concat(this.files);
            this.onFileUploaded.emit(file);
        }, error => {
            this.files = this.files.filter(x => x.file !== file.file);
            this.errorHandler.handleError(error);
        });
    }

    private uploadFile(file, entityType) {
        return this.uniFilesService.upload(file, entityType, null).pipe(
           switchMap(imageData => this.fileService.Get(imageData.ExternalId))
        );
    }
}
