export default `
<div #container
     class="result_container"
     role="listbox"
     tabindex="-1"
     [ngClass]="{new_button_padding: hasExternalSearch || hasCreateNewButton}"
     [attr.aria-expanded]="expanded">
    <div class="action_buttons">
        <a *ngIf="hasCreateNewButton"
           (click)="createNewItem()"
           class="action_button">Legg til ny (F3)</a>
        <a *ngIf="hasExternalSearch"
           (click)="toggleSearchType()"
           class="action_button">
            Søk {{currentSearchType === SearchTypeEnum.INTERNAL ? 'i 1880' : 'internt'}} (F6)
        </a>
    </div>
    <table>
        <thead *ngIf="config.tableHeader && lookupResults?.length">
        <tr>
            <th *ngFor="let column of config?.tableHeader">{{column}}</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let item of lookupResults; let idx = index"
            class="result_item"
            role="option"
            (mousemove)="selectedIndex = idx"
            (click)="selectItem()"
            [attr.aria-selected]="selectedIndex === idx">

            <td *ngFor="let column of rowTemplate(item)"
                [ngClass]="{'is_number': isNumber(column)}">
                {{column}}
            </td>
        </tr>
        <tr *ngIf="!lookupResults" class="result_item"><td>( Laster... )</td></tr>
        <tr *ngIf="lookupResults?.length === 0"
            [attr.aria-selected]="true"
            class="result_item">
            <td>Ingen resultat!</td>
            <td *ngIf="hasExternalSearch">
                Søk {{currentSearchType === SearchTypeEnum.INTERNAL ? 'i 1880' : 'internt'}} (F6)
            </td>
        </tr>
        </tbody>
    </table>
    <div class="result_footer" *ngIf="config?.maxResultsLength && lookupResults?.length">
        <span *ngIf="lookupResults.length === config.maxResultsLength">
            Viser {{config.maxResultsLength}} første treff
        </span>
        <span *ngIf="lookupResults.length < config.maxResultsLength">
            Viser {{lookupResults.length}} av {{lookupResults.length}} treff
        </span>
    </div>
</div>
`;
