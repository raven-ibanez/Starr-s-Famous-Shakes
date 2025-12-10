import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Branch } from '@/types';
import { MapPin, X, Check } from 'lucide-react';

interface BranchSelectorProps {
    onSelect: (branch: Branch) => void;
    selectedBranchId?: string;
    isOpen: boolean;
    onClose: () => void;
    forced?: boolean; // If true, cannot close without selecting
}

export default function BranchSelector({ onSelect, selectedBranchId, isOpen, onClose, forced = false }: BranchSelectorProps) {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchBranches();
        }
    }, [isOpen]);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('branches')
                .select('*')
                .eq('is_active', true)
                .order('is_main', { ascending: false }) // Main branch first
                .order('name', { ascending: true });

            if (error) throw error;
            setBranches(data || []);
        } catch (error) {
            console.error('Error fetching branches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (branch: Branch) => {
        onSelect(branch);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-pink-500" />
                        Select Branch
                    </h2>
                    {!forced && (
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading branches...</div>
                    ) : branches.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No active branches found.</div>
                    ) : (
                        <div className="space-y-3">
                            {branches.map((branch) => (
                                <button
                                    key={branch.id}
                                    onClick={() => handleSelect(branch)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group relative ${selectedBranchId === branch.id
                                            ? 'border-pink-500 bg-pink-50'
                                            : 'border-gray-100 hover:border-pink-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`font-bold ${selectedBranchId === branch.id ? 'text-pink-700' : 'text-gray-900'}`}>
                                                {branch.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">{branch.address}</p>
                                            <p className="text-xs text-gray-400 mt-1">{branch.phone}</p>
                                        </div>
                                        {selectedBranchId === branch.id && (
                                            <div className="bg-pink-500 text-white p-1 rounded-full">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
