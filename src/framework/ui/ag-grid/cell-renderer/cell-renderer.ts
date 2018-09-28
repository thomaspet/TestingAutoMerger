import {ICellRendererParams} from 'ag-grid';
import {UniTableColumn} from '../../unitable/config/unitableColumn';

export class CellRenderer {
    static getColMenu() {
        return HeaderMenuRenderer;
    }

    static getLinkColumn(onClick: (col, row) => void) {
        return function(params: ICellRendererParams) {
            const el = document.createElement('span');
            el.setAttribute('role', 'link');
            el.classList.add('table-link');
            el.innerText = params.value;
            el.onclick = (event: MouseEvent) => {
                event.stopPropagation();
                onClick(params.colDef['_uniTableColumn'], params.data);
            };

            return el;
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