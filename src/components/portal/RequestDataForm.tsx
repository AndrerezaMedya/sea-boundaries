import { type ChangeEvent, type FormEvent, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, FileText, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

type RequestFormData = {
    namaLengkap: string;
    nikNim: string;
    institusi: string;
    alamatInstitusi: string;
    email: string;
    noTelepon: string;
    keperluanData: string;
    keterangan: string;
    suratInstitusi: File | null;
};

type RequestFormErrors = Partial<Record<keyof RequestFormData, string>>;
type TextFieldKey = Exclude<keyof RequestFormData, 'suratInstitusi'>;

type TextFieldConfig = {
    key: TextFieldKey;
    label: string;
    helper: string;
    placeholder: string;
    multiline?: boolean;
    rows?: number;
    type?: 'text' | 'email';
    required?: boolean;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_EXT = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
];

const createInitialState = (): RequestFormData => ({
    namaLengkap: '',
    nikNim: '',
    institusi: '',
    alamatInstitusi: '',
    email: '',
    noTelepon: '',
    keperluanData: '',
    keterangan: '',
    suratInstitusi: null,
});

const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validatePhone = (value: string) => /^[+]?[-()\s\d]{9,20}$/.test(value);

const textFields: TextFieldConfig[] = [
    {
        key: 'namaLengkap',
        label: 'Nama Lengkap',
        helper: 'Full Name',
        placeholder: 'Masukkan nama lengkap Anda',
        required: true,
    },
    {
        key: 'nikNim',
        label: 'NIK/NIM',
        helper: 'National ID Number/Student ID Number',
        placeholder: 'Masukkan NIK/NIM Anda',
        required: true,
    },
    {
        key: 'institusi',
        label: 'Institusi',
        helper: 'Institution Name',
        placeholder: 'Masukkan nama institusi Anda',
        required: true,
    },
    {
        key: 'alamatInstitusi',
        label: 'Alamat Institusi',
        helper: 'Institution Address',
        placeholder: 'Masukkan alamat institusi Anda',
        multiline: true,
        rows: 3,
        required: true,
    },
    {
        key: 'email',
        label: 'Email',
        helper: 'Active Email Address',
        placeholder: 'Masukkan email aktif Anda',
        type: 'email',
        required: true,
    },
    {
        key: 'noTelepon',
        label: 'Nomor Telepon',
        helper: 'Phone Number',
        placeholder: 'Masukkan nomor telepon Anda',
        required: true,
    },
    {
        key: 'keperluanData',
        label: 'Keperluan Data',
        helper: 'Purpose of Data Request',
        placeholder: 'Jelaskan keperluan data Anda',
        required: true,
    },
    {
        key: 'keterangan',
        label: 'Keterangan Tambahan',
        helper: 'Additional Notes (Optional)',
        placeholder: 'Tambahkan keterangan jika diperlukan',
        multiline: true,
        rows: 3,
    },
];

const RequestDataForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [formData, setFormData] = useState<RequestFormData>(createInitialState());
    const [errors, setErrors] = useState<RequestFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const fileName = useMemo(() => formData.suratInstitusi?.name ?? '', [formData.suratInstitusi]);

    const setFieldValue = (field: keyof RequestFormData, value: string | File | null) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFieldValue(name as keyof RequestFormData, value);
    };

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            toast({
                title: 'Format file tidak didukung',
                description: 'Gunakan PDF, DOC, DOCX, JPG, atau PNG.',
                variant: 'destructive',
            });
            event.target.value = '';
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast({
                title: 'Ukuran file terlalu besar',
                description: 'Ukuran maksimal file adalah 5MB.',
                variant: 'destructive',
            });
            event.target.value = '';
            return;
        }

        setFieldValue('suratInstitusi', file);
    };

    const removeFile = () => {
        setFieldValue('suratInstitusi', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = (): RequestFormErrors => {
        const nextErrors: RequestFormErrors = {};

        if (formData.namaLengkap.trim().length < 3) {
            nextErrors.namaLengkap = 'Nama lengkap minimal 3 karakter.';
        }
        if (formData.nikNim.trim().length < 6) {
            nextErrors.nikNim = 'NIK/NIM minimal 6 karakter.';
        }
        if (formData.institusi.trim().length < 2) {
            nextErrors.institusi = 'Institusi wajib diisi.';
        }
        if (formData.alamatInstitusi.trim().length < 8) {
            nextErrors.alamatInstitusi = 'Alamat institusi terlalu singkat.';
        }
        if (!validateEmail(formData.email.trim())) {
            nextErrors.email = 'Format email tidak valid.';
        }
        if (!validatePhone(formData.noTelepon.trim())) {
            nextErrors.noTelepon = 'Nomor telepon tidak valid.';
        }
        if (formData.keperluanData.trim().length < 8) {
            nextErrors.keperluanData = 'Keperluan data minimal 8 karakter.';
        }
        if (!formData.suratInstitusi) {
            nextErrors.suratInstitusi = 'Surat institusi wajib dilampirkan.';
        }

        return nextErrors;
    };

    const handleReset = () => {
        setFormData(createInitialState());
        setErrors({});
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        const formErrors = validateForm();
        setErrors(formErrors);

        if (Object.keys(formErrors).length > 0) {
            toast({
                title: 'Periksa kembali formulir',
                description: 'Masih ada data yang belum valid atau belum lengkap.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        navigate('/request-data/success', {
            state: {
                requesterName: formData.namaLengkap.trim(),
                institution: formData.institusi.trim(),
                requestedAt: new Date().toISOString(),
            },
        });
    };

    const fieldInputClass =
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#5478FF] focus:ring-4 focus:ring-[#5478FF]/15';

    return (
        <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='rounded-2xl border-l-4 border-[#111FA2] bg-[#FFDE42] p-5 shadow-md'>
                <div className='flex items-start gap-3 text-[#2d2d2d]'>
                    <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-[#111FA2]' />
                    <div className='space-y-1 text-sm'>
                        <p className='font-bold text-[#111FA2]'>Informasi Penting:</p>
                        <ul className='list-disc space-y-0.5 pl-4'>
                            <li>Format file yang didukung: PDF, DOC, DOCX, JPG, PNG</li>
                            <li>Ukuran maksimal file: 5MB</li>
                            <li>Pastikan semua data yang diisi sudah benar sebelum mengirim</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(17,31,162,0.12)]'>
                <div className='bg-gradient-to-r from-[#5478FF] to-[#53CBF3] px-6 py-8 text-center text-white'>
                    <h2 className='text-3xl font-extrabold tracking-wide sm:text-4xl'>DATA DIRI/BIODATA</h2>
                    <p className='mt-1 text-sm italic text-blue-100 sm:text-lg'>Personal Data Form</p>
                </div>

                <div className='space-y-2 p-5 sm:p-8'>
                    {textFields.map((field, index) => {
                        const fieldId = field.key;
                        const value = formData[field.key];
                        const error = errors[field.key];

                        return (
                            <div key={field.key} className='grid gap-3 border-b border-slate-200 py-4 lg:grid-cols-[270px_1fr] lg:items-start'>
                                <label htmlFor={fieldId} className='pt-2 text-lg font-semibold text-slate-700'>
                                    {index + 1}. {field.label}
                                    {field.required ? <span className='text-[#e63946]'> *</span> : null}
                                </label>
                                <div>
                                    {field.multiline ? (
                                        <textarea
                                            id={fieldId}
                                            name={field.key}
                                            value={value}
                                            onChange={handleTextChange}
                                            rows={field.rows ?? 3}
                                            className={fieldInputClass}
                                            placeholder={field.placeholder}
                                        />
                                    ) : (
                                        <input
                                            id={fieldId}
                                            name={field.key}
                                            type={field.type ?? 'text'}
                                            value={value}
                                            onChange={handleTextChange}
                                            className={fieldInputClass}
                                            placeholder={field.placeholder}
                                        />
                                    )}
                                    <p className='mt-2 text-sm italic text-[#5478FF]'>{field.helper}</p>
                                    {error ? <p className='mt-1 text-xs text-red-600'>{error}</p> : null}
                                </div>
                            </div>
                        );
                    })}

                    <div className='grid gap-3 border-b border-slate-200 py-4 lg:grid-cols-[270px_1fr] lg:items-start'>
                        <p className='pt-2 text-lg font-semibold text-slate-700'>9. Surat Institusi<span className='text-[#e63946]'> *</span></p>
                        <div>
                            <div className='flex flex-wrap items-center gap-3'>
                                <Button
                                    type='button'
                                    onClick={() => fileInputRef.current?.click()}
                                    className='h-11 gap-2 rounded-xl bg-[#111FA2] px-5 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b177d] hover:shadow-lg'
                                >
                                    <Upload className='h-4 w-4' />
                                    Pilih File
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    accept={ACCEPTED_FILE_EXT}
                                    onChange={handleFileSelect}
                                    className='hidden'
                                />
                            </div>

                            {fileName ? (
                                <div className='mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3'>
                                    <div className='flex min-w-0 items-center gap-2'>
                                        <FileText className='h-4 w-4 shrink-0 text-[#5478FF]' />
                                        <p className='truncate text-sm text-slate-700'>{fileName}</p>
                                    </div>
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='icon'
                                        onClick={removeFile}
                                        className='h-8 w-8 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600'
                                    >
                                        <X className='h-4 w-4' />
                                    </Button>
                                </div>
                            ) : null}

                            <p className='mt-2 text-sm italic text-[#5478FF]'>Upload Official Letter</p>
                            {errors.suratInstitusi ? <p className='mt-1 text-xs text-red-600'>{errors.suratInstitusi}</p> : null}
                        </div>
                    </div>

                    <div className='flex flex-wrap gap-3 pt-2'>
                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='h-11 rounded-xl bg-gradient-to-r from-[#5478FF] to-[#111FA2] px-6 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:from-[#466bf4] hover:to-[#0d1893] hover:shadow-lg'
                        >
                            {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleReset}
                            className='h-11 rounded-xl border-slate-300 px-6 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100'
                        >
                            Reset Form
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default RequestDataForm;