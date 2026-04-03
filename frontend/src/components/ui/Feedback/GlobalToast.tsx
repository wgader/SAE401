import React, { useState, useEffect } from 'react';
import { Toast, type ToastVariant } from './Toast';

export const GlobalToast: React.FC = () => {
    const [toast, setToast] = useState<{ message: string, variant: ToastVariant, id: number } | null>(null);

    useEffect(() => {
        const handleShowToast = (event: any) => {
            const { message, type, variant } = event.detail;
            setToast({ 
                message, 
                variant: variant || type || 'success', 
                id: Date.now() 
            });
        };

        window.addEventListener('show-toast' as any, handleShowToast);
        return () => window.removeEventListener('show-toast' as any, handleShowToast);
    }, []);

    if (!toast) return null;

    return (
        <Toast 
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            isVisible={true}
            onClose={() => setToast(null)}
        />
    );
};
