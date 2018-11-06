import { FormControl } from '@angular/forms';
export function hasParent(element, selector: string): boolean {
    let node = element;
    while(node !== null) {
        node = node.parentElement;
        if (node && node.tagName.toLowerCase() === selector.toLowerCase()) {
            return true;
        }
    }
    return false;
}

export function getControlIDFromProperty(property: string) {
    return property.replace(new RegExp('\\.', 'g'), '#');
}

export function getPropertyFromControlID(property: string) {
    return property.replace(new RegExp('\\#', 'g'), '.');
}

export function testEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

export function validateEmailControl(field) {
    return (control: FormControl) => {
        if (!control.value || typeof control.value !== 'string' || testEmail(control.value)) {
            return null;
        }

        return {
            message: 'it has to be a valid email'
        };
    };
}
