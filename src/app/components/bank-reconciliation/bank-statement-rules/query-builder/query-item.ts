import {Component, EventEmitter, Input, Output} from '@angular/core';
import {QueryItem, QueryBuilderField, QueryBuilderOperator} from './query-builder';

@Component({
    selector: 'query-item',
    templateUrl: './query-item.html',
    styleUrls: ['./query-item.sass']
})
export class QueryBuilderItem {
    @Input() item: QueryItem;
    @Input() fields: QueryBuilderField[];
    @Input() operators: QueryBuilderOperator[];
    @Input() hideLogicalOperator: boolean;

    @Output() itemChange = new EventEmitter<QueryItem>();
    @Output() remove = new EventEmitter();

    selectedField: QueryBuilderField;
    availableOperators: QueryBuilderOperator[];

    ngOnChanges() {
        this.getSelectedField();
        this.setAvailableOperators();
    }

    private getSelectedField() {
        if (this.item && this.fields) {
            this.selectedField = this.fields.find(f => {
                const itemField = (this.item.field || '').toLowerCase();
                const field = (f.field || '').toLowerCase();
                return itemField === field;
            });
        }
    }

    private setAvailableOperators() {
        this.availableOperators = this.selectedField && this.operators
            ? this.operators.filter(op => op.forFieldTypes.includes(this.selectedField.type))
            : this.operators;
    }

    onFieldChange() {
        const fieldChanged = this.item.field !== this.selectedField.field;

        this.setAvailableOperators();
        this.item.field = this.selectedField.field;
        if (fieldChanged) {
            this.item.value = undefined;
            this.item.operator = this.availableOperators[0].operator;
        }

        this.itemChange.emit(this.item);
    }

    setLogicalOperator(logicalOperator: 'and' | 'or') {
        this.item.logicalOperator = logicalOperator;
        this.itemChange.emit(this.item);
    }

    addSibling(logicalOperator: 'and' | 'or') {
        if (!this.item.siblings) {
            this.item.siblings = [];
        }

        this.item.siblings.push({
            logicalOperator: logicalOperator,
            field: null,
            operator: null
        });

        this.itemChange.emit(this.item);
    }

    removeSibling(index: number) {
        this.item.siblings.splice(index, 1);
        this.itemChange.emit(this.item);
    }
}
