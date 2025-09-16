import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';

export default function DepartmentExams({ user, evaluator, exams, categories = [], questions = [], routes }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        exam_title: '',
        time_limit: 60,
        exam_type: 'manual',
        question_ids: [],
        category_counts: {}
    });
    const [filterCategory, setFilterCategory] = useState('');
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [examSearch, setExamSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    // Group questions by category
    const questionsByCategory = useMemo(() => {
        const grouped = {};
        (questions || []).forEach((q) => {
            if (filterCategory && q.category !== filterCategory) return;
            if (searchText && !(`${q.question}`.toLowerCase().includes(searchText.toLowerCase()))) return;
            if (!grouped[q.category]) grouped[q.category] = [];
            grouped[q.category].push(q);
        });
        return grouped;
    }, [questions, filterCategory, searchText]);

    const toggleQuestion = (id) => {
        setFormData((prev) => {
            const exists = prev.question_ids.includes(id);
            const nextIds = exists ? prev.question_ids.filter((x) => x !== id) : [...prev.question_ids, id];
            return { ...prev, question_ids: nextIds };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Creating department exam with data:', formData);
        router.post('/evaluator/department-exams', formData, {
            onStart: () => setIsSubmitting(true),
            onSuccess: () => {
                window.showAlert('Department exam created successfully', 'success');
                setShowCreateForm(false);
                setFormData({ exam_title: '', time_limit: 60, exam_type: 'manual', question_ids: [], category_counts: {} });
            },
            onError: (errors) => {
                console.error('Create exam errors:', errors);
                window.showAlert('Failed to create exam', 'error');
            },
            onFinish: () => setIsSubmitting(false)
        });
    };

    // Exams filter/search (client-side)
    const filteredExams = useMemo(() => {
        let list = exams || [];
        if (statusFilter !== 'all') {
            const target = statusFilter === 'active' ? 1 : 0;
            list = list.filter((e) => Number(e.status) === target);
        }
        if (examSearch.trim() !== '') {
            const term = examSearch.toLowerCase();
            list = list.filter((e) => `${e.title} ${e.exam_ref_no}`.toLowerCase().includes(term));
        }
        return list;
    }, [exams, statusFilter, examSearch]);

    const selectAllInCategory = (cat) => {
        const ids = (questions || []).filter((q) => q.category === cat).map((q) => q.questionId);
        setFormData((prev) => ({ ...prev, question_ids: Array.from(new Set([ ...prev.question_ids, ...ids ])) }));
    };

    const clearCategorySelection = (cat) => {
        const ids = new Set((questions || []).filter((q) => q.category === cat).map((q) => q.questionId));
        setFormData((prev) => ({ ...prev, question_ids: prev.question_ids.filter((id) => !ids.has(id)) }));
    };

    const copyRef = async (ref) => {
        try {
            await navigator.clipboard.writeText(ref);
            window.showAlert('Reference copied', 'success');
        } catch (e) {
            console.error(e);
            window.showAlert('Copy failed', 'error');
        }
    };

    // Modal state for preview
    const [previewExam, setPreviewExam] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const openPreview = async (id) => {
        try {
            const res = await fetch(`/evaluator/department-exams/${id}?as=json`, { headers: { 'Accept': 'application/json' } });
            const data = await res.json();
            setPreviewExam(data);
            setShowPreview(true);
        } catch (e) {
            console.error(e);
            window.showAlert('Failed to load exam preview', 'error');
        }
    };

    // Simple counts for header
    const totalExams = (exams || []).length;
    const activeExams = (exams || []).filter(e => Number(e.status) === 1).length;

    return (
        <>
            <Head title="Department Exams" />
            
            <Layout user={user} routes={routes}>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                        Department Exams
                                    </h2>
                                    <p className="text-blue-100 text-sm md:text-base">
                                        Manage personalized exams for {evaluator?.Department || 'your department'}.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowCreateForm(!showCreateForm)}
                                    className={`font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${showCreateForm ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showCreateForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
                                    </svg>
                                    <span>{showCreateForm ? 'Close' : 'Create Exam'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-blue-600">{exams?.length || 0}</div>
                            <div className="text-sm text-gray-600">Total Exams</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-green-600">
                                {exams?.reduce((sum, exam) => sum + exam.total_questions, 0) || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total Questions</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-purple-600">
                                {exams?.reduce((sum, exam) => sum + exam.total_students, 0) || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total Students</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-orange-600">{evaluator?.Department || 'N/A'}</div>
                            <div className="text-sm text-gray-600">Department</div>
                        </div>
                    </div>

                    {/* Create Exam Form */}
                    {showCreateForm && (
                        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Exam</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title</label>
                                        <input
                                            value={formData.exam_title}
                                            onChange={(e) => setFormData({ ...formData, exam_title: e.target.value })}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., BSIT Midterm 2025"
                                            required
                                        />
                                    </div>
                        
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={formData.time_limit}
                                            onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value || '0') })}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                              
                                {/* Exam type selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input type="radio" value="manual" checked={formData.exam_type === 'manual'} onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })} className="mr-2" />
                                            Manual Selection - Choose specific questions
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" value="random" checked={formData.exam_type === 'random'} onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })} className="mr-2" />
                                            Random Generation - Specify number of questions per category
                                        </label>
                                    </div>
                                </div>

                                {/* Random configuration */}
                                {formData.exam_type === 'random' && (
                                    <div className="mt-2">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Questions per Category</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {categories?.map((c) => (
                                                <div key={c} className="flex items-center gap-2">
                                                    <label className="w-40 text-sm text-gray-700">{c}</label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={formData.category_counts[c] || 0}
                                                        onChange={(e) => setFormData({ ...formData, category_counts: { ...formData.category_counts, [c]: parseInt(e.target.value || '0') } })}
                                                        className="w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <span className="text-xs text-gray-500">max { (questions || []).filter(q => q.category === c).length }</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Question selection */}
                                <div className="mt-2">
                                    {formData.exam_type === 'manual' && (
                                    <>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-700">Selected: <span className="font-semibold text-blue-600">{formData.question_ids.length}</span></span>
                                        <span className="text-xs text-gray-500">Choose from your department question bank</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto p-2 border rounded-lg">
                                        {Object.entries(questionsByCategory).map(([cat, list]) => (
                                            <div key={cat} className="border rounded-lg">
                                                <div className="px-3 py-2 bg-gray-50 border-b text-sm font-medium text-gray-700">{cat}</div>
                                                <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                                                    {list.map((q) => (
                                                        <label key={q.questionId} className="flex items-start gap-2 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.question_ids.includes(q.questionId)}
                                                                onChange={() => toggleQuestion(q.questionId)}
                                                                className="mt-1"
                                                            />
                                                            <span className="text-gray-800">
                                                                {q.question?.length > 120 ? `${q.question.slice(0, 120)}...` : q.question}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {Object.keys(questionsByCategory).length === 0 && (
                                            <div className="text-center text-sm text-gray-500 col-span-2 py-6">No questions match the current filters.</div>
                                        )}
                                    </div>
                                    </>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create Exam</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Content */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Existing Exams</h3>
                                <span className="text-xs text-gray-500">{(exams||[]).length} exam • {(exams||[]).filter(e => Number(e.status) === 1).length} active</span>
                            </div>
                            
                            {filteredExams && filteredExams.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredExams.map((exam) => (
                                        <div key={exam.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h4 className="text-lg font-semibold text-gray-900">{exam.title}</h4>
                                                        <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">{exam.exam_ref_no}</span>
                                                        <button onClick={() => copyRef(exam.exam_ref_no)} title="Copy reference" className="text-xs text-blue-700 hover:text-blue-900 underline">Copy</button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                        <div>
                                                            <span className="font-medium">Questions:</span> {exam.total_questions}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Students:</span> {exam.total_students}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Status:</span>{' '}
                                                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${Number(exam.status) === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {Number(exam.status) === 1 ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Created:</span> {exam.created_at}
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 text-sm text-gray-500">
                                                        Created by: {exam.evaluator_name}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => openPreview(exam.id)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setTogglingId(exam.id);
                                                            router.put(`/evaluator/department-exams/${exam.id}`, { status: Number(exam.status) === 1 ? 0 : 1 }, {
                                                                onStart: () => setTogglingId(exam.id),
                                                                onSuccess: () => window.showAlert('Exam status updated', 'success'),
                                                                onError: () => window.showAlert('Failed to update exam status', 'error'),
                                                                onFinish: () => setTogglingId(null)
                                                            });
                                                        }}
                                                        className={`${Number(exam.status) === 1 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'} text-sm px-3 py-1 rounded transition-colors disabled:opacity-60`}
                                                        disabled={togglingId === exam.id}
                                                    >
                                                        {togglingId === exam.id ? 'Please wait…' : (Number(exam.status) === 1 ? 'Set Inactive' : 'Set Active')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="mt-2 text-gray-600">No exams found. Create your first exam to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview Modal */}
                {showPreview && previewExam && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl mx-4 border border-black max-h-[85vh] overflow-y-auto">
                            <div className="flex items-center justify-between px-5 py-4 border-b">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">{previewExam.exam_title}</h2>
                                    <p className="text-xs text-gray-500">Ref: {previewExam.exam_ref_no} • {previewExam.time_limit} minutes</p>
                                </div>
                                <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                            </div>
                            <div className="p-5">
                                {previewExam.questions && previewExam.questions.length > 0 ? (
                                    <div className="space-y-4">
                                        {previewExam.questions.map((q, idx) => (
                                            <div key={q.questionId} className="border rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-medium text-gray-900">{idx + 1}. {q.question}</h3>
                                                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">Answer: {q.correct_answer}</span>
                                                </div>
                                                <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-gray-700">
                                                    <li>A. {q.option1}</li>
                                                    <li>B. {q.option2}</li>
                                                    <li>C. {q.option3}</li>
                                                    <li>D. {q.option4}</li>
                                                    {q.option5 && <li>E. {q.option5}</li>}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500">No questions linked to this exam.</div>
                                )}
                            </div>
                            <div className="px-5 py-4 border-t flex justify-end">
                                <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </Layout>
        </>
    );
}
