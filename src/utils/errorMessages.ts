// utils/errorMessages.ts

export const fieldTranslations: { [key: string]: string } = {
    'username': 'nombre de usuario',
    'email': 'correo electrónico',
    'empresaId': 'ID de empresa',
    'direccionEmpresa': 'dirección de empresa',
    'metodoDeEntrega': 'método de entrega',
    'numeroTelefono': 'número de teléfono',
    'cedula': 'cédula',
    'perfil.numeroTelefono': 'número de teléfono',
    'perfil.cedula': 'cédula',
    'Unauthorized': 'Inicia sesión nuevamente para ejecutar alguna acción'
    // ... otros campos
};

export const uniqueErrorMessages: { [key: string]: string } = {
    'username': 'El nombre de usuario ya está en uso',
    'email': 'El correo electrónico ya está registrado',
    'numeroTelefono': 'El número de teléfono ya está registrado',
    'empresaId': 'La empresa ya está registrada',
    'perfil.numeroTelefono': 'El número de teléfono ya está registrado',
    'default': 'El valor ya existe en la base de datos'
};

export function formatErrorMessage(rawError: string | string[]): string {
    // Convertir a array si es un string
    const errorArray = Array.isArray(rawError) ? rawError : [rawError];
    const formattedErrors: string[] = [];

    for (const error of errorArray) {
        let formattedMessage = error.trim();

        // 1. Reemplazar nombres de campos técnicos
        Object.entries(fieldTranslations).forEach(([techName, translation]) => {
            const regex = new RegExp(`\\b${techName}\\b`, 'gi');
            formattedMessage = formattedMessage.replace(regex, translation);
        });

        // 2. Manejar errores de valor único (manteniendo tu lógica original)
        if (formattedMessage.includes('valor único ya existe')) {
            const fieldMatch = formattedMessage.replace('valor único ya existe en la base de datos.', '').trim();
            const fieldKey = fieldMatch.replace(/perfil\./, '');
            
            const customMessage = uniqueErrorMessages[fieldKey] || 
                               uniqueErrorMessages[fieldMatch] ||
                               `El ${fieldTranslations[fieldKey] || fieldTranslations[fieldMatch] || fieldKey} ya está en uso.`;
            
            formattedErrors.push(customMessage);
            continue;
        }

        // 3. Manejar otros errores de validación
        const validationErrors: { [key: string]: string } = {
            'must be longer than or equal to': 'debe tener al menos',
            'must be a string': 'debe ser texto',
            'must be a number': 'debe ser un número',
            'characters': 'caracteres',
            // ... otras traducciones
        };

        Object.entries(validationErrors).forEach(([en, es]) => {
            if (formattedMessage.includes(en)) {
                formattedMessage = formattedMessage.replace(en, es);
            }
        });

        // 4. Limpiar estructura del mensaje
        formattedMessage = formattedMessage
            .replace(/perfil\./g, '')
            .replace(/(\s+)/g, ' ')
            .trim();

        // 5. Formateo final solo si no es un error de valor único
        if (formattedMessage.length > 0 && !formattedMessage.includes('valor único ya existe')) {
            formattedMessage = formattedMessage.charAt(0).toUpperCase() + 
                              formattedMessage.slice(1);
            
            if (!['.', '!', '?'].includes(formattedMessage.slice(-1))) {
                formattedMessage += '.';
            }
            formattedErrors.push(formattedMessage);
        }
    }

    // Unir todos los errores con saltos de línea
    return formattedErrors.join('\n');
}