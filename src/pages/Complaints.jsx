// client/src/pages/Complaints.jsx
import { useEffect, useMemo, useState } from 'react';
import { fetchComplaints, updateComplaintStatus } from '../services/api';
import { useAuth } from '../contexts/AuthContext';


export default function Complaints() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    const { user, isAuthenticated } = useAuth();


    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetchComplaints({ q: query || undefined, status: status || undefined });
            setData(res);
        } catch (err) {
            setError('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        load();
// eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const filtered = useMemo(() => data, [data]);


    const onStatusChange = async (id, next) => {
        try {
            const updated = await updateComplaintStatus(id, next);
            setData((prev) => prev.map((c) => (c._id === id ? updated : c)));
        } catch (e) {
            alert('Failed to update status');
        }
    };


    return (
        <main className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
                <h1 className="text-2xl font-semibold">My Complaints</h1>
                <div className="flex gap-2">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by text or restaurant"
                        className="border rounded p-2"
                    />
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded p-2">
                        <option value="">Any status</option>
                        <option value="open">Open</option>
                        <option value="in_review">In review</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <button onClick={load} className="border rounded px-3">Filter</button>
                </div>
            </div>


            {loading && <p>Loading…</p>}
            {error && <p className="text-red-600">{error}</p>}


            <ul className="grid md:grid-cols-2 gap-4">
                {filtered.map((c) => (
                    <li key={c._id} className="border rounded p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="font-semibold">{c.title}</h3>
                                <p className="text-sm text-gray-600">
                                    {c.restaurantName}
                                    {c.itemName ? ` • ${c.itemName}` : ''}
                                </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                                c.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                                c.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {c.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap">{c.description}</p>
                        <div className="mt-3 text-xs text-gray-600">by {c.userName || 'Anonymous'} • {new Date(c.createdAt).toLocaleString()}</div>


                        {user?.role === 'admin' || user?.role === 'superadmin' ? (
                            <div className="mt-3 flex gap-2">
                                <button onClick={() => onStatusChange(c._id, 'open')} className="border rounded px-2 py-1 text-xs">Mark Open</button>
                                <button onClick={() => onStatusChange(c._id, 'in_review')} className="border rounded px-2 py-1 text-xs">Mark In Review</button>
                                <button onClick={() => onStatusChange(c._id, 'resolved')} className="border rounded px-2 py-1 text-xs">Mark Resolved</button>
                            </div>
                        ) : null}
                    </li>
                ))}
            </ul>


            {!loading && filtered.length === 0 && (
                <p className="text-gray-600">No complaints yet. Be the first to file one!</p>
            )}
        </main>
    );
}