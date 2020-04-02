import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { RegulativeService } from '@app/services/services';

@Component({
    selector: 'uni-regulative-empty-state',
    templateUrl: './regulative-empty-state.component.html',
    styleUrls: ['./regulative-empty-state.component.sass']
})
export class RegulativeEmptyStateComponent implements OnInit {
    @Output() newRegulativeGroup: EventEmitter<boolean> = new EventEmitter();
    constructor(
        private regulativeService: RegulativeService,
    ) { }

    ngOnInit() {

    }

    newRegulation() {
        this.newRegulativeGroup.emit(true);
    }

    downloadTemplateFile() {
        this.regulativeService
            .downloadTemplateFile();
    }

}
