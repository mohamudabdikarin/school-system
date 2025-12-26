import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import axios from '../../api/axios';
import FormInput from '../common/FormInput';

const TeacherFormModal = ({ isOpen, onClose, mode, teacher, onSuccess }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: '',
    address: '',
    gender: '',
    hireDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && teacher) {
        setForm({
          firstName: teacher.firstName || '',
          lastName: teacher.lastName || '',
          email: teacher.email || teacher.user?.email || '',
          phone: teacher.phone || '',
          specialization: teacher.specialization || '',
          qualification: teacher.qualification || '',
          experience: teacher.experience || '',
          address: teacher.address || '',
          gender: teacher.gender || '',
          hireDate: teacher.hireDate || '',
        });
      } else {
        setForm({ firstName: '', lastName: '', email: '', phone: '', specialization: '', qualification: '', experience: '', address: '', gender: '', hireDate: '' });
      }
      setError('');
      setSuccessData(null);
    }
  }, [isOpen, mode, teacher]);

  const handleClose = () => { if (!loading) onClose(); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Validation logic before submit
  const validate = () => {
    const errors = [];
    if (!form.firstName.trim()) {
      errors.push("First name cannot be empty. Please enter the teacher's first name.");
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
    if (!form.gender) {
      errors.push("Please select a gender.");
    }
    if (!form.hireDate) {
      errors.push("Please select the hire date.");
    }
    setError(errors.join('\n'));
    return errors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    if (!validate()) return;

    setLoading(true);

    // Trim phone before sending
    const trimmedForm = { ...form, phone: form.phone.trim() };

    try {
      if (mode === 'add') {
        const response = await axios.post('/auth/register', { ...trimmedForm, role: 'ROLE_TEACHER' });
        setSuccessData(response.data);
        if (onSuccess) onSuccess(); // Call immediately after save
      } else {
        await axios.put(`/teachers/${teacher.id}`, {
          ...trimmedForm
        });
        if (onSuccess) onSuccess(); // Call immediately after save
        handleClose();
      }
    } catch (err) {
      // Backend error handling
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

  const handleSuccessClose = () => {
    setSuccessData(null);
    handleClose();
    if (onSuccess) onSuccess();
  };

  if (successData) {
    return (
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="relative w-full max-w-md transform rounded-2xl bg-white dark:bg-gray-800 p-6 text-center shadow-xl">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Teacher Created!</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Please save these credentials. They are not recoverable.</p>
                <div className="mt-4 space-y-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-4 text-left">
                  <p><strong>School ID:</strong> <span className="font-mono">{successData.schoolId}</span></p>
                  <p><strong>Password:</strong> <span className="font-mono">{successData.password}</span></p>
                </div>
                <div className="mt-6"><button type="button" onClick={handleSuccessClose} className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Close</button></div>
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
        <Transition.Child as={Fragment}><div className="fixed inset-0 bg-gray-500 bg-opacity-75" /></Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="relative w-full max-w-lg transform rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">{mode === 'add' ? 'Add New Teacher' : 'Edit Teacher'}</Dialog.Title>
                <button onClick={handleClose}><XMarkIcon className="h-6 w-6 text-gray-500" /></button>
              </div>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
                  {fieldErrors.firstName && <p className="text-sm text-red-500">{fieldErrors.firstName}</p>}
                  <FormInput label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
                  {fieldErrors.lastName && <p className="text-sm text-red-500">{fieldErrors.lastName}</p>}
                </div>
                <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
                {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
                  {fieldErrors.phone && <p className="text-sm text-red-500">{fieldErrors.phone}</p>}
                  <FormInput label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="Qualification" name="qualification" value={form.qualification} onChange={handleChange} />
                  <FormInput label="Experience (years)" name="experience" type="number" min="0" value={form.experience} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  {fieldErrors.gender && <p className="text-sm text-red-500">{fieldErrors.gender}</p>}
                  <FormInput label="Hire Date" name="hireDate" type="date" value={form.hireDate} onChange={handleChange} />
                  {fieldErrors.hireDate && <p className="text-sm text-red-500">{fieldErrors.hireDate}</p>}
                </div>
                <FormInput label="Address" name="address" value={form.address} onChange={handleChange} />
                {error && <div className="text-sm text-red-500 whitespace-pre-line mt-4">{error}</div>}
                <div className="pt-4 flex justify-end gap-x-2">
                  <button type="button" onClick={handleClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default TeacherFormModal;