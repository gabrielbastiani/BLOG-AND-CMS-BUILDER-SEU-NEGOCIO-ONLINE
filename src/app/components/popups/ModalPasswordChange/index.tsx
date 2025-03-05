import Modal from 'react-modal';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { setupAPIClient } from '@/services/api';
import { Input } from '../../input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface DeleteProps {
    isOpen: boolean;
    onRequestClose: () => void;
    id_users: string;
    link_update_senha: string;
}

const passwordSchema = z.object({
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirmação de senha deve ter pelo menos 6 caracteres'),
}).refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ModalPasswordChange({ isOpen, onRequestClose, id_users, link_update_senha }: DeleteProps) {

    const customStyles = {
        content: {
            top: '50%',
            bottom: 'auto',
            left: '50%',
            right: 'auto',
            padding: '30px',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'black',
            zIndex: 9999999
        }
    };

    function generateComplexPassword(length: number): string {
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const numberChars = '0123456789';
        const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
        const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;

        let password = '';
        password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
        password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
        password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
        password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

        for (let i = password.length; i < length; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }

        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    });

    const handleGeneratePassword = () => {
        const newPassword = generateComplexPassword(22);
        setValue("password", newPassword);
        setValue("confirmPassword", newPassword);
    };

    async function onSubmit(data: PasswordFormValues) {
        try {
            const apiClient = setupAPIClient();

            await apiClient.put(`${link_update_senha}`, {
                user_id: id_users,
                password: data.password
            });

            toast.success(`Senha alterada com sucesso.`);
            onRequestClose();

        } catch (error) {
            if (error instanceof Error && 'response' in error && error.response) {
                console.log((error as any).response.data);
                toast.error('Ops, erro ao alterar a senha.');
            } else {
                console.error(error);
                toast.error('Erro desconhecido.');
            }
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={customStyles}
        >
            <button
                type='button'
                onClick={onRequestClose}
                className='react-modal-close'
                style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
            >
                <FiX size={45} color="#f34748" />
            </button>

            <div className='text-center'>
                <h1 className='text-xl mt-5 mb-5'>Altere a senha desse usuário.</h1>

                <div className='mb-3'>
                    <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="bg-backgroundButton text-white rounded px-3 py-1 hover:bg-hoverButtonBackground transition duration-300"
                    >
                        Gerar Senha
                    </button>
                </div>

                <div className="mb-3">
                    Senha
                    <Input
                        styles="h-12 w-full border-2 rounded-md h-12 px-3 max-w-sm"
                        type="text"
                        placeholder="Digite sua senha..."
                        name="password" // Corrigido para "password"
                        error={errors.password?.message}
                        register={register}
                    />
                </div>

                <div className='mb-3'>
                    Confirmar a senha
                    <Input
                        styles="border-2 rounded-md h-12 px-3 w-full max-w-sm"
                        type="text"
                        placeholder="Digite novamente a senha..."
                        name="confirmPassword"
                        error={errors.confirmPassword?.message}
                        register={register}
                    />
                </div>

                <button
                    className="mt-10 w-full md:w-80 px-6 py-3 bg-red-600 text-white rounded hover:bg-hoverButtonBackground transition duration-300"
                    onClick={handleSubmit(onSubmit)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSubmit(onSubmit);
                        }
                    }}
                >
                    Alterar
                </button>
            </div>
        </Modal>
    );
}