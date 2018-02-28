import {ICellRendererParams} from 'ag-grid';
import {UniTableColumn} from '../../unitable/config/unitableColumn';

export class CellRenderer {
    static getColMenu(onClick: () => void) {
        HeaderMenuRenderer.onClick = onClick;
        return HeaderMenuRenderer;
    }

    static getHeaderCheckbox() {
        return HeaderCheckbox;
    }

    static getRowMenu(
        contextMenuClick: (event: MouseEvent, row) => void,
        deleteButtonClick: (row) => void
    ) {
        return function(params: ICellRendererParams) {
            const container = document.createElement('span');
            container.classList.add('row-menu-container');

            if (deleteButtonClick) {
                const deleteButton = document.createElement('i');
                deleteButton.classList.add('material-icons');
                deleteButton.textContent = 'delete';
                deleteButton.onclick = (event: MouseEvent) => {
                    event.stopPropagation();
                    deleteButtonClick(params.data);
                };

                container.appendChild(deleteButton);
            }

            if (contextMenuClick) {
                const contextMenu = document.createElement('i');
                contextMenu.classList.add('material-icons');
                contextMenu.textContent = 'more_horiz';
                contextMenu.onclick = (event: MouseEvent) => {
                    event.stopPropagation();
                    contextMenuClick(event, params.data);
                };

                container.appendChild(contextMenu);
            }

            return container;
        };
    }



    static getDeleteButton(onClick: (row) => void) {
        return function(params) {
            const el = document.createElement('i');
            el.classList.add('material-icons');
            el.textContent = 'delete';
            el.onclick = (event: MouseEvent) => {
                event.stopPropagation();
                onClick(params.data);
            };

            return el;
        };
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
    static onClick: () => void;
    element: HTMLElement;

    init(params) {
        const el = document.createElement('i');
        el.classList.add('material-icons');
        el.title = 'Kolonnemeny';
        el.textContent = 'settings';
        el.onclick = (event: MouseEvent) => {
            event.stopPropagation();
            HeaderMenuRenderer.onClick();
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
    init(params: ICellRendererParams) {
        const el = document.createElement('label');
        el.classList.add('header-checkbox');

        let checked = false;
        el.onclick = () => {
            checked = !checked;
            if (checked) {
                el.classList.add('checked');
                params.api.forEachNode((node) => {
                    node.setSelected(true);
                });
            } else {
                el.classList.remove('checked');
                params.api.forEachNode((node) => {
                    node.setSelected(false);
                });
            }
        };

        this.element = el;
    }

    getGui() {
        return this.element;
    }

    destroy() {}
}
