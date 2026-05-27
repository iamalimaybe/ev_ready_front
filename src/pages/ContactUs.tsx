import { type FormEvent, useState } from 'react';
import PageShell from '../components/PageShell';
import { ApiError, type BackendFieldErrors, apiClient } from '../utils/api';

type InquiryType =
  | 'GENERAL'
  | 'BUSINESS_COLLABORATION'
  | 'DEALER_OR_VENDOR'
  | 'CHARGER_PROVIDER'
  | 'SOLAR_OR_ELECTRICIAN'
  | 'FEEDBACK'
  | 'OTHER';

type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  organization: string;
  inquiryType: '' | InquiryType;
  message: string;
  consentAccepted: boolean;
};

type ContactRequestField = keyof ContactFormValues | 'sourcePage';
type ContactFieldErrors = Partial<Record<ContactRequestField, string>>;

const sourcePage = 'contact-us';

const initialFormValues: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  organization: '',
  inquiryType: '',
  message: '',
  consentAccepted: false,
};

const inquiryTypeOptions = [
  { value: 'GENERAL', label: 'General inquiry' },
  { value: 'BUSINESS_COLLABORATION', label: 'Business collaboration' },
  { value: 'DEALER_OR_VENDOR', label: 'Dealer or vendor' },
  { value: 'CHARGER_PROVIDER', label: 'Charger provider' },
  { value: 'SOLAR_OR_ELECTRICIAN', label: 'Solar or electrician partner' },
  { value: 'FEEDBACK', label: 'Feedback' },
  { value: 'OTHER', label: 'Other' },
] satisfies Array<{ value: InquiryType; label: string }>;

const inputClass =
  'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100';

const errorInputClass =
  'mt-2 w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100';

export default function ContactUs() {
  const [formValues, setFormValues] = useState<ContactFormValues>(initialFormValues);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<Key extends keyof ContactFormValues>(
    key: Key,
    value: ContactFormValues[Key],
  ) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
    setFieldErrors((currentErrors) => removeFieldError(currentErrors, key));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFieldErrors({});
    setGeneralError(null);
    setSuccessMessage(null);

    if (!formValues.inquiryType) {
      setFieldErrors({ inquiryType: 'Please select an inquiry type.' });
      return;
    }

    if (!formValues.consentAccepted) {
      setFieldErrors({ consentAccepted: 'Please accept consent before submitting.' });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post<unknown>('/api/v1/contact-submissions', {
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        organization: formValues.organization,
        inquiryType: formValues.inquiryType,
        message: formValues.message,
        consentAccepted: formValues.consentAccepted,
        sourcePage,
      });

      setSuccessMessage('Thanks. Your inquiry has been submitted.');
      setFormValues(initialFormValues);
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(mapFieldErrors(error.response.fieldErrors));
        setGeneralError(error.response.message || 'Your inquiry could not be submitted.');
      } else if (error instanceof Error) {
        setGeneralError(error.message);
      } else {
        setGeneralError('Your inquiry could not be submitted right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell eyebrow="Contact" title="Contact Us">
      <div className="space-y-6">
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          Send a general inquiry, business request, dealer or charger provider note, partner
          interest, feedback, or collaboration idea.
        </p>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Submitting this form sends an inquiry only. It does not confirm a partnership, booking,
          purchase, charger availability, or response time.
        </div>

        <form
          className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2"
          onSubmit={handleSubmit}
        >
          {successMessage ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800 sm:col-span-2">
              {successMessage}
            </div>
          ) : null}

          {generalError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800 sm:col-span-2">
              {generalError}
            </div>
          ) : null}

          <label className="text-sm font-medium text-slate-800">
            Name
            <input
              className={fieldErrors.name ? errorInputClass : inputClass}
              type="text"
              value={formValues.name}
              maxLength={120}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Your name"
            />
            <FieldError message={fieldErrors.name} />
          </label>

          <label className="text-sm font-medium text-slate-800">
            Email
            <input
              className={fieldErrors.email ? errorInputClass : inputClass}
              type="email"
              value={formValues.email}
              maxLength={160}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="you@example.com"
            />
            <FieldError message={fieldErrors.email} />
          </label>

          <label className="text-sm font-medium text-slate-800">
            Phone
            <input
              className={fieldErrors.phone ? errorInputClass : inputClass}
              type="tel"
              value={formValues.phone}
              maxLength={40}
              onChange={(event) => updateField('phone', event.target.value)}
              placeholder="03xx..."
            />
            <FieldError message={fieldErrors.phone} />
          </label>

          <label className="text-sm font-medium text-slate-800">
            Organization
            <input
              className={fieldErrors.organization ? errorInputClass : inputClass}
              type="text"
              value={formValues.organization}
              maxLength={160}
              onChange={(event) => updateField('organization', event.target.value)}
              placeholder="Company, shop, or team name"
            />
            <FieldError message={fieldErrors.organization} />
          </label>

          <label className="text-sm font-medium text-slate-800 sm:col-span-2">
            Inquiry type
            <select
              className={fieldErrors.inquiryType ? errorInputClass : inputClass}
              value={formValues.inquiryType}
              onChange={(event) =>
                updateField('inquiryType', event.target.value as ContactFormValues['inquiryType'])
              }
            >
              <option value="">Select inquiry type</option>
              {inquiryTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.inquiryType} />
          </label>

          <label className="text-sm font-medium text-slate-800 sm:col-span-2">
            Message
            <textarea
              className={fieldErrors.message ? errorInputClass : inputClass}
              value={formValues.message}
              maxLength={2000}
              rows={5}
              onChange={(event) => updateField('message', event.target.value)}
              placeholder="Tell us what you want to ask or share."
            />
            <FieldError message={fieldErrors.message} />
          </label>

          <label className="flex gap-3 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700 sm:col-span-2">
            <input
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              type="checkbox"
              checked={formValues.consentAccepted}
              onChange={(event) => updateField('consentAccepted', event.target.checked)}
            />
            <span>
              I agree that EVReady Pakistan may use this information to respond to my inquiry.
              <FieldError message={fieldErrors.consentAccepted} />
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-fit rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? 'Submitting...' : 'Submit inquiry'}
          </button>
        </form>
      </div>
    </PageShell>
  );
}

type FieldErrorProps = {
  message?: string;
};

function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return <span className="mt-2 block text-xs font-normal leading-5 text-red-700">{message}</span>;
}

function removeFieldError(fieldErrors: ContactFieldErrors, field: ContactRequestField) {
  const nextErrors = { ...fieldErrors };
  delete nextErrors[field];
  return nextErrors;
}

function mapFieldErrors(fieldErrors?: BackendFieldErrors): ContactFieldErrors {
  if (!fieldErrors) {
    return {};
  }

  if (Array.isArray(fieldErrors)) {
    return fieldErrors.reduce<ContactFieldErrors>((errors, fieldError) => {
      errors[fieldError.field as keyof ContactFieldErrors] = fieldError.message;
      return errors;
    }, {});
  }

  return Object.entries(fieldErrors).reduce<ContactFieldErrors>((errors, [field, message]) => {
    errors[field as keyof ContactFieldErrors] = message;
    return errors;
  }, {});
}
