import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import api from '../../api/axios';

const ClassFormModal = ({ isOpen, onClose, onSuccess, initialData }) => {

  const [form, setForm] = useState({ name: '', teachers: [] });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [allTeachers, setAllTeachers] = useState([]);

  useEffect(() => {
    
    if (initialData) {
     
      setForm({ name: initialData.name || '', teachers: initialData.teacherIds || [] });
    } else {
      setForm({ name: '', teachers: [] });
    }
    setErrorMessage('');
  }, [initialData, isOpen]);

  useEffect(() => {
  
    if (isOpen) {
      api.get('/teachers')
        .then(res => setAllTeachers(res.data))
        .catch(() => setAllTeachers([]));
    }
  }, [isOpen]);


    const handleClose = () => {
    if (loading) return;
    onClose();
  };
  const handleInputChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTeacherChange = (teacherId) => {
    const teachersSet = new Set(form.teachers);
    if (teachersSet.has(teacherId)) {
      teachersSet.delete(teacherId);
    } else {
      teachersSet.add(teacherId);
    }
    setForm(prev => ({ ...prev, teachers: Array.from(teachersSet) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const payload = {
      name: form.name,
      teacherIds: form.teachers,
    };

    try {
      let response;
      if (initialData) {
        response = await api.put(`/classes/${initialData.id}`, payload);
      } else {
        response = await api.post('/classes', payload);
      }
      onSuccess(response.data);
      handleClose();
      
      
    } catch (error) {
      console.error('Error saving class:', error.response?.data || error.message);
      const backendMessage = error.response?.data?.message;
      if (backendMessage) {
        setErrorMessage(backendMessage);
      } else if (error.response?.status === 403) {
        setErrorMessage('Permission denied. You may not have the rights to perform this action.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 mb-6">
                      {initialData ? 'Edit Class' : 'Create New Class'}
                    </Dialog.Title>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Class Name/Level</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={form.name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="e.g. Grade 10 - A"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign Teachers <span className="text-gray-400 italic text-sm">({form.teachers.length} selected)</span></label>
                        <div className="border rounded-md p-2 h-40 overflow-y-auto">
                          {allTeachers.length > 0 ? (
                            <div className="flex flex-col gap-2 p-1">
                              {allTeachers.map((teacher) => (
                                <div key={teacher.id} className="flex items-center">
                                  <input
                                    id={`teacher-${teacher.id}`}
                                    name="teachers"
                                    type="checkbox"
                                    checked={form.teachers.includes(teacher.id)}
                                    onChange={() => handleTeacherChange(teacher.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <label htmlFor={`teacher-${teacher.id}`} className="ml-3 text-sm text-gray-600">
                                    {teacher.firstName} {teacher.lastName}
                                  </label>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No teachers available</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">You can assign multiple teachers to a class.</span>
                      {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Class')}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ClassFormModal;