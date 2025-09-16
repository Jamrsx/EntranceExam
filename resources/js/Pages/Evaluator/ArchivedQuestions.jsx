import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';

export default function ArchivedQuestions({ user, evaluator, questions, categories, filters }) {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(filters?.category || '');

    const handleSelectQuestion = (questionId) => {
        setSelectedQuestions(prev => prev.includes(questionId)
            ? prev.filter(id => id !== questionId)
            : [...prev, questionId]);
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedQuestions([]);
        } else {
            setSelectedQuestions(questions.data.map(q => q.questionId));
        }
        setSelectAll(!selectAll);
    };

    const handleRestore = (id) => {
        router.put(`/evaluator/question-bank/${id}/restore`, {}, {
            onSuccess: () => window.showAlert('Question restored successfully', 'success'),
            onError: () => window.showAlert('Failed to restore question', 'error')
        });
    };

    const handleBulkRestore = () => {
        if (selectedQuestions.length === 0) {
            window.showAlert('Please select questions to restore', 'warning');
            return;
        }
        router.post('/evaluator/question-bank/bulk-restore', { questionIds: selectedQuestions }, {
            onSuccess: () => {
                setSelectedQuestions([]);
                setSelectAll(false);
                window.showAlert('Questions restored successfully', 'success');
            },
            onError: () => window.showAlert('Failed to restore questions', 'error')
        });
    };

    const applyCategory = (category) => {
        const url = new URL(window.location);
        if (category) url.searchParams.set('category', category); else url.searchParams.delete('category');
        window.location.href = url.toString();
    };

    return (
        <Layout user={user}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Archived Questions</h1>
                            <p className="mt-1 text-amber-100">Manage archived items for {evaluator?.Department}</p>
                        </div>
                        <a href="/evaluator/question-bank" className="bg-white bg-opacity-20 text-black px-4 py-2 rounded-lg hover:bg-opacity-30">Back to Question Bank</a>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-700">Category</label>
                            <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); applyCategory(e.target.value); }} className="border rounded px-2 py-1 text-sm">
                                <option value="">All</option>
                                {categories?.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <button onClick={handleBulkRestore} className="bg-green-600 text-white px-3 py-2 rounded">Restore Selected</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2">
                                        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {questions.data.map((q) => (
                                    <tr key={q.questionId}>
                                        <td className="px-3 py-2">
                                            <input type="checkbox" checked={selectedQuestions.includes(q.questionId)} onChange={() => handleSelectQuestion(q.questionId)} />
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900">{q.question}</td>
                                        <td className="px-3 py-2 text-xs text-gray-500">{q.updated_at}</td>
                                        <td className="px-3 py-2 text-sm">
                                            <button onClick={() => handleRestore(q.questionId)} className="text-green-700 hover:text-green-900">Restore</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}


