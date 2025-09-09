// client/src/pages/CreateComplaint.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaint } from '../services/api';


export default function CreateComplaint() {
    const navigate = useNavigate();
    const [form, setForm] = useState(() => {
        // Initialize with draft data if available
        const draft = localStorage.getItem('complaintDraft');
        if (draft) {
            try {
                const draftData = JSON.parse(draft);
                localStorage.removeItem('complaintDraft'); // Clear after loading
                return {
                    restaurantName: draftData.restaurantName || '',
                    itemName: draftData.itemName || '',
                    title: draftData.title || '',
                    description: draftData.description || '',
                    userName: draftData.userName || '',
                    postId: draftData.postId || '',
                };
            } catch (e) {
                console.error('Failed to load complaint draft:', e);
            }
        }
        return {
            restaurantName: '',
            itemName: '',
            title: '',
            description: '',
            userName: '',
            postId: '',
        };
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');


    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });


    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const payload = { ...form };
            if (!payload.userName) delete payload.userName; // default to Anonymous
            if (!payload.postId) delete payload.postId; // optional
            await createComplaint(payload);
            navigate('/complaints');
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to submit complaint');
        } finally {
            setSubmitting(false);
        }
    };


    return (
    <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Write a Complaint</h1>
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm mb-1">Restaurant Name *</label>
                <input
                    name="restaurantName"
                    value={form.restaurantName}
                    onChange={onChange}
                    className="w-full border rounded p-2"
                    required
                />
            </div>


            <div>
                <label className="block text-sm mb-1">Item Name (optional)</label>
                <input
                    name="itemName"
                    value={form.itemName}
                    onChange={onChange}
                    className="w-full border rounded p-2"
                />
            </div>


            <div>
                <label className="block text-sm mb-1">Title *</label>
                <input
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    className="w-full border rounded p-2"
                    required
                />
            </div>


            <div>
                <label className="block text-sm mb-1">Description *</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    className="w-full border rounded p-2 min-h-[120px]"
                    required
                />
            </div> 
            <div>
                <label className="block text-sm mb-1">Your name (optional)</label>
                <input
                    name="userName"
                    value={form.userName}
                    onChange={onChange}
                    className="w-full border rounded p-2"
                    placeholder="Anonymous"
                />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
                type="submit"
                className="bg-black text-white rounded px-4 py-2 disabled:opacity-60"
                disabled={submitting}
            >
                {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
        </form>
    </main>
    );
}   


            