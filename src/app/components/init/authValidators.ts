import {FormControl, AbstractControl} from '@angular/forms';

export function passwordValidator(control: FormControl) {
    if (!control.value) {
        return null;
    }

    const hasLowerCase = /[a-zæøå]/.test(control.value);
    const hasUpperCase = /[A-ZÆØÅ]/.test(control.value);
    const hasNumber   = /[\d]/.test(control.value);
    const hasSymbol    = /[\@\#\$\%\^\&\*\-_\\+\=\[\]\{\}\|\\\:\‘\,\.\?\/\`\~\“\(\)\;]/.test(control.value);

    let counter = 0;
    if (hasLowerCase) {
        counter++;
    }
    if (hasUpperCase) {
        counter++;
    }
    if (hasNumber) {
        counter++;
    }
    if (hasSymbol) {
        counter++;
    }

    if (control.value.length < 10 || counter < 3) {
        return {'passwordValidator': 'Passord er ikke gyldig'};
    }

    return null;
}

export function passwordMatchValidator(formGroup: AbstractControl) {
    const password = formGroup.get('Password');
    const confirmPassword = formGroup.get('ConfirmPassword');

    if (password.touched && confirmPassword.touched) {
        if (password.value !== confirmPassword.value) {
            confirmPassword.setErrors({
                'passwordMatchValidator': 'Passordene er ikke like'
            });
        } else {
            confirmPassword.setErrors(null);
        }
    }
}

export function usernameValidator(control: FormControl) {
    if (control.value && /[^a-zA-Z0-9-_.]/g.test(control.value)) {
        return {'usernameValidator': 'Brukernavn kan bare inneholde bokstaver (a-z), tall, bindestrek, understrek og punktum'};
    } else {
        return null;
    }
}
