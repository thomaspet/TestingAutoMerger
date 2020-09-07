import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SalaryShortcutsService, IShortcut } from './salary-shortcuts.service';

@Component({
    selector: 'uni-salary-shortcuts',
    templateUrl: './salary-shortcuts.component.html',
    styleUrls: ['./salary-shortcuts.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalaryShortcutsComponent implements OnInit {

    shortcuts: IShortcut[] = [];

    constructor(private shortcutService: SalaryShortcutsService) { }

    ngOnInit(): void {
        this.shortcuts = this.shortcutService.getShortcuts();
    }

    navigate(shortCut: IShortcut) {
        this.shortcutService
            .navigate(shortCut);
    }

}
