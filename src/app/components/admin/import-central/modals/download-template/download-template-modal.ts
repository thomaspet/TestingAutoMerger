import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { ISelectConfig } from '@uni-framework/ui/uniform';
import { ImportFileType } from '@app/models/import-central/ImportDialogModel';
import { UniHttp } from '@uni-framework/core/http/http';
import { ImportCentralService } from '@app/services/admin/import-central/importCentralService';
import { saveAs } from 'file-saver';

@Component({
    selector: 'download-template-modal',
    templateUrl: './download-template-modal.html',
    styleUrls: ['./download-template-modal.sass']
})

export class DownloadTemplateModal implements OnInit, IUniModal {

    @Input() options: IModalOptions = {};

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    config: ISelectConfig;

    operators: any[] = [];

    isSelected: boolean = true;

    selectedFileType = {
        name: 'Standardisert Excel-format',
        type: ImportFileType.StandardizedExcelFormat
    }

    constructor(private http: UniHttp, private importCentralService: ImportCentralService) { }

    public ngOnInit() {
        this.config = {
            placeholder: 'File type',
            searchable: false,
            displayProperty: 'name',
        };

        this.operators = [
            // {
            //     name: 'Standard Uni Format',
            //     type: ImportFileType.StandardUniFormat
            // },
            {
                name: 'Standardized Excel Format',
                type: ImportFileType.StandardizedExcelFormat
            }];
    }

    public onSelectChange(selectedItem) {
        this.selectedFileType = selectedItem;
    }

    public onDownloadTempalte() {
        if (this.isSelected) {
            this.importCentralService.getTemplateWithData(this.options.data.EntityType).subscribe((blob) => {
                saveAs(blob,`${this.options.data.FileName}.xlsx`);
            });
        } else {
            if (this.selectedFileType) {
                if (this.selectedFileType.type === ImportFileType.StandardUniFormat) {
                    window.location.href = this.options.data.StandardUniFormat;
                }
                else {
                    window.location.href = this.options.data.StandardizedExcelFormat;
                }
            }
        }
        this.close()
    }

    public close() {
        this.onClose.emit();
    }

}

