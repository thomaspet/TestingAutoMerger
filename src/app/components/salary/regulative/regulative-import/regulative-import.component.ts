import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { RegulativeService } from '@app/components/salary/regulative/shared/service/regulative.service';

@Component({
  selector: 'uni-regulative-import',
  templateUrl: './regulative-import.component.html',
  styleUrls: ['./regulative-import.component.sass']
})
export class RegulativeImportComponent implements OnInit {
    @Output() newRegulativeGroup: EventEmitter<boolean> = new EventEmitter();
    @Output() downloadedTemplate: EventEmitter<boolean> = new EventEmitter();
    @Input() heading: string;
    busy: boolean;
    constructor(
        private regulativeService: RegulativeService,
    ) { }

    ngOnInit() {

    }

    newRegulation() {
        this.newRegulativeGroup.emit(true);
    }

    downloadTemplateFile() {
        this.busy = true;
        this.regulativeService
            .getTemplateFile()
            .pipe(
                finalize(() => {
                    this.busy = false;
                    this.downloadedTemplate.emit(true);
                }),
            )
            .subscribe(file => saveAs(file, 'regulativ.xlsx'));
    }

}
