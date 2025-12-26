import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from '../../api/axios';
import FormInput from '../common/FormInput';

const CourseFormModal = ({ isOpen, onClose, mode, course, onSuccess }) => {
    const [form, setForm] = useState({ courseName: '', courseCode: '', description: '', teacherId: '' });
    const [teachers, setTeachers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchTeachers = async () => {
                try {
                    const response = await axios.get('/teachers');
                    setTeachers(response.data);
                } catch (err) {
                    setError('Failed to load teachers.');
                }
            };
            fetchTeachers();

            if (mode === 'edit' && course) {
                setForm({
                    courseName: course.courseName || '',
                    courseCode: course.courseCode || '',
                    description: course.description || '',
                    teacherId: course.teacher?.id || '',
                });
            } else {
                setForm({ courseName: '', courseCode: '', description: '', teacherId: '' });
            }
            setError('');
        }
    }, [isOpen, mode, course]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const payload = { ...form, teacher: form.teacherId ? { id: form.teacherId } : null };
        delete payload.teacherId;

        try {
            if (mode === 'add') {
                await axios.post('/courses', payload);
            } else {
                await axios.put(`/courses/${course.id}`, payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${mode} course.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment}><div className="fixed inset-0 bg-gray-500 bg-opacity-75" /></Transition.Child>
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="relative w-full max-w-lg transform rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
                            <div className="flex items-start justify-between">
                                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">{mode === 'add' ? 'Create New Course' : 'Edit Course'}</Dialog.Title>
                                <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-500" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormInput label="Course Name" name="courseName" value={form.courseName} onChange={handleChange} required />
                                    <FormInput label="Course Code" name="courseCode" value={form.courseCode} onChange={handleChange} required />
                                </div>
                                <FormInput label="Description" name="description" value={form.description} onChange={handleChange} />
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Removed Credits input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign Teacher</label>
                                        <select name="teacherId" value={form.teacherId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
                                            <option value="">No teacher</option>
                                            {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {error && <div className="rounded-md bg-red-50 p-4"><p className="text-sm text-red-700">{error}</p></div>}
                                <div className="pt-4 flex justify-end gap-x-2">
                                    <button type="button" onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
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

export default CourseFormModal;