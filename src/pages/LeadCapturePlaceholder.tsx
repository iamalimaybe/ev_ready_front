import { type FormEvent, useState } from 'react';
import PageShell from '../components/PageShell';
import { ApiError, type BackendFieldErrors, apiClient } from '../utils/api';

type LeadFormValues = {
  name: string;
  phone: string;
  city: string;
  selectedInterestOptionId: string;
  message: string;
  consentAccepted: boolean;
};

type LeadInterestType = 'EV_BIKE' | 'EV_CAR' | 'HOME_CHARGER' | 'SOLAR' | 'OTHER';

type LeadRequestField = Exclude<keyof LeadFormValues, 'selectedInterestOptionId'> | 'interestType' | 'sourcePage';
type LeadFieldErrors = Partial<Record<LeadRequestField, string>>;

type LeadSubmissionResponse = {
  id: string;
  leadStatus: string;
  message?: string;
};

const sourcePage = 'get-help';

const initialFormValues: LeadFormValues = {
  name: '',
  phone: '',
  city: '',
  selectedInterestOptionId: '',
  message: '',
  consentAccepted: false,
};

const inputClass =
  'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100';

const errorInputClass =
  'mt-2 w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100';

const interestOptions = [
  { id: 'ev-bike-dealer', interestType: 'EV_BIKE', label: 'EV bike dealer contact' },
  { id: 'ev-car-dealer', interestType: 'EV_CAR', label: 'EV car dealer contact' },
  { id: 'home-charger', interestType: 'HOME_CHARGER', label: 'Home charger installation' },
  { id: 'solar', interestType: 'SOLAR', label: 'Solar EV charging setup' },
  { id: 'electrician-guidance', interestType: 'OTHER', label: 'Electrician guidance' },
  { id: 'not-sure', interestType: 'OTHER', label: 'Not sure yet' },
] satisfies Array<{ id: string; interestType: LeadInterestType; label: string }>;

export default function LeadCapturePlaceholder() {
  const [formValues, setFormValues] = useState<LeadFormValues>(initialFormValues);
  const [fieldErrors, setFieldErrors] = useState<LeadFieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<Key extends keyof LeadFormValues>(key: Key, value: LeadFormValues[Key]) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
    setFieldErrors((currentErrors) => {
      return key === 'selectedInterestOptionId'
        ? currentErrors
        : removeFieldError(currentErrors, key);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFieldErrors({});
    setGeneralError(null);
    setSuccessMessage(null);

    if (!formValues.consentAccepted) {
      setFieldErrors({ consentAccepted: 'Please accept consent before submitting.' });
      return;
    }

    const selectedInterestOption = interestOptions.find(
      (option) => option.id === formValues.selectedInterestOptionId,
    );

    if (!selectedInterestOption) {
      setFieldErrors({ interestType: 'Please select the kind of help you need.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post<LeadSubmissionResponse>('/api/v1/leads', {
        name: formValues.name,
        phone: formValues.phone,
        city: formValues.city,
        interestType: selectedInterestOption.interestType,
        message: formValues.message,
        sourcePage,
        consentAccepted: formValues.consentAccepted,
      });

      setSuccessMessage(
        response.message || 'Thanks. Your request has been received and the team can follow up.',
      );
      setFormValues(initialFormValues);
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(mapFieldErrors(error.response.fieldErrors));
        setGeneralError(getLeadSubmissionErrorMessage(error.response.message));
      } else if (error instanceof Error) {
        setGeneralError(error.message);
      } else {
        setGeneralError('Your request could not be submitted right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell eyebrow="Get Help" title="Get EV Help">
      <div className="space-y-6">
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          Share what kind of EV help you need. EVReady Pakistan can use this request to connect you
          with practical guidance for EV buying, charging, solar setup, or electrical work.
        </p>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Submitting this form does not confirm a booking, price, charger availability, or purchase.
          Please verify all details before making a decision.
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(320px,1fr)]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Help available for</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>EV bike dealer contact</li>
              <li>EV car dealer contact</li>
              <li>Home charger installation</li>
              <li>Solar EV charging setup</li>
              <li>Electrician guidance</li>
            </ul>
          </section>

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
              City
              <input
                className={fieldErrors.city ? errorInputClass : inputClass}
                type="text"
                value={formValues.city}
                maxLength={100}
                onChange={(event) => updateField('city', event.target.value)}
                placeholder="Lahore, Karachi, Islamabad..."
              />
              <FieldError message={fieldErrors.city} />
            </label>

            <label className="text-sm font-medium text-slate-800">
              WhatsApp / phone number
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
              Help needed
              <select
                className={fieldErrors.interestType ? errorInputClass : inputClass}
                value={formValues.selectedInterestOptionId}
                onChange={(event) => {
                  updateField('selectedInterestOptionId', event.target.value);
                  setFieldErrors((currentErrors) => {
                    const nextErrors = { ...currentErrors };
                    delete nextErrors.interestType;
                    return nextErrors;
                  });
                }}
              >
                <option value="">Select help type</option>
                {interestOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors.interestType} />
            </label>

            <label className="text-sm font-medium text-slate-800 sm:col-span-2">
              Message
              <textarea
                className={fieldErrors.message ? errorInputClass : inputClass}
                value={formValues.message}
                maxLength={2000}
                rows={4}
                onChange={(event) => updateField('message', event.target.value)}
                placeholder="Tell us what you are considering, your budget, or the charging help you need."
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
                I agree that EVReady Pakistan may use this information to respond to my request.
                <FieldError message={fieldErrors.consentAccepted} />
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-fit rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? 'Submitting...' : 'Submit request'}
            </button>
          </form>
        </div>
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

function removeFieldError(fieldErrors: LeadFieldErrors, field: LeadRequestField) {
  const nextErrors = { ...fieldErrors };
  delete nextErrors[field];
  return nextErrors;
}

function mapFieldErrors(fieldErrors?: BackendFieldErrors): LeadFieldErrors {
  if (!fieldErrors) {
    return {};
  }

  if (Array.isArray(fieldErrors)) {
    return fieldErrors.reduce<LeadFieldErrors>((errors, fieldError) => {
      errors[fieldError.field as keyof LeadFieldErrors] = fieldError.message;
      return errors;
    }, {});
  }

  return Object.entries(fieldErrors).reduce<LeadFieldErrors>((errors, [field, message]) => {
    errors[field as keyof LeadFieldErrors] = message;
    return errors;
  }, {});
}

function getLeadSubmissionErrorMessage(message: string) {
  if (message.toLowerCase().includes('invalid request body')) {
    return `${message} Please check the selected help type and try again.`;
  }

  return message || 'Your request could not be submitted.';
}
