import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import discussionService from '../../services/discussionService';

export default function CreateDiscussion() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        topic: '',
        content: '',
        visibility: 'public',
    });

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const hasMembership = user && (
        user.role === 'community' ||
        (user.membership && ['representative', 'member'].includes(user.membership.role))
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Ensure community is attached if user has a membership
            const submitData = { ...formData };
            if (user?.membership?.community) {
                submitData.community = user.membership.community;
            } else if (user?.role === 'community') {
                submitData.community = user.id;
            }

            await discussionService.createDiscussion(submitData);
            navigate('/discussions');
        } catch (error) {
            console.error("Failed to create discussion", error);
            alert("Failed to post discussion. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
            <Navbar navSolid={true} />
            <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Start a New Discussion</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                            <input
                                type="text"
                                name="topic"
                                value={formData.topic}
                                onChange={handleChange}
                                required
                                placeholder="What's on your mind?"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                required
                                rows={6}
                                placeholder="Elaborate on your topic..."
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition resize-none text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                            <select
                                name="visibility"
                                value={formData.visibility}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white text-gray-500"
                            >
                                <option value="public">Public</option>
                                <option value="private" disabled={!hasMembership}>
                                    Private (Community Only) {!hasMembership && "(Membership Required)"}
                                </option>
                            </select>
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/discussions')}
                                className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition shadow-sm disabled:opacity-70 flex items-center gap-2"
                            >
                                {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                                Post Discussion
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
