import {Component, EventEmitter, Input, Output} from '@angular/core';

export * from './query-item';

export interface QueryItem {
    logicalOperator?: 'and' | 'or';
    field?: string;
    operator?: string;
    value?: any;
    siblings?: QueryItem[];
}

export interface QueryBuilderField {
    label: string;
    field: string;
    type?: 'text' | 'number' | 'date' | 'boolean';
}

export interface QueryBuilderOperator {
    label: string;
    operator: string;
    isFunction?: boolean;
    forFieldTypes?: string[];
}

@Component({
    selector: 'query-builder',
    templateUrl: './query-builder.html',
    styleUrls: ['./query-builder.sass']
})
export class QueryBuilder {
    @Input() disableAddButton: boolean = false;
    @Input() fields: QueryBuilderField[];
    @Input() query: QueryItem[];
    @Input() siblingMaxDepth: number = 0;
    @Input() additionalOperators: QueryBuilderOperator[] = [];
    @Output() queryChange = new EventEmitter<QueryItem[]>();

    items: QueryItem[];

    operators: QueryBuilderOperator[] = [
        {
            label: 'Inneholder',
            operator: 'contains',
            isFunction: true,
            forFieldTypes: ['text']
        },
        {
            label: 'Begynner med',
            operator: 'startswith',
            isFunction: true,
            forFieldTypes: ['text']
        },
        {
            label: 'Er',
            operator: '=',
            forFieldTypes: ['text', 'number', 'date', 'boolean']
        },
        {
            label: 'Er ikke',
            operator: '<>',
            forFieldTypes: ['text', 'number', 'date', 'boolean']
        },
        {
            label: 'Større enn',
            operator: '>',
            forFieldTypes: ['number', 'date']
        },
        {
            label: 'Større enn eller lik',
            operator: '>=',
            forFieldTypes: ['number', 'date']
        },
        {
            label: 'Mindre enn',
            operator: '<',
            forFieldTypes: ['number', 'date']
        },
        {
            label: 'Mindre enn eller lik',
            operator: '<=',
            forFieldTypes: ['number', 'date']
        },
    ];

    ngOnInit() {
        this.operators = [...this.operators, ...this.additionalOperators];
    }

    ngOnChanges(changes) {
        if (changes['query']) {
            this.items = this.query || [{}];
        }
    }

    addItem() {
        this.items.push({logicalOperator: 'and'});
    }

    removeItem(index: number) {
        this.items.splice(index, 1);
        this.emitChange();
    }

    emitChange() {
        if (this.items && this.items[0]) {
            this.items[0].logicalOperator = undefined;
        }

        this.query = this.items;
        this.queryChange.next(this.query);
    }
}
