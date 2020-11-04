import {Component, EventEmitter, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ConfirmActions, IUniModal, UniModalService} from '@uni-framework/uni-modal';
import {FieldType, UniForm} from '@uni-framework/ui/uniform';
import {LocalDate} from '@uni-entities';

enum StocksCaptialInputState {
    NotVisited,
    Focused,
    Visited
};

@Component({
    selector: 'create-opening-balance-modal',
    templateUrl: './createOpeningBalanceModal.html'
})
export class CreateOpeningBalanceModal implements IUniModal {
    @Output() onClose: EventEmitter<any> = new EventEmitter();
    @ViewChild(UniForm) form: UniForm;
    model = {
        startDate: new LocalDate(new Date()),
        stocksCapital: 0,
        hasExtraCapital: false,
        extraCapital: 0,
        hasFoundationCosts: false,
        foundationCosts: 0
    };
    fields = null;
    minStocksCapital = 30000;
    stocksCapitalInputCurrentState = StocksCaptialInputState.NotVisited;
    constructor(private modalService: UniModalService) {
        this.fields = this.createFormConfigFromModel();
    }

    complete() {
        if (this.model.stocksCapital < this.minStocksCapital) {
            this.openCapitalWarningModal().subscribe(result => {
                if (result === ConfirmActions.ACCEPT) {
                    this.onClose.emit(this.model);
                }
            });
        } else {
            this.onClose.emit(this.model);
        }
    }

    onFocus(field) {
        const property = field?.field?.Property;
        if (property === 'stocksCapital' && this.stocksCapitalInputCurrentState === StocksCaptialInputState.NotVisited) {
            this.stocksCapitalInputCurrentState = StocksCaptialInputState.Focused;
            return;
        }
        if (this.stocksCapitalInputCurrentState === StocksCaptialInputState.Focused) {
            this.stocksCapitalInputCurrentState = StocksCaptialInputState.Visited;
            if (this.model.stocksCapital < this.minStocksCapital) {
                this.openCapitalWarningModal().subscribe(result => {
                    if (result === ConfirmActions.ACCEPT) {
                        this.form.field('stocksCapital').focus();
                    }
                });
            }
        }
    }

    onChangeEvent(changes: SimpleChanges) {
        if (changes?.hasExtraCapital) {
            this.fields = this.createFormConfigFromModel();
            const model = this.model;
            this.model = {...model};
        }
        if (changes?.stocksCapital) {
            this.stocksCapitalInputCurrentState = StocksCaptialInputState.Focused;
        }
    }

    openCapitalWarningModal() {
        return this.modalService.confirm({
            header: 'Minimum aksjekapital',
            message: 'Minimum aksjekapital for et norsk aksjeselskap er 30.000. Du forsøker å registrere et lavere beløp. Vil du fortsette?',
            buttonLabels: {
                accept: 'Fortsette',
                cancel: 'Avbryt'
            }
        }).onClose;
    }

    createFormConfigFromModel() {
        return [
            {
                Property: 'startDate',
                Label: 'Hva er stiftelsesdatoen til selskapet?',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Placeholder: ''
            },
            {
                Property: 'stocksCapital',
                Label: 'Hvilket beløp er selskapet registrert med i aksjekapital?',
                FieldType: FieldType.NUMERIC,
                Placeholder: 'Oppgi beløp',
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ','
                }
            },
            {
                Property: 'hasExtraCapital',
                Label: 'Skal selskapet registreres med overkurs?',
                Tooltip: {
                    Text: 'Dersom det innbetales inn et beløp per aksje som overstiger aksjens pålydende, kalles dette overkurs. ' +
                        'Sum overkurs skal stå i stiftelsesdokumentet, og skal registreres som en del av den inngående balansen.'
                },
                FieldType: FieldType.RADIOGROUP,
                Options: {
                    source: [{value: true, text: 'Ja'}],
                    labelProperty: 'text',
                    valueProperty: 'value'
                },
                Classes: 'splited-radio-group-first'
            },
            {
                Property: 'extraCapital',
                Label: '',
                FieldType: FieldType.NUMERIC,
                Placeholder: 'Oppgi beløp',
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ','
                },
                Hidden: !this.model?.hasExtraCapital,
                Classes: 'show-hide-field'
            },
            {
                Property: 'hasExtraCapital',
                Label: '',
                FieldType: FieldType.RADIOGROUP,
                Options: {
                    source: [{value: false, text: 'Nei'}],
                    labelProperty: 'text',
                    valueProperty: 'value'
                }
            },
            {
                Property: 'foundationCosts',
                Label: 'Hvilke beløp står i stiftelsedokument som stiftelsekostnad?',
                FieldType: FieldType.NUMERIC,
                Placeholder: 'Oppgi beløp',
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ','
                }
            },
            {
                Property: 'hasFoundationCosts',
                Label: 'Skal stiftelsekostnadene betales inn i tillegg til aksjekapitalen?',
                FieldType: FieldType.RADIOGROUP,
                Options: {
                    source: [{value: true, text: 'Ja'}, {value: false, text: 'Nei'}],
                    labelProperty: 'text',
                    valueProperty: 'value'
                }
            },
        ];
    }
}
