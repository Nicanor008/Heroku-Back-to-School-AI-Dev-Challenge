"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { apiRequest } from "@/utils/api";
import {
    Clock, BookOpen, Users, GraduationCap,
    Heart, Brain, Calendar, ChevronRight,
    AlertCircle, CheckCircle, Target, Edit3, Trash2,
    Download, Plus, Loader2, X, Save
} from "lucide-react";

interface PlanItem {
    id: string;
    time: string;
    category: string;
    activity: string;
    purpose: string;
}

interface PlanResponse {
    schedule: PlanItem[];
    phase: string;
    phaseDescription: string;
    challenges: string[];
    nextPhase: string | null;
}

export default function BackToSchoolPlannerWidget() {
    const { loading, setLoading, addNotification } = useStore();
    const [planData, setPlanData] = useState<PlanResponse | null>(null);
    const [selectedRole, setSelectedRole] = useState<'student' | 'parent' | 'educator'>('student');
    const [selectedPhase, setSelectedPhase] = useState<string>('first_week');
    const [subjects, setSubjects] = useState<string[]>(['Math', 'Science']);
    const [focusAreas, setFocusAreas] = useState<string[]>([]);
    const [customRequirements, setCustomRequirements] = useState<string>("");
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<PlanItem>>({});
    const [showCustomization, setShowCustomization] = useState(false);

    useEffect(() => {
        fetchBackToSchoolPlan();
    }, [selectedRole, selectedPhase]);

    const fetchBackToSchoolPlan = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const res: any = await apiRequest(
                "http://localhost:5000/api/planner/query",
                {
                    method: "POST",
                    body: {
                        role: selectedRole,
                        subjects,
                        phase: selectedPhase,
                        specificChallenges: [],
                        childrenAges: selectedRole === 'parent' ? [10, 13] : [],
                        focusAreas,
                        customRequirements
                    }
                }
            );

            console.log('Received back-to-school plan:', res);
            setPlanData(res.schedule);
            addNotification(`${selectedRole} plan updated for ${selectedPhase.replace('_', ' ')}`);
        } catch (error) {
            console.error('Failed to fetch back-to-school plan:', error);
            addNotification("Failed to fetch back-to-school plan");
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    const handleEditItem = (item: PlanItem) => {
        setEditingItem(item.id);
        setEditForm({ ...item });
    };

    const handleSaveEdit = () => {
        if (!planData || !editingItem) return;

        const updatedSchedule = planData.schedule.map(item =>
            item.id === editingItem ? { ...item, ...editForm } as PlanItem : item
        );

        setPlanData({ ...planData, schedule: updatedSchedule });
        setEditingItem(null);
        setEditForm({});
        addNotification("Activity updated successfully");
    };

    const handleDeleteItem = (itemId: string) => {
        if (!planData) return;

        const updatedSchedule = planData.schedule.filter(item => item.id !== itemId);
        setPlanData({ ...planData, schedule: updatedSchedule });
        addNotification("Activity deleted successfully");
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setEditForm({});
    };

    const handleAddFocusArea = (area: string) => {
        if (area && !focusAreas.includes(area)) {
            setFocusAreas([...focusAreas, area]);
        }
    };

    const handleRemoveFocusArea = (area: string) => {
        setFocusAreas(focusAreas.filter(f => f !== area));
    };

    const handleRemoveCustomRequirement = () => {
        setCustomRequirements("");
    };

    const handleNextPhase = () => {
        if (planData?.nextPhase) {
            setSelectedPhase(planData.nextPhase);
        }
    };

    const isLastPhase = selectedPhase === 'first_month';
    const canGoToNextPhase = planData?.nextPhase && !isLastPhase;

    const exportToCsv = () => {
        if (!planData) return;

        const headers = ['Time', 'Category', 'Activity', 'Purpose'];
        const csvContent = [
            headers.join(','),
            ...planData.schedule.map(item =>
                [item.time, item.category, `"${item.activity}"`, `"${item.purpose}"`].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `back-to-school-plan-${selectedRole}-${selectedPhase}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        addNotification("Schedule exported as CSV");
    };

    const exportToJson = () => {
        if (!planData) return;

        const exportData = {
            role: selectedRole,
            focusAreas,
            customRequirements,
            ...planData
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `back-to-school-plan-${selectedRole}-${selectedPhase}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        addNotification("Schedule exported as JSON");
    };

    const getCategoryIcon = (category: string) => {
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('morning') || categoryLower.includes('routine')) return <Clock className="w-4 h-4 text-blue-600" />;
        if (categoryLower.includes('academic') || categoryLower.includes('homework')) return <BookOpen className="w-4 h-4 text-purple-600" />;
        if (categoryLower.includes('family') || categoryLower.includes('support')) return <Users className="w-4 h-4 text-green-600" />;
        if (categoryLower.includes('classroom') || categoryLower.includes('teaching')) return <GraduationCap className="w-4 h-4 text-indigo-600" />;
        if (categoryLower.includes('organization') || categoryLower.includes('prep')) return <Target className="w-4 h-4 text-orange-600" />;
        if (categoryLower.includes('self-care') || categoryLower.includes('wellbeing')) return <Heart className="w-4 h-4 text-red-500" />;
        if (categoryLower.includes('social') || categoryLower.includes('emotional')) return <Brain className="w-4 h-4 text-teal-600" />;
        return <Calendar className="w-4 h-4 text-gray-600" />;
    };

    const getCategoryColor = (category: string) => {
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('morning') || categoryLower.includes('routine')) return 'bg-blue-50 border-l-blue-500';
        if (categoryLower.includes('academic') || categoryLower.includes('homework')) return 'bg-purple-50 border-l-purple-500';
        if (categoryLower.includes('family') || categoryLower.includes('support')) return 'bg-green-50 border-l-green-500';
        if (categoryLower.includes('classroom') || categoryLower.includes('teaching')) return 'bg-indigo-50 border-l-indigo-500';
        if (categoryLower.includes('organization') || categoryLower.includes('prep')) return 'bg-orange-50 border-l-orange-500';
        if (categoryLower.includes('self-care') || categoryLower.includes('wellbeing')) return 'bg-red-50 border-l-red-500';
        if (categoryLower.includes('social') || categoryLower.includes('emotional')) return 'bg-teal-50 border-l-teal-500';
        return 'bg-gray-50 border-l-gray-500';
    };

    const phases = [
        { key: '2_weeks_before', label: '2 Weeks Before', desc: 'Preparation phase' },
        { key: '1_week_before', label: '1 Week Before', desc: 'Final arrangements' },
        { key: 'first_week', label: 'First Week', desc: 'Adjustment period' },
        { key: 'first_month', label: 'First Month', desc: 'Building habits' }
    ];

    const commonFocusAreas = {
        student: ['Study Habits', 'Time Management', 'Organization', 'Social Skills', 'Self-Care', 'Homework Routine'],
        parent: ['Family Communication', 'Logistics', 'Emotional Support', 'Academic Support', 'Health & Nutrition', 'Scheduling'],
        educator: ['Classroom Management', 'Student Engagement', 'Parent Communication', 'Curriculum Planning', 'Assessment', 'Work-Life Balance']
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 transition hover:shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-[#4F46E5] font-bold text-xl flex items-center gap-2">
                        <GraduationCap className="w-6 h-6" />
                        Planner Assistant
                    </h2>
                    {planData && (
                        <p className="text-sm text-gray-600 mt-1">{planData.phaseDescription}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCustomization(!showCustomization)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Customize
                    </button>
                    <button
                        onClick={() => fetchBackToSchoolPlan()}
                        disabled={loading}
                        className="bg-[#6366F1] hover:bg-[#818CF8] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg shadow-md transition transform hover:scale-105 disabled:hover:scale-100 text-sm flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? 'Loading...' : 'Refresh Plan'}
                    </button>
                </div>
            </div>

            {/* Customization Panel */}
            {showCustomization && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                    <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Customize Your Plan
                    </h3>

                    <div className="space-y-4">
                        {/* Focus Areas */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Focus Areas:</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {focusAreas.map((area, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-[#6366F1] text-white text-xs rounded-full">
                                        {area}
                                        <button onClick={() => handleRemoveFocusArea(area)} className="hover:bg-red-500 rounded-full">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {commonFocusAreas[selectedRole].filter(area => !focusAreas.includes(area)).map((area, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAddFocusArea(area)}
                                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded transition"
                                    >
                                        + {area}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Requirements */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements or Preferences:</label>
                            <textarea
                                value={customRequirements}
                                onChange={(e) => setCustomRequirements(e.target.value)}
                                placeholder="e.g., Need to accommodate work schedule, child has learning difficulties, prefer morning activities..."
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                                rows={2}
                            />
                        </div>

                        <button
                            onClick={() => {
                                fetchBackToSchoolPlan();
                                setShowCustomization(false);
                            }}
                            className="bg-[#6366F1] hover:bg-[#818CF8] text-white px-4 py-2 rounded-lg text-sm transition"
                        >
                            Apply Customization
                        </button>
                    </div>
                </div>
            )}

            {/* Applied Customizations Display */}
            {(focusAreas.length > 0 || customRequirements) && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="flex items-center gap-2 font-medium text-green-800 mb-3">
                        <CheckCircle className="w-4 h-4" />
                        Applied Customizations:
                    </h3>

                    {focusAreas.length > 0 && (
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-green-700 mb-2">Focus Areas:</label>
                            <div className="flex flex-wrap gap-2">
                                {focusAreas.map((area, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border">
                                        {area}
                                        <button
                                            onClick={() => handleRemoveFocusArea(area)}
                                            className="hover:bg-green-200 rounded-full transition"
                                            title="Remove focus area"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {customRequirements && (
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-green-700 mb-2">Special Requirements:</label>
                            <div className="flex items-start gap-2">
                                <p className="text-sm text-green-600 bg-green-100 p-2 rounded flex-grow">
                                    {customRequirements}
                                </p>
                                <button
                                    onClick={handleRemoveCustomRequirement}
                                    className="p-1 text-green-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                                    title="Remove custom requirement"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setShowCustomization(true)}
                        className="text-xs text-green-700 hover:text-green-800 underline"
                    >
                        Edit customizations
                    </button>
                </div>
            )}

            {/* Role and Phase Selection */}
            <div className="mb-6 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Who are you?:</label>
                    <div className="flex gap-2">
                        {['student', 'parent', 'educator'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setSelectedRole(role as any)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                    selectedRole === role
                                        ? 'bg-[#6366F1] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-700 mb-2 font-bold">Planning Phase:</label>
                    <div className="grid grid-cols-2 gap-2">
                        {phases.map((phase) => (
                            <button
                                key={phase.key}
                                onClick={() => setSelectedPhase(phase.key)}
                                disabled={loading}
                                className={`p-3 rounded-lg text-left transition ${
                                    selectedPhase === phase.key
                                        ? 'bg-[#6366F1] text-white'
                                        : 'bg-gray-50 hover:bg-gray-100 text-black'
                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="font-medium text-sm">{phase.label}</div>
                                <div className="text-xs opacity-80">{phase.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="mb-6 p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#6366F1]" />
                    <p className="text-gray-600">Generating your personalized back-to-school plan...</p>
                    <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
                </div>
            )}

            {/* Challenges Being Addressed */}
            {!loading && planData && planData.challenges && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="flex items-center gap-2 font-medium text-yellow-800 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        Key Planning Focus:
                    </h3>
                    <ul className="space-y-1">
                        {planData.challenges.map((challenge, idx) => (
                            <li key={idx} className="text-sm text-yellow-700 flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                                {challenge}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Export Options */}
            {!loading && planData && planData.schedule.length > 0 && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">Export & Share:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={exportToCsv}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                            >
                                <Download className="w-3 h-3" />
                                CSV
                            </button>
                            <button
                                onClick={exportToJson}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                            >
                                <Download className="w-3 h-3" />
                                JSON
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule */}
            {!loading && (!planData || planData.schedule.length === 0) ? (
                <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No back-to-school plan available</p>
                    <p className="text-sm text-gray-400 mt-1">Select your role and phase, then click refresh</p>
                </div>
            ) : !loading ? (
                <div className="space-y-3">
                    {planData!.schedule.map((item, idx) => (
                        <div
                            key={item?.id + idx}
                            className={`border-l-4 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getCategoryColor(item.category)}`}
                        >
                            {editingItem === item.id ? (
                                // Edit Form
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={editForm.time || ''}
                                            onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                                            className="p-2 border border-gray-300 rounded text-sm"
                                            placeholder="Time"
                                        />
                                        <input
                                            type="text"
                                            value={editForm.category || ''}
                                            onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                            className="p-2 border border-gray-300 rounded text-sm"
                                            placeholder="Category"
                                        />
                                    </div>
                                    <textarea
                                        value={editForm.activity || ''}
                                        onChange={(e) => setEditForm({...editForm, activity: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                                        rows={2}
                                        placeholder="Activity"
                                    />
                                    <textarea
                                        value={editForm.purpose || ''}
                                        onChange={(e) => setEditForm({...editForm, purpose: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                                        rows={2}
                                        placeholder="Purpose"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveEdit}
                                            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex items-center gap-1 px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 transition"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Display Mode
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getCategoryIcon(item.category)}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <span className="font-semibold text-sm text-gray-800">
                                                    {item.time}
                                                </span>
                                                <span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-80 text-gray-700">
                                                    {item.category}
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEditItem(item)}
                                                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm leading-relaxed text-gray-700 mb-2">
                                            {item.activity}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-gray-600 italic">
                                            <Target className="w-3 h-3" />
                                            <span>{item.purpose}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : null}

            {/* Next Phase Suggestion */}
            {!loading && planData && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            {canGoToNextPhase ? (
                                <>
                                    <h3 className="font-medium text-blue-800 mb-1">Ready for the Next Phase?</h3>
                                    <p className="text-sm text-blue-600">
                                        Consider planning for: {planData.nextPhase!.replace('_', ' ')}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className="font-medium text-blue-800 mb-1">Planning Complete!</h3>
                                    <p className="text-sm text-blue-600">
                                        You've completed all back-to-school phases. Great work!
                                    </p>
                                </>
                            )}
                        </div>
                        {canGoToNextPhase ? (
                            <button
                                onClick={handleNextPhase}
                                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                            >
                                Next Phase <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={() => setSelectedPhase('2_weeks_before')}
                                className="flex items-center gap-1 px-3 py-2 bg-gray-400 text-white text-sm rounded-lg hover:bg-gray-500 transition"
                            >
                                Start Over <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Summary */}
            {!loading && planData && planData.schedule.length > 0 && (
                <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {planData.schedule.length} activities planned for {selectedRole}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {selectedPhase.replace('_', ' ')} phase
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
