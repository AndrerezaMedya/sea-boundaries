import { type ChangeEvent, type FormEvent, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, FileText, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { submitDataRequest, type RequestFormData } from '@/lib/submitDataRequest';
import { useWebGisT } from '@/i18n/useWebGisT';

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
    const { t } = useWebGisT();
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

    const handleSubmit = async (event: FormEvent) => {
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
        try {
            const result = await submitDataRequest(formData);
            navigate('/request-data/success', {
                state: {
                    requesterName: formData.namaLengkap.trim(),
                    institution: formData.institusi.trim(),
                    requestedAt: result.created_at || new Date().toISOString(),
                    requestId: result.id,
                },
            });
        } catch (err) {
            console.error('Data request submit failed:', err);
            toast({
                title: 'Pengajuan gagal',
                description: err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim permintaan.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const fieldInputClass =
        'w-full rounded-xl border border-[#c9daf9] bg-white/88 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#5478FF] focus:ring-4 focus:ring-[#5478FF]/15';

    const getFieldI18n = (key: string) => {
        switch (key) {
            case 'namaLengkap': return { label: t('portalRequest.form.fields.name'), helper: t('portalRequest.form.fields.nameHelper'), placeholder: t('portalRequest.form.fields.namePlaceholder') };
            case 'nikNim': return { label: t('portalRequest.form.fields.nik'), helper: t('portalRequest.form.fields.nikHelper'), placeholder: t('portalRequest.form.fields.nikPlaceholder') };
            case 'institusi': return { label: t('portalRequest.form.fields.inst'), helper: t('portalRequest.form.fields.instHelper'), placeholder: t('portalRequest.form.fields.instPlaceholder') };
            case 'alamatInstitusi': return { label: t('portalRequest.form.fields.instAddress'), helper: t('portalRequest.form.fields.instAddressHelper'), placeholder: t('portalRequest.form.fields.instAddressPlaceholder') };
            case 'email': return { label: t('portalRequest.form.fields.email'), helper: t('portalRequest.form.fields.emailHelper'), placeholder: t('portalRequest.form.fields.emailPlaceholder') };
            case 'noTelepon': return { label: t('portalRequest.form.fields.phone'), helper: t('portalRequest.form.fields.phoneHelper'), placeholder: t('portalRequest.form.fields.phonePlaceholder') };
            case 'keperluanData': return { label: t('portalRequest.form.fields.purpose'), helper: t('portalRequest.form.fields.purposeHelper'), placeholder: t('portalRequest.form.fields.purposePlaceholder') };
            case 'keterangan': return { label: t('portalRequest.form.fields.notes'), helper: t('portalRequest.form.fields.notesHelper'), placeholder: t('portalRequest.form.fields.notesPlaceholder') };
            default: return { label: '', helper: '', placeholder: '' };
        }
    };

    return (
        <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='rounded-2xl border border-[#c9daf9] bg-[linear-gradient(160deg,#f8fbff_0%,#edf4ff_100%)] p-5 shadow-[0_14px_32px_rgba(13,32,112,0.1)]'>
                <div className='flex items-start gap-3 text-slate-700'>
                    <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-[#3552d6]' />
                    <div className='space-y-1 text-sm'>
                        <p className='font-semibold text-[#111FA2]'>{t('portalRequest.form.warningTitle')}</p>
                        <ul className='list-disc space-y-0.5 pl-4'>
                            <li>{t('portalRequest.form.warning1')}</li>
                            <li>{t('portalRequest.form.warning2')}</li>
                            <li>{t('portalRequest.form.warning3')}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className='overflow-hidden rounded-2xl border border-[#cfdcf8] bg-white/78 shadow-[0_16px_40px_rgba(17,31,162,0.1)] backdrop-blur-sm'>
                <div className='border-b border-[#dce6fb] bg-[linear-gradient(160deg,#f7faff_0%,#edf4ff_100%)] px-6 py-7 text-center'>
                    <h2 className='font-sans text-3xl font-semibold tracking-tight text-[#101f8f] sm:text-4xl'>{t('portalRequest.form.headerTitle')}</h2>
                    <p className='mt-1 text-sm text-[#4363d0] sm:text-base'>{t('portalRequest.form.headerSubtitle')}</p>
                </div>

                <div className='space-y-2 p-5 sm:p-8'>
                    {textFields.map((field, index) => {
                        const fieldId = field.key;
                        const value = formData[field.key];
                        const error = errors[field.key];
                        const { label, helper, placeholder } = getFieldI18n(field.key);

                        return (
                            <div key={field.key} className='grid gap-3 border-b border-[#e1eafc] py-4 lg:grid-cols-[270px_1fr] lg:items-start'>
                                <label htmlFor={fieldId} className='pt-2 text-lg font-semibold text-[#1b2f93]'>
                                    {index + 1}. {label}
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
                                            placeholder={placeholder}
                                        />
                                    ) : (
                                        <input
                                            id={fieldId}
                                            name={field.key}
                                            type={field.type ?? 'text'}
                                            value={value}
                                            onChange={handleTextChange}
                                            className={fieldInputClass}
                                            placeholder={placeholder}
                                        />
                                    )}
                                    <p className='mt-2 text-sm italic text-[#4d6cdc]'>{helper}</p>
                                    {error ? <p className='mt-1 text-xs text-red-600'>{error}</p> : null}
                                </div>
                            </div>
                        );
                    })}

                    <div className='grid gap-3 border-b border-[#e1eafc] py-4 lg:grid-cols-[270px_1fr] lg:items-start'>
                        <p className='pt-2 text-lg font-semibold text-[#1b2f93]'>9. {t('portalRequest.form.fields.letter')}<span className='text-[#e63946]'> *</span></p>
                        <div>
                            <div className='flex flex-wrap items-center gap-3'>
                                <Button
                                    type='button'
                                    onClick={() => fileInputRef.current?.click()}
                                    className='h-11 gap-2 rounded-xl bg-[#111FA2] px-5 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b177d] hover:shadow-[0_10px_24px_rgba(17,31,162,0.3)]'
                                >
                                    <Upload className='h-4 w-4' />
                                    {t('portalRequest.form.fields.chooseFile')}
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
                                <div className='mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#d9e4fb] bg-[#f7faff] p-3'>
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

                            <p className='mt-2 text-sm italic text-[#4d6cdc]'>{t('portalRequest.form.fields.letterHelper')}</p>
                            {errors.suratInstitusi ? <p className='mt-1 text-xs text-red-600'>{errors.suratInstitusi}</p> : null}
                        </div>
                    </div>

                    <div className='flex flex-wrap gap-3 pt-2'>
                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='h-11 rounded-xl bg-gradient-to-r from-[#5478FF] to-[#111FA2] px-6 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:from-[#466bf4] hover:to-[#0d1893] hover:shadow-[0_12px_28px_rgba(17,31,162,0.28)]'
                        >
                            {isSubmitting ? t('portalRequest.form.submitting') : t('portalRequest.form.submit')}
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleReset}
                            className='h-11 rounded-xl border-[#c9daf9] bg-white/70 px-6 text-sm font-semibold text-[#1a2f92] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#edf4ff]'
                        >
                            {t('portalRequest.form.reset')}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default RequestDataForm;