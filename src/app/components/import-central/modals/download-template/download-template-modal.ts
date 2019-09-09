import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { ISelectConfig } from '@uni-framework/ui/uniform';
import { ImportFileType, TemplateType } from '@app/models/import-central/ImportDialogModel';
import { UniHttp } from '@uni-framework/core/http/http';
import { saveAs } from 'file-saver';
import { ImportCentralService, ErrorService } from '@app/services/services';
import { Subject } from 'rxjs';

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
    isSelected: boolean = false;
    loading$: Subject<any> = new Subject();
    
    payrollType: TemplateType = TemplateType.Payroll;

    selectedFileType = {
        name: 'Standardisert Excel-format',
        type: ImportFileType.StandardizedExcelFormat
    }

    constructor(private http: UniHttp,
        private importCentralService: ImportCentralService,
        private errorService: ErrorService) { }

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
        this.loading$.next(true);
        if (this.isSelected) {
            this.importCentralService.getTemplateWithData(this.options.data.EntityType).subscribe((blob) => {
                saveAs(blob, `${this.options.data.FileName}.xlsx`);
                this.loading$.next(false);
                this.close();
            }, err => { this.errorService.handle('En feil oppstod, vennligst prøv igjen senere');  this.loading$.next(false);});
        } else {
            if (this.selectedFileType) {
                if (this.selectedFileType.type === ImportFileType.StandardUniFormat) {
                    window.location.href = this.options.data.StandardUniFormat;
                }
                else {
                    window.location.href = this.options.data.StandardizedExcelFormat;
                }
                this.loading$.next(false);
                this.close();
            }
        }

    }

    public close() {
        this.onClose.emit();
    }

}

