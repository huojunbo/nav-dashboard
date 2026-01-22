import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DEFAULT_LINKS = [
    { id: '1', name: 'GitHub', url: 'https://github.com' },
    { id: '2', name: 'YouTube', url: 'https://youtube.com' },
    { id: '3', name: 'Gmail', url: 'https://mail.google.com' },
    { id: '4', name: 'ChatGPT', url: 'https://chat.openai.com' },
    { id: '5', name: 'DeepL', url: 'https://www.deepl.com' },
    { id: '6', name: 'Google Cloud', url: 'https://cloud.google.com' },
];

const getFaviconUrl = (url) => {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
        return null;
    }
};

const LinkModal = ({ isOpen, onClose, onSave, initialData }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || '');
            setUrl(initialData?.url || '');
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, url });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in-up">
                <h3 className="text-xl font-bold text-white mb-4">
                    {initialData ? t('links.editLink') : t('links.addLink')}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">{t('links.name')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder={t('links.namePlaceholder')}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">{t('links.url')}</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder={t('links.urlPlaceholder')}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const LinkGrid = () => {
    const { t } = useTranslation();
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null);

    // Fetch links from API
    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const response = await fetch(`${API_BASE}/links`);
            if (!response.ok) throw new Error('Failed to fetch links');
            const data = await response.json();
            setLinks(data);
        } catch (error) {
            console.error('Error fetching links:', error);
            // Fallback to localStorage
            const saved = localStorage.getItem('nav-dashboard-links');
            if (saved) {
                setLinks(JSON.parse(saved));
            } else {
                setLinks(DEFAULT_LINKS);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingLink) {
                // Update existing link
                const response = await fetch(`${API_BASE}/links/${editingLink.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (!response.ok) throw new Error('Failed to update link');
                const updated = await response.json();
                setLinks(links.map(l => l.id === editingLink.id ? updated : l));
            } else {
                // Create new link
                const response = await fetch(`${API_BASE}/links`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (!response.ok) throw new Error('Failed to create link');
                const created = await response.json();
                setLinks([...links, created]);
            }
        } catch (error) {
            console.error('Error saving link:', error);
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(t('links.deleteConfirm'))) return;

        try {
            const response = await fetch(`${API_BASE}/links/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete link');
            setLinks(links.filter(l => l.id !== id));
        } catch (error) {
            console.error('Error deleting link:', error);
        }
    };

    const handleEdit = (e, link) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingLink(link);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingLink(null);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <div className="col-span-full text-center text-slate-400 py-12">{t('links.loading')}</div>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {/* Render Links */}
                {links.map((link) => (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl 
                       hover:bg-white/10 hover:scale-105 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                    >
                        {/* Action Buttons (visible on hover) */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => handleEdit(e, link)}
                                className="p-1.5 rounded-full bg-slate-800/80 hover:bg-blue-500 text-slate-300 hover:text-white transition-colors"
                                title="Edit"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={(e) => handleDelete(e, link.id)}
                                className="p-1.5 rounded-full bg-slate-800/80 hover:bg-red-500 text-slate-300 hover:text-white transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="mb-3 p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors shadow-inner overflow-hidden">
                            <img
                                src={getFaviconUrl(link.url)}
                                alt={link.name}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <Globe className="w-8 h-8 text-slate-400 hidden" />
                        </div>
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate w-full text-center">
                            {link.name}
                        </span>
                    </a>
                ))}

                {/* Add New Link Card */}
                <button
                    onClick={openAddModal}
                    className="flex flex-col items-center justify-center p-6 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl
                     hover:bg-white/10 hover:border-blue-500/50 hover:text-blue-400 transition-all duration-300 group"
                >
                    <div className="mb-3 p-3 rounded-full bg-white/5 group-hover:bg-blue-500/20 transition-colors">
                        <Plus className="w-8 h-8 text-slate-400 group-hover:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-400 group-hover:text-blue-400">{t('links.addLink')}</span>
                </button>
            </div>

            <LinkModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingLink}
            />
        </>
    );
};

export default LinkGrid;
