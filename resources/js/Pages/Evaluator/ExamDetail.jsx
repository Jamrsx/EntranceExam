import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';

export default function ExamDetail({ user, evaluator, exam }) {
    const [title, setTitle] = useState(exam?.exam_title || exam?.title || '');
    const [timeLimit, setTimeLimit] = useState(exam?.time_limit || 60);
    const [status, setStatus] = useState(exam?.status ?? 1);

    const save = (e) => {
        e.preventDefault();
        router.put(`/evaluator/department-exams/${exam.id}`, { exam_title: title, time_limit: timeLimit, status }, {
            onSuccess: () => window.showAlert('Exam updated', 'success'),
            onError: () => window.showAlert('Failed to update exam', 'error')
        });
    };

    return (
        <Layout user={user}>
            <div className="max-w-5xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Exam Detail</h1>
                    <p className="text-gray-500 text-sm">Ref: {exam.exam_ref_no}</p>
                </div>

                <form onSubmit={save} className="bg-white p-6 rounded-lg shadow space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                        <input type="number" min={1} value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value || '0'))} className="w-40 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select value={status} onChange={(e) => setStatus(parseInt(e.target.value))} className="w-40 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </select>
                    </div>
                    <div className="pt-3 border-t">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}


