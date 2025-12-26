import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import axios from '../../api/axios';
import FormInput from '../common/FormInput';

function toDateInputString(date) {
  if (!date) return '';
  if (Array.isArray(date) && date.length === 3) {
    // Convert [YYYY, M, D] to 'YYYY-MM-DD'
    const [year, month, day] = date;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    if (date.includes('T')) return date.split('T')[0];
    // MM/DD/YYYY or M/D/YYYY
    const parts = date.split(/[\/\-]/);
    if (parts.length === 3 && parts[2].length === 4) {
      const [month, day, year] = parts;
      return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    if (parts.length === 3 && parts[0].length === 4) {
      return date;
    }
    return date;
  }
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return '';
}

const StudentFormModal = ({ isOpen, onClose, mode, student, onSuccess }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    admissionDate: '',
    classId: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    // Fetch classes when the modal is opened
    if (isOpen) {
      const fetchClasses = async () => {
        try {
          const response = await axios.get('/classes');
          setClasses(response.data);
        } catch (err) {
          console.error("Failed to fetch classes:", err);
          setError("Could not load classes. Please try again.");
        }
      };
      fetchClasses();
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset form state when modal opens or student changes
    if (isOpen) {
      if (mode === 'edit' && student) {
        setForm({
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          email: student.email || '',
          phone: student.phone || '',
          dateOfBirth: toDateInputString(student.dateOfBirth), // FIX: Normalize date
          gender: student.gender || '',
          admissionDate: toDateInputString(student.admissionDate), // FIX: Normalize date
          classId: student.classId ? String(student.classId) : (student.schoolClass?.id ? String(student.schoolClass.id) : ''),
          address: student.address || '',
        });
      } else {
        setForm({
          firstName: '', lastName: '', email: '', phone: '',
          dateOfBirth: '', gender: '', admissionDate: '', classId: '',
          address: '',
        });
      }
      setError('');
      setSuccessData(null);
      setFieldErrors({}); // Clear field errors on modal open
    }
  }, [isOpen, mode, student]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' })); // Clear specific field error on change
  };

  // Validation logic before submit
  const validate = () => {
    const errors = [];
    if (!form.firstName.trim()) {
      errors.push("First name cannot be empty. Please enter the student's first name.");
    }
    if (!form.lastName.trim()) {
      errors.push("Last name is required.");
    }
    if (!form.email.trim()) {
      errors.push("Please provide a valid email address.");
    }
    if (!form.phone.trim()) {
      errors.push("Phone number is required and must match the school format.");
    }
    if (!form.dateOfBirth) {
      errors.push("Please select the student's date of birth.");
    }
    if (!form.admissionDate) {
      errors.push("Please select the admission date.");
    }
    if (!form.gender) {
      errors.push("Please select a gender.");
    }
    setError(errors.join('\n'));
    return errors.length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (!validate()) return;
    setLoading(true);

    // Trim phone before sending
    const trimmedForm = { ...form, phone: form.phone.trim() };

    try {
      if (mode === 'add') {
        const payload = { ...trimmedForm, role: 'ROLE_STUDENT' };
        // Ensure classId is a number or null
        if (payload.classId === '' || payload.classId === undefined) payload.classId = null;
        else payload.classId = Number(payload.classId);
        // Treat empty address as null
        if (!payload.address || payload.address.trim() === '') payload.address = null;
        const response = await axios.post('/auth/register', payload);
        setSuccessData(response.data);
        if (onSuccess) onSuccess(); // Call immediately after save
      } else {
        const updatePayload = {
          ...trimmedForm,
          dateOfBirth: trimmedForm.dateOfBirth || null,
          admissionDate: trimmedForm.admissionDate || null,
          classId: trimmedForm.classId === '' ? null : Number(trimmedForm.classId),
          address: !trimmedForm.address || trimmedForm.address.trim() === '' ? null : trimmedForm.address,
        };
        const res = await axios.put(`/students/${student.id}`, updatePayload);
        if (res.status === 200 || res.status === 204) {
          if (onSuccess) onSuccess(); // Call immediately after save
          handleClose();
        } else {
          setError(res.data?.message || 'Failed to update student. Please check your input and try again.');
        }
      }
    } catch (err) {
      console.error("Error saving student:", err.response?.data || err);
      let errorMessage = 'Failed to save student. Please check your input.';

      if (err.response?.status === 409 && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data) {
        errorMessage = typeof err.response.data === 'string'
          ? err.response.data
          : JSON.stringify(err.response.data);
      }

      setError(errorMessage);
      let backendMsg = err.response?.data?.message;
      if (backendMsg) {
        if (backendMsg.toLowerCase().includes('email')) {
          setFieldErrors((prev) => ({ ...prev, email: backendMsg }));
        } else if (backendMsg.toLowerCase().includes('phone')) {
          setFieldErrors((prev) => ({ ...prev, phone: backendMsg }));
        } else {
          setError(backendMsg);
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };


  if (successData) {
    return (
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
          {/* ... backdrop ... */}
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="text-center">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Student Created Successfully!</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Please save these credentials. They will not be shown again.</p>
                  <div className="mt-4 space-y-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-4 text-left">
                    <p><strong>School ID:</strong> <span className="font-mono text-indigo-600 dark:text-indigo-400">{successData.schoolId}</span></p>
                    <p><strong>Password:</strong> <span className="font-mono text-indigo-600 dark:text-indigo-400">{successData.password}</span></p>
                  </div>
                </div>
                <div className="mt-6">
                  <button type="button" onClick={handleClose} className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700">Close</button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    )
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} /* ... backdrop transition ... */>
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
              <div className="flex items-start justify-between">
                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                  {mode === 'add' ? 'Add New Student' : 'Edit Student'}
                </Dialog.Title>
                <button onClick={handleClose}><XMarkIcon className="h-6 w-6 text-gray-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="First Name" name="firstName" value={form.firstName} onChange={handleChange} />
                  {fieldErrors.firstName && <div className="text-sm text-red-500">{fieldErrors.firstName}</div>}
                  <FormInput label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
                  {fieldErrors.lastName && <div className="text-sm text-red-500">{fieldErrors.lastName}</div>}
                </div>
                <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
                {fieldErrors.email && <div className="text-sm text-red-500">{fieldErrors.email}</div>}
                <FormInput label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
                {fieldErrors.phone && <div className="text-sm text-red-500">{fieldErrors.phone}</div>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
                  {fieldErrors.dateOfBirth && <div className="text-sm text-red-500">{fieldErrors.dateOfBirth}</div>}
                  <FormInput label="Admission Date" name="admissionDate" type="date" value={form.admissionDate} onChange={handleChange} />
                  {fieldErrors.admissionDate && <div className="text-sm text-red-500">{fieldErrors.admissionDate}</div>}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {fieldErrors.gender && <div className="text-sm text-red-500">{fieldErrors.gender}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign to Class</label>
                    <select name="classId" value={form.classId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
                      <option value="">No class assigned</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <input
                  type="text"
                  name="address"
                  value={form.address || ''}
                  onChange={handleChange}
                  placeholder="Address"
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white dark:bg-gray-700/50 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 mb-3"
                />

                {error && <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0"><InformationCircleIcon className="h-5 w-5 text-red-400" /></div>
                    <div className="ml-3"><p className="text-sm text-red-700 dark:text-red-300">{error}</p></div>
                  </div>
                </div>}

                <div className="pt-4 flex justify-end gap-x-2">
                  <button type="button" onClick={handleClose} className="rounded-md bg-white dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                  <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? 'Saving...' : (mode === 'add' ? 'Create Student' : 'Save Changes')}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default StudentFormModal;