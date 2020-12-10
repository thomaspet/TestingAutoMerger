import {ICellRendererParams} from 'ag-grid-community';
import {UniTableColumn, UniTableColumnType} from '../../unitable/config/unitableColumn';
import {safeDec} from '@app/components/common/utils/utils';
import {KeyCodes} from '@app/services/common/keyCodes';

let config;

export class CellRenderer {
    static getColMenu() {
        return HeaderMenuRenderer;
    }

    static getHeaderCheckbox(tableConfig) {
        config = tableConfig;
        return HeaderCheckbox;
    }

    static getIconHeader(resolver) {
        return class IconHeaderRenderer {
            onClick: () => void;
            element: HTMLElement;

            init(params) {
                const el = document.createElement('i');
                el.classList.add('material-icons');
                el.innerText = resolver();
                this.element = el;
            }

            getGui() {
                return this.element;
            }

            destroy() {}
        };
    }

    static getLinkColumn(hasLink: (row) => boolean, onClick: (col, row) => void) {
        return function(params: ICellRendererParams) {
            const row = params.data;
            if (!hasLink || hasLink(row)) {
                const el = document.createElement('span');
                el.setAttribute('role', 'link');
                el.classList.add('table-link');
                el.innerText = params.value;
                el.onclick = (event: MouseEvent) => {
                    event.stopPropagation();
                    onClick(params.colDef['_uniTableColumn'], row);
                };

                return el;
            } else {
                return params.value;
            }
        };
    }

    static getCheckboxColumn(col: UniTableColumn) {
        return (params: ICellRendererParams) => {
            const row = params.node.data;
            if (row) {
                const element = document.createElement('i');
                element.classList.add('material-icons');
                element.style.cursor = 'pointer';


                const options = col.checkboxConfig || {};
                if (options.type) {
                    element.classList.add(options.type);
                }
                let checked = false;

                if (options.checked) {
                    if (typeof options.checked === 'function') {
                        checked = options.checked(row);
                    } else {
                        checked = !!options.checked;
                    }
                }
                checked ? element.classList.add('checked') : element.classList.remove('checked');
                element.innerText = checked ? 'check_box' : 'check_box_outline_blank';
                element.onclick = () => {
                    checked = !checked;
                    element.innerText = checked ? 'check_box' : 'check_box_outline_blank';
                    checked ? element.classList.add('checked') : element.classList.remove('checked');
                    if (options && options.onChange) {
                        options.onChange(row, checked);
                    }
                };

                return element;
            }

        };
    }

    static getTooltipColumn(col: UniTableColumn) {
        return function(params: ICellRendererParams) {
            const el = document.createElement('span');
            el.innerText = params.value;


            const tooltipData = col.tooltipResolver(params.data);
            if (!tooltipData) {
                return el;
            }

            const tooltip = document.createElement('em');
            tooltip.setAttribute('role', 'presentation');
            tooltip.classList.add('table-tooltip');

            if (tooltipData.alignment) {
                tooltip.classList.add(tooltipData.alignment);
            }

            tooltip.classList.add(tooltipData.type);
            tooltip.title = tooltipData.text;

            el.appendChild(tooltip);
            return el;
        };
    }

    static getButtonColumn(col: UniTableColumn) {
        return (params: ICellRendererParams) => {
            const row = params.node.data;
            if (row) {
                const options = col.options || {};
                const element = document.createElement('button');
                element.classList.add(options.buttonType);
                if (options.hiddenResolver && options.hiddenResolver(row)) {
                    element.classList.add('hidden');
                }
                element.innerText = (options && options.labelResolver(row)) || options.label;
                element.onclick = () => {
                    options.onClick(row);
                };
                return element;
            }
        };
    }

    static getIconColumn(col: UniTableColumn) {
        return function(params: ICellRendererParams) {
            const options = col.options || {};
            const row = params.node.data;
            const element = document.createElement('i');
            element.classList.add(
                options?.outlined ? 'material-icons-outlined' : 'material-icons');
            const iconData = options.iconResolver(row);
            if (!iconData) {
                return element;
            }
            if (iconData.alignment) {
                element.classList.add(iconData.alignment);
            }
            if (iconData.type) {
                element.classList.add(iconData.type);
            }
            element.innerHTML = iconData.text;
            element.title = options?.titleResolver(row) || '';
            element.onclick = () => {
                options.onClick(row);
            };
            return element;
        };
    }

    static getPermanentInput(col: UniTableColumn) {
        return function(params: ICellRendererParams) {
            const options = col.options || {};
            const row = params.node.data;
            const element = document.createElement('input');
            element.type = 'text';
            element.tabIndex = params.rowIndex + 100;
            if (options.textAlignment) {
                element.classList.add(`align-${options.textAlignment}`);
            }
            const valueAsNumber = safeDec(row[col.field || options.valueProperty]) || 0;
            element.value = valueAsNumber.toFixed(2).replace('.', ',');
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
                    }, 200);
                }
            };
            return element;
        };
    }
}

export class HeaderMenuRenderer {
    onClick: () => void;
    element: HTMLElement;

    init(params) {
        this.onClick = params.column.colDef['_onClick'];

        const el = document.createElement('i');
        el.classList.add('material-icons');
        el.title = 'Kolonnemeny';
        el.textContent = 'settings';
        el.onclick = (event: MouseEvent) => {
            event.stopPropagation();
            this.onClick();
        };

        this.element = el;
    }

    getGui() {
        return this.element;
    }

    destroy() {}
}

export class HeaderCheckbox {
    element: HTMLElement;
    selectOnlyVisible: boolean;

    init(params: ICellRendererParams) {
        this.selectOnlyVisible = config && config.selectOnlyVisible;

        const el = document.createElement('label');
        el.classList.add('header-checkbox');

        let numberOfRows = 0;
        if (this.selectOnlyVisible) {
            numberOfRows = params.api.getRenderedNodes().length;
        } else {
            params.api.forEachNode(() => numberOfRows++);
        }

        const selectedRows = params.api.getSelectedNodes();
        const allRowsSelected = selectedRows && numberOfRows && selectedRows.length >= numberOfRows;
        if (allRowsSelected) {
            el.classList.add('checked');
        }

        el.onclick = () => {
            let checked = el.classList.contains('checked');
            checked = !checked;

            if (checked) {
                el.classList.add('checked');
                if (this.selectOnlyVisible) {
                    params.api.getRenderedNodes().forEach(row => row.setSelected(true));
                } else {
                    params.api.forEachNode(row => row.setSelected(true));
                }
            } else {
                el.classList.remove('checked');
                params.api.forEachNode(row => row.setSelected(false));
            }
        };

        this.element = el;
    }

    getGui() {
        return this.element;
    }

    destroy() {}
}
