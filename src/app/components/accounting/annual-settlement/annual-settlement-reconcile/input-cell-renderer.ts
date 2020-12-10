import {UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {ICellRendererParams} from 'ag-grid-community';
import {safeDec} from '@app/components/common/utils/utils';

export const inputCellRenderer = (col: UniTableColumn) => {
    return (params: ICellRendererParams) => {
        const options = col.options || {};
        const row = params.node.data;
        const element = document.createElement('input');
        element.type = 'text';
        element.tabIndex = params.rowIndex + 100;
        if (options.textAlignment) {
            element.classList.add(`align-${options.textAlignment}`);
        }
        if (options.type === UniTableColumnType.Money) {
            const valueAsNumber = safeDec(row[col.field || options.valueProperty]) || 0;
            element.value = valueAsNumber.toFixed(2).replace('.', ',');
        } else {
            element.value = row[col.field || options.valueProperty];
        }
        element.onblur = () => {
            let parsedValue = 0;
            if (options.type === UniTableColumnType.Money) {
                parsedValue = element.value ? safeDec(element.value) : 0;
                element.value = parsedValue ? parsedValue.toFixed(2).replace('.', ',') : '0';
            }
            options.onChange(parsedValue, row);
        };
        element.onkeydown = (event) => {
            if (event.key === 'Tab') {
                const increment = event.shiftKey ? -1 : 1;
                const el: HTMLElement = document.querySelector(`input[tabIndex="${element.tabIndex + increment}"]`);
                setTimeout(() => {
                    if (el) {
                        el.focus();
                    }
                }, 100);
            }
        };
        return element;
    };
}
